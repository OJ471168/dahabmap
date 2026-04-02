import React, { useState, useEffect, useMemo, useRef } from 'react';
import MapController, { MapControllerHandle } from './components/MapController';
import ControlPanel from './components/ControlPanel';
import { Store, LatLng } from './types';
import { STORE_DATA } from './constants';

export default function App() {
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [closestStores, setClosestStores] = useState<Store[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [isMobileCollapsed, setIsMobileCollapsed] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState('');

  const [flyToStore, setFlyToStore] = useState<Store | null>(null);
  const [resetMap, setResetMap] = useState(false);
  const mapRef = useRef<MapControllerHandle>(null);

  useEffect(() => {
    if (locationError) {
      const timer = setTimeout(() => setLocationError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [locationError]);

  const cities = useMemo(() => {
    const cityMap: { [key: string]: number } = {};
    STORE_DATA.forEach(s => { cityMap[s.city] = (cityMap[s.city] || 0) + 1; });
    return Object.entries(cityMap).sort((a, b) => a[0].localeCompare(b[0], 'fr'));
  }, []);

  // Browse stores filtered by city (when no geolocation active)
  const browseStores = useMemo(() => {
    if (!selectedCity) return [];
    return STORE_DATA
      .filter(s => s.city === selectedCity)
      .map(s => ({ ...s, originalIndex: STORE_DATA.indexOf(s) }));
  }, [selectedCity]);

  const handleToggleLocation = () => {
    if (userLocation) {
      setUserLocation(null);
      setIsLocating(false);
      setIsPanelVisible(false);
      setIsMobileCollapsed(false);
      setClosestStores([]);
      setResetMap(true);
      setTimeout(() => setResetMap(false), 100);
    } else {
      setLocationError(null);
      setIsLocating(true);
      setIsPanelVisible(true);
      setIsMobileCollapsed(false);
      // Call locate directly (Safari requires user gesture chain)
      mapRef.current?.locate();
    }
  };

  const handleLocationFound = (latlng: LatLng) => {
    setUserLocation(latlng);
    setIsLocating(false);
    setLocationError(null);
  };

  const handleStoresSorted = (stores: Store[]) => {
      setClosestStores(stores);
  };

  const handleStoreClick = (store: Store) => {
    setFlyToStore(store);
    setTimeout(() => setFlyToStore(null), 100);
    setIsMobileCollapsed(true);
  };

  const handleResetView = () => {
    setResetMap(true);
    setTimeout(() => setResetMap(false), 100);
  };

  const handleMobileTogglePanel = () => {
    setIsMobileCollapsed(prev => !prev);
  };

  const handleLocationError = (code: number) => {
    setIsLocating(false);
    setIsPanelVisible(false);
    switch (code) {
      case 1:
        setLocationError("Accès à la localisation refusé. Activez-la dans les paramètres de votre navigateur.");
        break;
      case 2:
        setLocationError("Position indisponible. Vérifiez votre connexion ou vos paramètres GPS.");
        break;
      case 3:
        setLocationError("Délai de localisation dépassé. Réessayez.");
        break;
      default:
        setLocationError("Impossible d'accéder à votre position.");
    }
  };

  const handleCityClick = (city: string) => {
    if (selectedCity === city) {
      setSelectedCity('');
      handleResetView();
    } else {
      setSelectedCity(city);
    }
  };

  const storeCount = STORE_DATA.length;
  const cityCount = new Set(STORE_DATA.map(s => s.city)).size;

  // Desktop: determine what to show in the sidebar
  const desktopDisplayStores = isPanelVisible ? closestStores : browseStores;
  const showDesktopSidebar = isPanelVisible || browseStores.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-coffee-foam font-sans">
      <style>{`
        .leaflet-popup-content-wrapper {
            border-radius: 12px; padding: 0; overflow: hidden;
            box-shadow: 0 10px 30px rgba(44, 36, 27, 0.25); border: none;
        }
        .leaflet-popup-content { margin: 0; width: 230px !important; }

        .leaflet-container a.leaflet-popup-close-button {
            top: 8px; right: 8px; color: white; font-size: 18px; width: 24px; height: 24px;
            background: rgba(0,0,0,0.3); border-radius: 50%;
            display: flex; align-items: center; justify-content: center; text-shadow: none; z-index: 10;
        }
        .leaflet-container a.leaflet-popup-close-button:hover { background: #C59D5F; color: white; }

        .popup-card { display: flex; flex-direction: column; font-family: 'Inter', sans-serif; }
        .popup-header {
            height: 100px; width: 100%; background-color: #222;
            background-image: url('https://vlrbeemaxxdqiczdxomd.supabase.co/storage/v1/object/public/events_images/dahab-cafe.jpg');
            background-size: cover; background-position: center; position: relative;
        }
        .popup-header::after {
            content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 3px; background: #C59D5F;
        }

        .popup-body { padding: 16px; text-align: center; background: white; }
        .popup-title { font-size: 17px; font-weight: 800; margin: 0 0 4px 0; color: #2C241B; line-height: 1.2; }
        .popup-city { font-size: 12px; color: #999; margin-bottom: 15px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

        .btn-navigate {
            display: flex; align-items: center; justify-content: center; gap: 8px;
            width: 100%; padding: 12px 0;
            background: #C59D5F; color: white !important;
            text-decoration: none !important; border-radius: 6px; font-size: 13px; font-weight: 700;
            transition: all 0.2s; box-sizing: border-box;
            text-shadow: 0 1px 1px rgba(0,0,0,0.1);
        }
        .btn-navigate:hover { background: #2C241B; }
        .btn-navigate svg { width: 16px; height: 16px; fill: white; }

        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        @media (max-width: 768px) {
            .leaflet-control-zoom { display: none; }
        }
      `}</style>

      {/* ===== HEADER ===== */}
      <header className="bg-white border-b-[3px] border-coffee-gold shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4 md:py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="shrink-0">
            <img
              src="/logodahab2.png"
              alt="Dahab Coffee"
              className="w-[140px] md:w-[180px] object-contain"
              onError={(e) => {
                const el = e.target as HTMLImageElement;
                el.style.display = 'none';
                el.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden flex items-center gap-3">
              <span className="text-3xl">☕</span>
              <div>
                <h1 className="text-coffee-dark font-extrabold text-xl md:text-2xl leading-tight">Dahab Coffee</h1>
                <p className="text-coffee-gold text-[11px] font-semibold uppercase tracking-[1.5px]">Localisateur de cafés</p>
              </div>
            </div>
          </div>
          <img
            src="/MAP-DAHAB-VILLES1.png"
            alt="Dahab Coffee - Points de vente au Maroc"
            className="h-12 md:h-16 object-contain"
          />
        </div>
      </header>

      {/* ===== ERROR TOAST ===== */}
      {locationError && (
        <div className="fixed bottom-[120px] max-md:bottom-[130px] left-1/2 -translate-x-1/2 z-[3000] max-w-[90vw] w-[400px] pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md border border-red-200 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] px-4 py-3 flex items-start gap-3">
            <span className="text-red-500 text-lg shrink-0 mt-0.5">⚠</span>
            <p className="text-sm text-coffee-text font-medium leading-snug flex-1">{locationError}</p>
            <button
              onClick={() => setLocationError(null)}
              className="text-[#ccc] hover:text-coffee-text text-lg leading-none shrink-0 cursor-pointer bg-transparent border-none p-0"
              aria-label="Fermer"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* ===== TOOLBAR: City chips in 2 lines (desktop only) ===== */}
      <div className="hidden md:block bg-white border-b border-[#eee] shrink-0">
        <div className="max-w-7xl mx-auto px-5 py-3">
          <div className="flex flex-wrap items-center gap-2">
            {cities.map(([city, count]) => (
              <button
                key={city}
                onClick={() => handleCityClick(city)}
                className={`
                  px-3 py-1.5 rounded-full text-[12px] font-semibold
                  cursor-pointer transition-all duration-200 border
                  ${selectedCity === city
                    ? 'bg-coffee-gold text-white border-coffee-gold'
                    : 'bg-white text-coffee-text border-[#e0e0e0] hover:border-coffee-gold hover:text-coffee-gold'
                  }
                `}
              >
                {city} <span className={`text-[10px] ${selectedCity === city ? 'text-white/70' : 'text-[#bbb]'}`}>{count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== MAIN ===== */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden md:bg-coffee-foam">

        {/* Desktop Left Panel — Morocco map image OR results list */}
        <aside className="hidden md:flex flex-col w-[380px] shrink-0 bg-white border-r border-[#eee]">
          {showDesktopSidebar ? (
            <>
              <div className="px-[18px] py-[12px] bg-coffee-dark border-b-[3px] border-coffee-gold text-[11px] font-bold text-coffee-gold uppercase tracking-[1px] flex items-center justify-between shrink-0">
                <span className="flex items-center gap-[6px]">
                  ☕ {isPanelVisible ? 'Proches de vous' : selectedCity}
                </span>
                <button
                  onClick={() => { handleResetView(); setSelectedCity(''); setIsPanelVisible(false); setClosestStores([]); }}
                  className="text-[10px] text-coffee-gold/70 hover:text-white font-semibold uppercase tracking-[0.5px] cursor-pointer bg-transparent border-none p-0"
                >
                  Fermer
                </button>
              </div>
              <div className="overflow-y-auto flex-1">
                {(isPanelVisible && closestStores.length === 0) ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="px-[18px] py-[14px] border-b border-[#eee] flex justify-between items-center">
                      <div className="flex flex-col gap-[6px]">
                        <div className="w-[140px] h-[16px] rounded bg-gradient-to-r from-[#f0f0f0] via-[#e0e0e0] to-[#f0f0f0] bg-[length:200%_100%] animate-shimmer"></div>
                        <div className="w-[80px] h-[12px] rounded bg-gradient-to-r from-[#f0f0f0] via-[#e0e0e0] to-[#f0f0f0] bg-[length:200%_100%] animate-shimmer"></div>
                      </div>
                      <div className="w-[20px] h-[20px] rounded-full bg-gradient-to-r from-[#f0f0f0] via-[#e0e0e0] to-[#f0f0f0] bg-[length:200%_100%] animate-shimmer"></div>
                    </div>
                  ))
                ) : desktopDisplayStores.length > 0 ? (
                  desktopDisplayStores.map((store, i) => (
                    <div
                      key={i}
                      onClick={() => handleStoreClick(store)}
                      className="px-[18px] py-[14px] border-b border-[#eee] cursor-pointer flex items-center justify-between transition-colors duration-200 hover:bg-coffee-foam group last:border-b-0"
                    >
                      <div className="flex flex-col">
                        <div className="text-[15px] font-bold text-coffee-text mb-[2px]">{store.title}</div>
                        <div className="text-[11px] text-[#aaa] font-semibold uppercase tracking-[0.3px] mb-[2px]">{store.city}</div>
                        {store.dist !== undefined && (
                          <div className="text-[12px] text-[#888] font-medium flex items-center gap-[4px]">
                            <span className="inline-block text-[10px] text-coffee-gold animate-steam">♨</span>
                            {store.dist >= 1000 ? (store.dist / 1000).toFixed(1) + " km" : Math.round(store.dist) + " m"}
                          </div>
                        )}
                      </div>
                      <div className="text-[#ddd] text-[20px] transition-transform duration-200 group-hover:text-coffee-gold group-hover:translate-x-[3px]">›</div>
                    </div>
                  ))
                ) : null}
              </div>
            </>
          ) : (
            /* Morocco map image when no results */
            <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
              <img
                src="https://dahabcoffee.ma/wp-content/uploads/2025/09/MAP-DAHAB1-1536x1171.jpg"
                alt="Carte des cafés Dahab au Maroc"
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </aside>

        {/* Map */}
        <div className="flex-1 relative md:p-5" style={{ minHeight: '75vh' }}>
          <div className="md:rounded-2xl md:border md:border-[#ddd] md:shadow-[0_4px_20px_rgba(44,36,27,0.1)] overflow-hidden absolute inset-0 md:relative md:inset-auto md:w-full md:h-full bg-[#E5E9EC]">
            <MapController
                ref={mapRef}
                stores={STORE_DATA}
                resetMap={resetMap}
                flyToStore={flyToStore}
                onLocationFound={handleLocationFound}
                onLocationError={handleLocationError}
                onSortedStores={handleStoresSorted}
            />

            {/* Desktop: Find button inside map */}
            <button
              onClick={handleToggleLocation}
              className={`
                hidden md:flex absolute top-4 left-4 z-[1000]
                px-5 py-2.5 rounded-full items-center gap-2
                transition-all duration-300 font-bold text-[13px] cursor-pointer border
                shadow-[0_4px_20px_rgba(44,36,27,0.15)]
                backdrop-blur-md
                ${userLocation
                  ? 'bg-coffee-gold/90 text-white border-white/20 hover:bg-coffee-dark/90'
                  : isLocating
                    ? 'bg-white/80 text-coffee-gold border-coffee-gold animate-pulse-gold'
                    : 'bg-white/80 text-coffee-dark border-white/30 hover:bg-coffee-gold/90 hover:text-white hover:border-coffee-gold'
                }
              `}
            >
              <span className="text-[16px]">☕</span>
              <span>
                {isLocating && !userLocation
                  ? "Recherche..."
                  : userLocation
                    ? "Arrêter"
                    : "Trouver mon café Dahab"}
              </span>
            </button>
          </div>

          {/* Mobile Overlay Controls — hidden on desktop */}
          <div className="md:hidden absolute bottom-[60px] left-0 z-[1000] flex flex-col gap-[12px] items-center w-full pointer-events-none">
            <ControlPanel
                isLocating={isLocating}
                userLocation={userLocation}
                onToggle={handleToggleLocation}
                closestStores={closestStores}
                isPanelVisible={isPanelVisible}
                isMobileCollapsed={isMobileCollapsed}
                onMobileTogglePanel={handleMobileTogglePanel}
                onStoreClick={handleStoreClick}
                onResetView={handleResetView}
                allStores={STORE_DATA}
                isDesktop={false}
            />
          </div>
        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="bg-coffee-dark border-t-[3px] border-coffee-gold shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-white/40 text-[12px] font-medium">
            © 2026 Dahab Coffee. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4 text-[12px] font-medium">
            <span className="text-white/40">Trouvez votre café le plus proche au Maroc</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
