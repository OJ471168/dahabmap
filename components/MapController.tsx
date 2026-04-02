import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Store, LatLng } from '../types';
import { defaultIcon } from '../constants';

interface MapControllerProps {
  stores: Store[];
  triggerLocate: boolean;
  resetMap: boolean;
  flyToStore: Store | null;
  onLocationFound: (latlng: LatLng) => void;
  onLocationError: (code: number) => void;
  onSortedStores: (stores: Store[]) => void;
}

export default function MapController({
    stores,
    triggerLocate,
    resetMap,
    flyToStore,
    onLocationFound,
    onLocationError,
    onSortedStores
}: MapControllerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);
  const markersRef = useRef<{ [key: number]: L.Marker }>({});
  const highlightLayerRef = useRef<L.Layer | null>(null);
  const [isZoomedIn, setIsZoomedIn] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        minZoom: 5,
        zoomAnimation: true,
        fadeAnimation: true,
        markerZoomAnimation: true,
    }).setView([31.5, -7.0], 6);

    // Fit map to show all stores
    const bounds = L.latLngBounds(stores.map(s => [s.lat, s.lng]));
    map.fitBounds(bounds, { padding: [30, 30] });

    L.control.zoom({ position: 'topright' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© CARTO',
        maxZoom: 20
    }).addTo(map);

    // Track zoom level for "full map" button
    map.on('zoomend', () => {
        setIsZoomedIn(map.getZoom() > 8);
    });

    // Event Listeners
    map.on('locationfound', (e) => {
        onLocationFound(e.latlng);

        if (userMarkerRef.current) {
            map.removeLayer(userMarkerRef.current);
        }

        const userMarker = L.circleMarker(e.latlng, {
            radius: 8,
            fillColor: '#C59D5F',
            color: '#fff',
            weight: 3,
            fillOpacity: 1
        }).addTo(map).bindPopup("Vous êtes ici");

        userMarkerRef.current = userMarker;

        // Calculate closest stores
        setTimeout(() => {
            const storesWithDist = stores.map((store, index) => {
                const dist = map.distance(e.latlng, [store.lat, store.lng]);
                return { ...store, dist, originalIndex: index };
            });

            storesWithDist.sort((a, b) => a.dist - b.dist);
            const closest = storesWithDist.slice(0, 5);
            onSortedStores(closest);
        }, 800);
    });

    map.on('locationerror', (e) => {
        const code = (e as any).code || 0;
        onLocationError(code);
    });

    mapInstanceRef.current = map;

    // Initialize Markers
    stores.forEach((store, index) => {
        const marker = L.marker([store.lat, store.lng], { icon: defaultIcon });

        const navLink = `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`;

        const popupHTML = `
            <div class="popup-card">
                <div class="popup-header"></div>
                <div class="popup-body">
                    <h3 class="popup-title">${store.title}</h3>
                    <div class="popup-city">📍 ${store.city}</div>

                    <a href="${navLink}" target="_blank" class="btn-navigate">
                        <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                        Montre-moi le chemin
                    </a>
                </div>
            </div>
        `;

        marker.bindPopup(popupHTML);

        marker.on('click', function() {
            // Offset lat north so pin sits in lower part of view, leaving room for popup above
            map.flyTo([store.lat + 0.002, store.lng], 16, { duration: 1.5 });
        });

        marker.addTo(map);
        markersRef.current[index] = marker;
    });

    return () => {
        map.remove();
        mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Triggers
  useEffect(() => {
    if (triggerLocate && mapInstanceRef.current) {
        mapInstanceRef.current.locate({ setView: true, maxZoom: 14 });
    }
  }, [triggerLocate]);

  useEffect(() => {
    if (resetMap && mapInstanceRef.current) {
        mapInstanceRef.current.closePopup();
        if (userMarkerRef.current) {
            mapInstanceRef.current.removeLayer(userMarkerRef.current);
            userMarkerRef.current = null;
        }
        if (highlightLayerRef.current) {
            mapInstanceRef.current.removeLayer(highlightLayerRef.current);
            highlightLayerRef.current = null;
        }
        const bounds = L.latLngBounds(stores.map(s => [s.lat, s.lng]));
        mapInstanceRef.current.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [resetMap]);

  useEffect(() => {
    if (flyToStore && mapInstanceRef.current) {
        if (highlightLayerRef.current) {
            mapInstanceRef.current.removeLayer(highlightLayerRef.current);
            highlightLayerRef.current = null;
        }

        const highlightIcon = L.divIcon({
            className: 'bg-transparent border-none',
            html: `<div class="w-full h-full rounded-full animate-pulse-gold bg-coffee-gold/30"></div>`,
            iconSize: [80, 80],
            iconAnchor: [40, 40]
        });

        const highlightMarker = L.marker([flyToStore.lat, flyToStore.lng], {
            icon: highlightIcon,
            interactive: false,
            zIndexOffset: -1000
        }).addTo(mapInstanceRef.current);

        highlightLayerRef.current = highlightMarker;

        // Offset lat north so pin sits in lower part of view, leaving room for popup above
        mapInstanceRef.current.flyTo([flyToStore.lat + 0.002, flyToStore.lng], 16, { duration: 1.5 });

        // Open popup after fly animation completes
        const storeRef = flyToStore;
        mapInstanceRef.current.once('moveend', () => {
            if (storeRef.originalIndex !== undefined && markersRef.current[storeRef.originalIndex]) {
                markersRef.current[storeRef.originalIndex].openPopup();
            }
        });
    }
  }, [flyToStore]);

  const handleResetZoom = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.closePopup();
      const bounds = L.latLngBounds(stores.map(s => [s.lat, s.lng]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [30, 30] });
    }
  };

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full" />
      {isZoomedIn && (
        <button
          onClick={handleResetZoom}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000]
            bg-white px-4 py-2 rounded-full shadow-[0_2px_12px_rgba(44,36,27,0.15)]
            border border-[#eee] hover:border-coffee-gold
            text-[13px] font-semibold text-coffee-text
            cursor-pointer transition-all hover:shadow-[0_4px_20px_rgba(197,157,95,0.2)]
            flex items-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
          </svg>
          Carte complète
        </button>
      )}
    </div>
  );
}
