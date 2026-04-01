import React, { useState, useMemo } from 'react';
import { Store, LatLng } from '../types';

interface ControlPanelProps {
  isLocating: boolean;
  userLocation: LatLng | null;
  onToggle: () => void;
  closestStores: Store[];
  isPanelVisible: boolean;
  onStoreClick: (store: Store) => void;
  onResetView: () => void;
  allStores: Store[];
}

export default function ControlPanel({
    isLocating,
    userLocation,
    onToggle,
    closestStores,
    isPanelVisible,
    onStoreClick,
    onResetView,
    allStores,
}: ControlPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const cities = useMemo(() => {
    const unique = [...new Set(allStores.map(s => s.city))];
    unique.sort((a, b) => a.localeCompare(b, 'fr'));
    return unique;
  }, [allStores]);

  const filteredStores = useMemo(() => {
    const source = closestStores.length > 0 ? closestStores : [];
    if (!searchQuery && !selectedCity) return source;

    let filtered = source;
    if (selectedCity) {
      filtered = filtered.filter(s => s.city === selectedCity);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(q) || s.city.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [closestStores, searchQuery, selectedCity]);

  // When no location, allow browsing all stores by search/city
  const browseStores = useMemo(() => {
    if (userLocation || isLocating) return [];
    if (!searchQuery && !selectedCity) return [];

    let filtered = allStores.map((s, i) => ({ ...s, originalIndex: i }));
    if (selectedCity) {
      filtered = filtered.filter(s => s.city === selectedCity);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(q) || s.city.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [allStores, userLocation, isLocating, searchQuery, selectedCity]);

  const showBrowsePanel = browseStores.length > 0;
  const displayStores = isPanelVisible ? filteredStores : browseStores;
  const panelVisible = isPanelVisible || showBrowsePanel;

  const formatDistance = (dist?: number) => {
    if (dist === undefined) return '';
    return dist >= 1000 ? (dist / 1000).toFixed(1) + " km" : Math.round(dist) + " m";
  };

  const getButtonLabel = () => {
    if (isLocating && !userLocation) return "Recherche en cours...";
    if (userLocation) return "Arrêter";
    return "Trouver mon café Dahab";
  };

  return (
    <>
      {/* Locate Button */}
      <button
        onClick={onToggle}
        aria-label={getButtonLabel()}
        className={`
            bg-white backdrop-blur-md px-5 py-3 rounded-full
            shadow-[0_4px_25px_rgba(44,36,27,0.15)]
            flex items-center transition-all duration-300
            border border-[#C59D5F]/10
            hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(197,157,95,0.25)]
            cursor-pointer pointer-events-auto
            font-bold text-[14px] text-coffee-dark gap-[10px]
            ${isLocating && !userLocation ? 'animate-pulse-gold border-[#C59D5F]' : ''}
            ${userLocation ? 'text-coffee-gold' : ''}
        `}
      >
        <span className="text-[20px]">☕</span>
        <span>{getButtonLabel()}</span>
      </button>

      {/* Search & Filter Bar */}
      <div className="flex gap-2 w-[300px] max-md:w-[90vw] pointer-events-auto">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
            className="w-full bg-white rounded-lg border border-[#eee] px-3 py-2 pl-8 text-[13px] text-coffee-text font-medium placeholder:text-[#bbb] outline-none focus:border-coffee-gold focus:shadow-[0_0_0_2px_rgba(197,157,95,0.15)] transition-all"
          />
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#bbb] text-[13px]">🔍</span>
        </div>
        <select
          value={selectedCity}
          onChange={e => setSelectedCity(e.target.value)}
          className="bg-white rounded-lg border border-[#eee] px-2 py-2 text-[12px] text-coffee-text font-medium outline-none focus:border-coffee-gold cursor-pointer max-w-[120px]"
        >
          <option value="">Toutes les villes</option>
          {cities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      {/* Stores Panel */}
      <div className={`
        w-[300px] max-md:w-full bg-white rounded-2xl shadow-[0_10px_40px_rgba(44,36,27,0.15)] overflow-hidden
        transition-all duration-400 ease-[cubic-bezier(0.2,0.8,0.2,1)]
        flex flex-col pointer-events-auto
        max-h-[80vh]
        opacity-0 -translate-y-[10px] pointer-events-none

        max-md:fixed max-md:left-0 max-md:bottom-0 max-md:rounded-t-2xl max-md:rounded-b-none max-md:z-[2000] max-md:translate-y-full

        ${panelVisible ? 'opacity-100 translate-y-0 pointer-events-auto max-md:translate-y-0' : ''}
      `}>
        {/* Mobile Drag Handle */}
        <div className="hidden max-md:block w-[40px] h-[4px] bg-[#ddd] rounded-full mx-auto my-[8px]"></div>

        <div className="
            px-[18px] py-[14px] bg-coffee-dark border-b-[3px] border-coffee-gold
            text-[11px] font-bold text-coffee-gold uppercase tracking-[1px]
            flex items-center justify-between shrink-0
            max-md:bg-white max-md:text-coffee-text max-md:border-b-[#eee] max-md:border-b max-md:pt-0 max-md:justify-center
        ">
            <span className="flex items-center gap-[6px]">
              ☕ {isPanelVisible ? 'Proches de vous' : 'Résultats'}
            </span>
            {userLocation && (
              <button
                onClick={onResetView}
                className="text-[10px] text-coffee-gold/70 hover:text-white font-semibold uppercase tracking-[0.5px] cursor-pointer bg-transparent border-none p-0 max-md:hidden"
              >
                Vue globale
              </button>
            )}
        </div>

        <div className="overflow-y-auto max-h-[50vh]">
            {(isPanelVisible && closestStores.length === 0) ? (
                // SKELETON LOADER
                Array(5).fill(0).map((_, i) => (
                    <div key={i} className="px-[18px] py-[14px] border-b border-[#eee] flex justify-between items-center">
                        <div className="flex flex-col gap-[6px]">
                            <div className="w-[140px] h-[16px] rounded bg-gradient-to-r from-[#f0f0f0] via-[#e0e0e0] to-[#f0f0f0] bg-[length:200%_100%] animate-shimmer"></div>
                            <div className="w-[80px] h-[12px] rounded bg-gradient-to-r from-[#f0f0f0] via-[#e0e0e0] to-[#f0f0f0] bg-[length:200%_100%] animate-shimmer"></div>
                        </div>
                        <div className="w-[20px] h-[20px] rounded-full bg-gradient-to-r from-[#f0f0f0] via-[#e0e0e0] to-[#f0f0f0] bg-[length:200%_100%] animate-shimmer"></div>
                    </div>
                ))
            ) : displayStores.length > 0 ? (
                // STORES LIST
                displayStores.map((store, i) => (
                    <div
                        key={i}
                        onClick={() => onStoreClick(store)}
                        className="
                            px-[18px] py-[14px] border-b border-[#eee] cursor-pointer
                            flex items-center justify-between transition-colors duration-200
                            hover:bg-coffee-foam group
                            last:border-b-0
                        "
                    >
                        <div className="flex flex-col">
                            <div className="text-[15px] font-bold text-coffee-text mb-[2px]">{store.title}</div>
                            <div className="text-[11px] text-[#aaa] font-semibold uppercase tracking-[0.3px] mb-[2px]">{store.city}</div>
                            {store.dist !== undefined && (
                              <div className="text-[12px] text-[#888] font-medium flex items-center gap-[4px]">
                                  <span className="inline-block text-[10px] text-coffee-gold animate-steam">♨</span>
                                  {formatDistance(store.dist)}
                              </div>
                            )}
                        </div>
                        <div className="text-[#ddd] text-[20px] transition-transform duration-200 group-hover:text-coffee-gold group-hover:translate-x-[3px]">›</div>
                    </div>
                ))
            ) : (panelVisible && closestStores.length > 0) ? (
                <div className="px-[18px] py-[20px] text-center text-[13px] text-[#aaa] font-medium">
                    Aucun résultat trouvé
                </div>
            ) : null}
        </div>
      </div>
    </>
  );
}
