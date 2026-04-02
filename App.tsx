import React, { useState, useEffect } from 'react';
import MapController from './components/MapController';
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

  const [flyToStore, setFlyToStore] = useState<Store | null>(null);
  const [triggerLocate, setTriggerLocate] = useState(false);
  const [resetMap, setResetMap] = useState(false);

  useEffect(() => {
    if (locationError) {
      const timer = setTimeout(() => setLocationError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [locationError]);

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
      setTriggerLocate(true);
      setTimeout(() => setTriggerLocate(false), 100);
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

  const storeCount = STORE_DATA.length;
  const cityCount = new Set(STORE_DATA.map(s => s.city)).size;

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

        @media (max-width: 768px) {
            .leaflet-control-zoom { display: none; }
        }
      `}</style>

      {/* ===== HEADER ===== */}
      <header className="bg-white border-b-[3px] border-coffee-gold shrink-0 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-6 md:py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Brand + Stats */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">☕</span>
              <div>
                <h1 className="text-coffee-dark font-extrabold text-xl md:text-2xl leading-tight">Dahab Coffee</h1>
                <p className="text-coffee-gold text-[11px] font-semibold uppercase tracking-[1.5px]">Localisateur de cafés</p>
              </div>
            </div>
            {/* Stats row matching brand images */}
            <div className="flex items-center gap-6 md:gap-8">
              <div className="flex items-baseline gap-1.5">
                <span className="text-coffee-gold font-extrabold text-3xl md:text-4xl italic leading-none">+{storeCount}</span>
                <span className="text-coffee-dark font-extrabold text-[11px] md:text-[13px] uppercase tracking-[1px] leading-tight">Points<br/>de vente</span>
              </div>
              <div className="w-[2px] h-10 bg-coffee-gold/20 rounded-full"></div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-coffee-gold font-extrabold text-3xl md:text-4xl italic leading-none">+{cityCount}</span>
                <span className="text-coffee-dark font-extrabold text-[11px] md:text-[13px] uppercase tracking-[1px] leading-tight">Villes<br/>au Maroc</span>
              </div>
            </div>
          </div>

          {/* Right: Morocco map image */}
          <div className="hidden md:block shrink-0">
            <img
              src="https://vlrbeemaxxdqiczdxomd.supabase.co/storage/v1/object/public/events_images/dahab-maroc-map.png"
              alt="Carte des cafés Dahab au Maroc"
              className="h-[140px] object-contain opacity-90"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        </div>
      </header>

      {/* ===== ERROR TOAST ===== */}
      {locationError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[3000] max-w-[90vw] w-[400px] pointer-events-auto">
          <div className="bg-white border border-red-200 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] px-4 py-3 flex items-start gap-3">
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

      {/* ===== MAP SECTION ===== */}
      <main className="flex-1 relative">
        {/* Map */}
        <div className="absolute inset-0 bg-[#E5E9EC]">
          <MapController
              stores={STORE_DATA}
              triggerLocate={triggerLocate}
              resetMap={resetMap}
              flyToStore={flyToStore}
              onLocationFound={handleLocationFound}
              onLocationError={handleLocationError}
              onSortedStores={handleStoresSorted}
          />
        </div>

        {/* Overlaid Controls */}
        <div className="absolute top-[20px] left-[20px] max-md:top-auto max-md:bottom-[30px] max-md:left-0 z-[1000] flex flex-col gap-[15px] items-start max-md:items-center max-md:w-full pointer-events-none">
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
          />
        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="bg-coffee-dark border-t-[3px] border-coffee-gold shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-white/40 text-[12px] font-medium">
            © 2025 Dahab Coffee. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4 text-[12px] font-medium">
            <span className="text-white/40">Trouvez votre café le plus proche au Maroc</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
