import React, { useEffect, useState, useRef, useMemo } from 'react';
import MapView, { MapViewHandle } from './components/MapView';
import FloatingUI from './components/FloatingUI';
import { fetchStores } from './services/supabase';
import { Store, Coordinates } from './types';

// Helper to calculate distance in meters
function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d * 1000; // Distance in meters
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

const App: React.FC = () => {
    const [stores, setStores] = useState<Store[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    
    const mapRef = useRef<MapViewHandle>(null);

    // Fetch Initial Data
    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchStores();
                setStores(data);
            } catch (err) {
                console.error(err);
                // Optional: Show toast error
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    // Toggle Geolocation
    const handleToggleLocation = () => {
        if (!mapRef.current) return;

        if (isLocating || userLocation) {
            // Turn off
            setIsLocating(false);
            setUserLocation(null);
            mapRef.current.stopLocate();
        } else {
            // Turn on
            setIsLocating(true);
            mapRef.current.locateUser();
        }
    };

    const handleLocationFound = (coords: Coordinates) => {
        setUserLocation(coords);
        // Note: isLocating stays true to show the "Active" state of the button
    };

    const handleLocationError = (msg: string) => {
        console.warn("Location error:", msg);
        setIsLocating(false);
        setUserLocation(null);
        alert("Could not access your location. Please check your permissions.");
    };

    // Derived State: Closest Stores
    const closestStores = useMemo(() => {
        if (!userLocation || stores.length === 0) return [];

        const withDist = stores.map(store => ({
            ...store,
            distance: getDistanceFromLatLonInM(userLocation.lat, userLocation.lng, store.lat, store.lng)
        }));

        // Sort asc by distance and take top 3
        return withDist.sort((a, b) => (a.distance || 0) - (b.distance || 0)).slice(0, 3);
    }, [userLocation, stores]);

    const handleSelectStore = (store: Store) => {
        if (mapRef.current) {
            mapRef.current.flyTo({ lat: store.lat, lng: store.lng });
        }
    };

    return (
        <div className="relative w-full h-full">
            {/* Map Background */}
            <MapView 
                ref={mapRef}
                stores={stores}
                onLocationFound={handleLocationFound}
                onLocationError={handleLocationError}
            />

            {/* UI Layer */}
            <FloatingUI 
                isLocating={isLocating}
                userLocation={userLocation}
                closestStores={closestStores}
                onToggleLocation={handleToggleLocation}
                onSelectStore={handleSelectStore}
            />

            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 z-[2000] bg-white/80 backdrop-blur-sm flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <span className="text-gray-500 font-semibold tracking-wide animate-pulse">Loading Stores...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
