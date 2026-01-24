import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { Store, Coordinates } from '../types';

// Constants for assets
const PIN_ICON_URL = 'https://vlrbeemaxxdqiczdxomd.supabase.co/storage/v1/object/public/events_images/pin.svg';
const DEFAULT_POPUP_IMG = 'https://vlrbeemaxxdqiczdxomd.supabase.co/storage/v1/object/public/events_images/dahab-cafe.jpg';

export interface MapViewHandle {
    flyTo: (coords: Coordinates, zoom?: number) => void;
    locateUser: () => void;
    stopLocate: () => void;
}

interface MapViewProps {
    stores: Store[];
    onLocationFound: (coords: Coordinates) => void;
    onLocationError: (msg: string) => void;
}

const MapView = forwardRef<MapViewHandle, MapViewProps>(({ stores, onLocationFound, onLocationError }, ref) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markersClusterRef = useRef<L.MarkerClusterGroup | null>(null);
    const userMarkerRef = useRef<L.CircleMarker | null>(null);
    const storeMarkersRef = useRef<Map<number, L.Marker>>(new Map());

    // --- Imperative Handles for Parent ---
    useImperativeHandle(ref, () => ({
        flyTo: (coords: Coordinates, zoom = 16) => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo([coords.lat, coords.lng], zoom, { duration: 1.5 });
                
                // If it's a store, try to open its popup after flying
                // We find the marker by comparing coordinates roughly or if we had an ID.
                // For simplicity, we search the stored markers.
                setTimeout(() => {
                   const foundMarker = Array.from(storeMarkersRef.current.values()).find((m: L.Marker) => {
                       const mLatLng = m.getLatLng();
                       return Math.abs(mLatLng.lat - coords.lat) < 0.0001 && Math.abs(mLatLng.lng - coords.lng) < 0.0001;
                   });
                   
                   if (foundMarker && markersClusterRef.current) {
                       markersClusterRef.current.zoomToShowLayer(foundMarker, () => {
                           foundMarker.openPopup();
                       });
                   }
                }, 1600);
            }
        },
        locateUser: () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.locate({ setView: true, maxZoom: 14, watch: true });
            }
        },
        stopLocate: () => {
             if (mapInstanceRef.current) {
                mapInstanceRef.current.stopLocate();
                if (userMarkerRef.current) {
                    mapInstanceRef.current.removeLayer(userMarkerRef.current);
                    userMarkerRef.current = null;
                }
                // Reset view to Morocco default
                mapInstanceRef.current.flyTo([31.7917, -7.0926], 6);
            }
        }
    }));

    // --- Initialization ---
    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        // Init Map
        const map = L.map(mapContainerRef.current, { 
            zoomControl: false,
            tap: false // Fix for some touch devices
        }).setView([31.7917, -7.0926], 6);

        // Add Zoom Control
        L.control.zoom({ position: 'topright' }).addTo(map);

        // Tile Layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            maxZoom: 20
        }).addTo(map);

        // Location Events
        map.on('locationfound', (e) => {
            if (userMarkerRef.current) {
                userMarkerRef.current.setLatLng(e.latlng);
            } else {
                userMarkerRef.current = L.circleMarker(e.latlng, {
                    radius: 8,
                    fillColor: '#2563eb', // blue-600
                    color: '#fff',
                    weight: 3,
                    opacity: 1,
                    fillOpacity: 1
                }).addTo(map);
                userMarkerRef.current.bindPopup("You are here");
            }
            onLocationFound({ lat: e.latlng.lat, lng: e.latlng.lng });
        });

        map.on('locationerror', (e) => {
            onLocationError(e.message);
        });

        mapInstanceRef.current = map;
        markersClusterRef.current = L.markerClusterGroup({
            maxClusterRadius: 40,
            showCoverageOnHover: false,
            zoomToBoundsOnClick: false
        });
        
        // Custom cluster click
        markersClusterRef.current.on('clusterclick', (a: any) => {
            a.layer.zoomToBounds({ padding: [20, 20] });
        });

        map.addLayer(markersClusterRef.current);

        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // --- Markers Update ---
    useEffect(() => {
        if (!mapInstanceRef.current || !markersClusterRef.current) return;

        const clusterGroup = markersClusterRef.current;
        clusterGroup.clearLayers();
        storeMarkersRef.current.clear();

        const customIcon = L.icon({
            iconUrl: PIN_ICON_URL,
            iconSize: [40, 40],
            iconAnchor: [20, 40],
            popupAnchor: [0, -36]
        });

        stores.forEach((store) => {
            const marker = L.marker([store.lat, store.lng], { icon: customIcon });

            const navLink = `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`;
            
            // We use raw HTML string for Leaflet popup content
            const popupContent = `
                <div class="flex flex-col font-sans">
                    <div class="h-28 w-full bg-gray-200 bg-cover bg-center" style="background-image: url('${DEFAULT_POPUP_IMG}')"></div>
                    <div class="p-4 bg-white text-center">
                        <h3 class="text-lg font-bold text-gray-900 mb-1 leading-tight">${store.title}</h3>
                        <div class="text-sm text-gray-500 mb-4 font-medium flex items-center justify-center gap-1">
                           📍 ${store.city}
                        </div>
                        <a href="${navLink}" target="_blank" class="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-900 hover:bg-black text-white rounded-lg text-sm font-semibold transition-colors no-underline">
                            <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                            Get Directions
                        </a>
                    </div>
                </div>
            `;

            marker.bindPopup(popupContent);
            marker.on('click', () => {
                mapInstanceRef.current?.flyTo([store.lat, store.lng], 16, { duration: 1.5 });
            });

            clusterGroup.addLayer(marker);
            storeMarkersRef.current.set(store.id, marker);
        });

    }, [stores]);

    return (
        <div ref={mapContainerRef} className="w-full h-full z-0 absolute inset-0 bg-gray-200" />
    );
});

export default MapView;