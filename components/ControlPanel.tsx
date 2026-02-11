import React from 'react';
import { Store, LatLng } from '../types';

interface ControlPanelProps {
  isLocating: boolean;
  userLocation: LatLng | null;
  onToggle: () => void;
  closestStores: Store[];
  isPanelVisible: boolean;
  onStoreClick: (store: Store) => void;
}

export default function ControlPanel({ 
    isLocating, 
    userLocation, 
    onToggle, 
    closestStores, 
    isPanelVisible,
    onStoreClick 
}: ControlPanelProps) {

  // Helper to format distance
  const formatDistance = (dist?: number) => {
    if (dist === undefined) return '';
    return dist >= 1000 ? (dist / 1000).toFixed(1) + " km" : Math.round(dist) + " m";
  };

  return (
    <>
      <div 
        onClick={onToggle}
        className={`
            bg-white/98 backdrop-blur-md px-5 py-3 rounded-full 
            shadow-[0_4px_25px_rgba(44,36,27,0.15)] 
            flex items-center transition-all duration-300 
            border border-[#C59D5F]/10 
            hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(197,157,95,0.25)] 
            cursor-pointer pointer-events-auto
            ${isLocating && !userLocation ? 'animate-pulse-gold border-[#C59D5F]' : ''}
        `}
      >
        <button className={`
            bg-none border-none cursor-pointer 
            font-bold text-[14px] 
            text-coffee-dark flex items-center gap-[10px] p-0 transition-colors duration-200
            ${userLocation ? 'text-coffee-gold' : ''}
        `}>
          <span className="text-[20px]">☕</span> 
          <span>
            {isLocating && !userLocation 
                ? "Finding your coffee..." 
                : userLocation 
                    ? "Arrêter" 
                    : "Trouver mon café Dahab"}
          </span>
        </button>
      </div>

      <div className={`
        w-[300px] bg-white rounded-2xl shadow-[0_10px_40px_rgba(44,36,27,0.15)] overflow-hidden 
        transition-transform duration-400 ease-[cubic-bezier(0.2,0.8,0.2,1)] 
        flex flex-col pointer-events-auto
        max-h-[80vh]
        opacity-0 -translate-y-[10px] pointer-events-none
        
        max-md:fixed max-md:left-0 max-md:bottom-0 max-md:w-full max-md:rounded-t-2xl max-md:rounded-b-none max-md:z-[2000] max-md:translate-y-full

        ${isPanelVisible ? 'opacity-100 translate-y-0 pointer-events-auto max-md:translate-y-0' : ''}
      `}>
        {/* Mobile Drag Handle */}
        <div className="hidden max-md:block w-[40px] h-[4px] bg-[#ddd] rounded-full mx-auto my-[8px]"></div>
        
        <div className="
            px-[18px] py-[14px] bg-coffee-dark border-b-[3px] border-coffee-gold
            text-[11px] font-bold text-coffee-gold uppercase tracking-[1px]
            flex items-center gap-[6px] shrink-0
            max-md:bg-white max-md:text-coffee-text max-md:border-b-[#eee] max-md:border-b max-md:pt-0 max-md:justify-center
        ">
            <span>☕ Proches de vous</span>
        </div>

        <div>
            {closestStores.length === 0 ? (
                // SKELETON LOADER
                Array(3).fill(0).map((_, i) => (
                    <div key={i} className="px-[18px] py-[14px] border-b border-[#eee] flex justify-between items-center">
                        <div className="flex flex-col gap-[6px]">
                            <div className="w-[140px] h-[16px] rounded bg-gradient-to-r from-[#f0f0f0] via-[#e0e0e0] to-[#f0f0f0] bg-[length:200%_100%] animate-shimmer"></div>
                            <div className="w-[60px] h-[12px] rounded bg-gradient-to-r from-[#f0f0f0] via-[#e0e0e0] to-[#f0f0f0] bg-[length:200%_100%] animate-shimmer"></div>
                        </div>
                        <div className="w-[20px] h-[20px] rounded-full bg-gradient-to-r from-[#f0f0f0] via-[#e0e0e0] to-[#f0f0f0] bg-[length:200%_100%] animate-shimmer"></div>
                    </div>
                ))
            ) : (
                // STORES LIST
                closestStores.map((store, i) => (
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
                            <div className="text-[15px] font-bold text-coffee-text mb-[4px]">{store.title}</div>
                            <div className="text-[12px] text-[#888] font-medium flex items-center gap-[4px]">
                                <span className="inline-block text-[10px] text-coffee-gold animate-steam">♨</span>
                                {formatDistance(store.dist)}
                            </div>
                        </div>
                        <div className="text-[#ddd] text-[20px] transition-transform duration-200 group-hover:text-coffee-gold group-hover:translate-x-[3px]">›</div>
                    </div>
                ))
            )}
        </div>
      </div>
    </>
  );
}