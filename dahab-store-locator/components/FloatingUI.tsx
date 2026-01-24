import React from 'react';
import { Store } from '../types';

interface FloatingUIProps {
    isLocating: boolean;
    userLocation: { lat: number; lng: number } | null;
    closestStores: Store[];
    onToggleLocation: () => void;
    onSelectStore: (store: Store) => void;
}

const FloatingUI: React.FC<FloatingUIProps> = ({ 
    isLocating, 
    userLocation, 
    closestStores, 
    onToggleLocation,
    onSelectStore 
}) => {
    
    const formatDistance = (meters?: number) => {
        if (meters === undefined) return '';
        if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
        return `${Math.round(meters)} m`;
    };

    return (
        <div className="absolute top-5 left-5 md:left-8 z-[1000] flex flex-col items-start gap-4 pointer-events-none">
            
            {/* Locate Button */}
            <div className="pointer-events-auto">
                <button
                    onClick={onToggleLocation}
                    className={`
                        group flex items-center gap-2.5 pl-3 pr-5 py-3 rounded-full 
                        shadow-glass backdrop-blur-md transition-all duration-300 ease-out
                        border border-white/50
                        ${isLocating 
                            ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5' 
                            : 'bg-white/90 text-gray-800 hover:bg-white hover:shadow-xl hover:-translate-y-0.5'
                        }
                    `}
                >
                    <div className={`
                        flex items-center justify-center w-6 h-6 rounded-full transition-colors
                        ${isLocating ? 'bg-white/20' : 'bg-blue-100'}
                    `}>
                        {isLocating ? (
                           <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>
                        ) : (
                           <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                        )}
                    </div>
                    <span className="font-bold text-sm tracking-tight">
                        {isLocating 
                            ? (userLocation ? "Stop Locating" : "Finding you...") 
                            : "Find Dahab near me"
                        }
                    </span>
                </button>
            </div>

            {/* Closest Stores Panel */}
            <div 
                className={`
                    pointer-events-auto w-[280px] md:w-[320px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/50
                    transition-all duration-500 ease-spring
                    ${userLocation && closestStores.length > 0 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'}
                `}
            >
                <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Closest Stores</span>
                    <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Top 3</span>
                </div>
                <div className="flex flex-col">
                    {closestStores.map((store, idx) => (
                        <div 
                            key={store.id} 
                            onClick={() => onSelectStore(store)}
                            className={`
                                group relative px-4 py-3.5 cursor-pointer transition-colors duration-200
                                hover:bg-blue-50/80 flex items-center justify-between
                                ${idx !== closestStores.length - 1 ? 'border-b border-gray-100' : ''}
                            `}
                        >
                            <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                                    {store.title}
                                </span>
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                    <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                        {formatDistance(store.distance)}
                                    </span>
                                    <span>• {store.city}</span>
                                </div>
                            </div>
                            <div className="text-gray-300 group-hover:text-blue-600 transition-transform duration-300 group-hover:translate-x-1">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FloatingUI;
