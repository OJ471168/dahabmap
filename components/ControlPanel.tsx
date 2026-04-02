import React, { useState, useMemo, useRef, useCallback } from 'react';
import { Store, LatLng } from '../types';

interface ControlPanelProps {
  isLocating: boolean;
  userLocation: LatLng | null;
  onToggle: () => void;
  closestStores: Store[];
  isPanelVisible: boolean;
  isMobileCollapsed: boolean;
  onMobileTogglePanel: () => void;
  onStoreClick: (store: Store) => void;
  onResetView: () => void;
  allStores: Store[];
  isDesktop: boolean;
}

export default function ControlPanel({
    isLocating,
    userLocation,
    onToggle,
    closestStores,
    isPanelVisible,
    isMobileCollapsed,
    onMobileTogglePanel,
    onStoreClick,
    onResetView,
    allStores,
    isDesktop,
}: ControlPanelProps) {
  const [selectedCity, setSelectedCity] = useState('');

  const dragRef = useRef({ startY: 0, isDragging: false });
  const panelRef = useRef<HTMLDivElement>(null);

  const cities = useMemo(() => {
    const unique = [...new Set(allStores.map(s => s.city))];
    unique.sort((a, b) => a.localeCompare(b, 'fr'));
    return unique;
  }, [allStores]);

  const filteredStores = useMemo(() => {
    const source = closestStores.length > 0 ? closestStores : [];
    if (!selectedCity) return source;
    return source.filter(s => s.city === selectedCity);
  }, [closestStores, selectedCity]);

  const browseStores = useMemo(() => {
    if (userLocation || isLocating) return [];
    if (!selectedCity) return [];
    return allStores
      .filter(s => s.city === selectedCity)
      .map((s) => ({ ...s, originalIndex: allStores.indexOf(s) }));
  }, [allStores, userLocation, isLocating, selectedCity]);

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

  const handleClearCity = () => {
    setSelectedCity('');
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    dragRef.current.startY = e.touches[0].clientY;
    dragRef.current.isDragging = true;
    if (panelRef.current) {
      panelRef.current.style.transition = 'none';
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragRef.current.isDragging) return;
    const deltaY = e.touches[0].clientY - dragRef.current.startY;
    if (deltaY > 0) {
      e.preventDefault();
      if (panelRef.current) {
        panelRef.current.style.transform = `translateY(${deltaY}px)`;
      }
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!dragRef.current.isDragging || !panelRef.current) return;
    dragRef.current.isDragging = false;
    panelRef.current.style.transition = '';

    const currentTransform = panelRef.current.style.transform;
    const match = currentTransform.match(/translateY\((\d+)px\)/);
    const dragDistance = match ? parseInt(match[1]) : 0;

    if (dragDistance > 80) {
      panelRef.current.style.transform = '';
      onMobileTogglePanel();
    } else {
      panelRef.current.style.transform = '';
    }
  }, [onMobileTogglePanel]);

  const storeListContent = (maxH: string) => (
    <div className="overflow-y-auto" style={{ maxHeight: maxH }}>
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
      ) : displayStores.length > 0 ? (
        displayStores.map((store, i) => (
          <div
            key={i}
            onClick={() => onStoreClick(store)}
            className="
              px-[18px] py-[14px] border-b border-[#eee] cursor-pointer
              flex items-center justify-between transition-colors duration-200
              hover:bg-coffee-foam group last:border-b-0
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
          Aucun résultat pour cette ville
        </div>
      ) : null}
    </div>
  );

  // ========== DESKTOP LAYOUT ==========
  if (isDesktop) {
    return (
      <div className="flex flex-col gap-4">
        {/* Locate Button */}
        <button
          onClick={onToggle}
          aria-label={getButtonLabel()}
          className={`
            w-full bg-white px-5 py-3.5 rounded-xl
            shadow-[0_2px_12px_rgba(44,36,27,0.08)]
            flex items-center justify-center transition-all duration-300
            border border-[#C59D5F]/10
            hover:shadow-[0_4px_20px_rgba(197,157,95,0.2)]
            cursor-pointer font-bold text-[14px] text-coffee-dark gap-[10px]
            ${isLocating && !userLocation ? 'animate-pulse-gold border-[#C59D5F]' : ''}
            ${userLocation ? 'text-coffee-gold border-coffee-gold' : ''}
          `}
        >
          <span className="text-[20px]">☕</span>
          <span>{getButtonLabel()}</span>
        </button>

        {/* City Filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
            className="flex-1 bg-white rounded-xl border border-[#eee] px-4 py-2.5 text-[13px] text-coffee-text font-semibold outline-none focus:border-coffee-gold focus:shadow-[0_0_0_2px_rgba(197,157,95,0.15)] cursor-pointer shadow-[0_2px_12px_rgba(44,36,27,0.08)] transition-all appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
          >
            <option value="">Toutes les villes</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          {selectedCity && (
            <button
              onClick={handleClearCity}
              className="w-9 h-9 rounded-full bg-white border border-[#eee] shadow-[0_2px_12px_rgba(44,36,27,0.08)] flex items-center justify-center text-[#aaa] hover:text-coffee-dark hover:border-coffee-gold cursor-pointer transition-all shrink-0"
              aria-label="Effacer le filtre"
            >
              ×
            </button>
          )}
        </div>

        {/* Stores List — always visible in sidebar */}
        {panelVisible && (
          <div className="bg-white rounded-xl border border-[#eee] shadow-[0_2px_12px_rgba(44,36,27,0.08)] overflow-hidden">
            <div className="px-[18px] py-[12px] bg-coffee-dark border-b-[3px] border-coffee-gold text-[11px] font-bold text-coffee-gold uppercase tracking-[1px] flex items-center justify-between">
              <span className="flex items-center gap-[6px]">
                ☕ {isPanelVisible ? 'Proches de vous' : 'Résultats'}
              </span>
              {userLocation && (
                <button
                  onClick={onResetView}
                  className="text-[10px] text-coffee-gold/70 hover:text-white font-semibold uppercase tracking-[0.5px] cursor-pointer bg-transparent border-none p-0"
                >
                  Vue globale
                </button>
              )}
            </div>
            {storeListContent('calc(100vh - 380px)')}
          </div>
        )}
      </div>
    );
  }

  // ========== MOBILE LAYOUT ==========
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
          cursor-pointer pointer-events-auto
          font-bold text-[14px] text-coffee-dark gap-[10px]
          ${isLocating && !userLocation ? 'animate-pulse-gold border-[#C59D5F]' : ''}
          ${userLocation ? 'text-coffee-gold' : ''}
        `}
      >
        <span className="text-[20px]">☕</span>
        <span>{getButtonLabel()}</span>
      </button>

      {/* City Filter */}
      <div className="w-[90vw] pointer-events-auto flex items-center gap-2">
        <select
          value={selectedCity}
          onChange={e => setSelectedCity(e.target.value)}
          className="flex-1 bg-white rounded-xl border border-[#eee] px-4 py-2.5 text-[13px] text-coffee-text font-semibold outline-none focus:border-coffee-gold cursor-pointer shadow-[0_2px_12px_rgba(44,36,27,0.08)] transition-all appearance-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
        >
          <option value="">Toutes les villes</option>
          {cities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
        {selectedCity && (
          <button
            onClick={handleClearCity}
            className="w-9 h-9 rounded-full bg-white border border-[#eee] shadow-[0_2px_12px_rgba(44,36,27,0.08)] flex items-center justify-center text-[#aaa] hover:text-coffee-dark hover:border-coffee-gold cursor-pointer transition-all shrink-0"
            aria-label="Effacer le filtre"
          >
            ×
          </button>
        )}
      </div>

      {/* Mobile Bottom Sheet */}
      <div
        ref={panelRef}
        className={`
          w-full bg-white rounded-t-2xl shadow-[0_-4px_30px_rgba(44,36,27,0.15)] overflow-hidden
          fixed left-0 bottom-0 z-[2000]
          transition-transform duration-400 ease-[cubic-bezier(0.2,0.8,0.2,1)]
          flex flex-col pointer-events-auto

          ${panelVisible && !isMobileCollapsed ? 'translate-y-0' : ''}
          ${panelVisible && isMobileCollapsed ? 'translate-y-[calc(100%-48px)]' : ''}
          ${!panelVisible ? 'translate-y-full' : ''}
        `}
      >
        {/* Drag Handle */}
        <div
          className="flex items-center justify-center py-[10px] cursor-pointer shrink-0 touch-none"
          onClick={onMobileTogglePanel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-[40px] h-[4px] bg-[#ccc] rounded-full"></div>
        </div>

        <div className="px-[18px] py-[10px] border-b border-[#eee] text-[11px] font-bold text-coffee-text uppercase tracking-[1px] flex items-center justify-center">
          <span className="flex items-center gap-[6px]">
            ☕ {isPanelVisible ? 'Proches de vous' : 'Résultats'}
          </span>
        </div>

        {storeListContent('45vh')}
      </div>
    </>
  );
}
