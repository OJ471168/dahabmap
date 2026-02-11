import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Store, LatLng } from '../types';
import { defaultIcon } from '../constants';

interface MapControllerProps {
  stores: Store[];
  triggerLocate: boolean;
  resetMap: boolean;
  flyToStore: Store | null;
  onLocationFound: (latlng: LatLng) => void;
  onLocationError: () => void;
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

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent double init

    const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        minZoom: 5,
        zoomAnimation: true,
        fadeAnimation: true,
        markerZoomAnimation: true,
    }).setView([31.7917, -7.0926], 5);

    L.control.zoom({ position: 'topleft' }).addTo(map);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '© CARTO',
        maxZoom: 20
    }).addTo(map);

    // Zoom Animation Events
    map.on('zoomstart', () => {
        if (mapContainerRef.current) {
            mapContainerRef.current.classList.add('opacity-80', 'scale-[0.98]', 'blur-[1px]');
        }
    });

    map.on('zoomend', () => {
        if (mapContainerRef.current) {
            mapContainerRef.current.classList.remove('opacity-80', 'scale-[0.98]', 'blur-[1px]');
        }
    });

    // Event Listeners
    map.on('locationfound', (e) => {
        onLocationFound(e.latlng);
        
        // Remove old user marker
        if (userMarkerRef.current) {
            map.removeLayer(userMarkerRef.current);
        }

        // Add new user marker
        const userMarker = L.circleMarker(e.latlng, { 
            radius: 8, 
            fillColor: '#C59D5F', 
            color: '#fff', 
            weight: 3, 
            fillOpacity: 1 
        }).addTo(map).bindPopup("Vous êtes ici");
        
        userMarkerRef.current = userMarker;

        // Calculate closest stores
        // Artificial delay matching the original code's "loading" feel (800ms)
        setTimeout(() => {
            const storesWithDist = stores.map((store, index) => {
                const dist = map.distance(e.latlng, [store.lat, store.lng]);
                return { ...store, dist, originalIndex: index };
            });

            storesWithDist.sort((a, b) => a.dist - b.dist);
            const closest3 = storesWithDist.slice(0, 3);
            onSortedStores(closest3);
        }, 800);
    });

    map.on('locationerror', () => {
        onLocationError();
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
            map.flyTo([store.lat, store.lng], 16, { duration: 1.5 });
        });

        marker.addTo(map);
        markersRef.current[index] = marker;
    });

    return () => {
        map.remove();
        mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // Handle Triggers
  useEffect(() => {
    if (triggerLocate && mapInstanceRef.current) {
        mapInstanceRef.current.locate({ setView: true, maxZoom: 14 });
    }
  }, [triggerLocate]);

  useEffect(() => {
    if (resetMap && mapInstanceRef.current) {
        if (userMarkerRef.current) {
            mapInstanceRef.current.removeLayer(userMarkerRef.current);
            userMarkerRef.current = null;
        }
        if (highlightLayerRef.current) {
            mapInstanceRef.current.removeLayer(highlightLayerRef.current);
            highlightLayerRef.current = null;
        }
        mapInstanceRef.current.setView([31.7917, -7.0926], 6);
    }
  }, [resetMap]);

  useEffect(() => {
    if (flyToStore && mapInstanceRef.current) {
        // Remove previous highlight if it exists
        if (highlightLayerRef.current) {
            mapInstanceRef.current.removeLayer(highlightLayerRef.current);
            highlightLayerRef.current = null;
        }

        // Add pulsing highlight marker
        const highlightIcon = L.divIcon({
            className: 'bg-transparent border-none',
            html: `<div class="w-full h-full rounded-full animate-pulse-gold bg-coffee-gold/30"></div>`,
            iconSize: [80, 80],
            iconAnchor: [40, 40]
        });

        const highlightMarker = L.marker([flyToStore.lat, flyToStore.lng], {
            icon: highlightIcon,
            interactive: false,
            zIndexOffset: -1000 // Place behind the pin
        }).addTo(mapInstanceRef.current);

        highlightLayerRef.current = highlightMarker;

        mapInstanceRef.current.flyTo([flyToStore.lat, flyToStore.lng], 16, { duration: 1.5 });
        
        // Open popup after fly animation
        setTimeout(() => {
            if (flyToStore.originalIndex !== undefined && markersRef.current[flyToStore.originalIndex]) {
                markersRef.current[flyToStore.originalIndex].openPopup();
            }
        }, 600);
    }
  }, [flyToStore]);

  return <div ref={mapContainerRef} className="w-full h-full transition-all duration-300 ease-in-out" />;
}