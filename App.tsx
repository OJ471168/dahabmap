import React, { useState } from 'react';
import MapController from './components/MapController';
import ControlPanel from './components/ControlPanel';
import { Store, LatLng } from './types';
import { STORE_DATA } from './constants';

export default function App() {
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [closestStores, setClosestStores] = useState<Store[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  
  // We use this to trigger map actions from outside the map component
  const [flyToStore, setFlyToStore] = useState<Store | null>(null);
  const [triggerLocate, setTriggerLocate] = useState(false);
  const [resetMap, setResetMap] = useState(false);

  const handleToggleLocation = () => {
    if (userLocation) {
      // Turn OFF
      setUserLocation(null);
      setIsLocating(false);
      setIsPanelVisible(false);
      setClosestStores([]);
      setResetMap(true);
      setTimeout(() => setResetMap(false), 100);
    } else {
      // Turn ON
      setIsLocating(true);
      setIsPanelVisible(true);
      setTriggerLocate(true);
      setTimeout(() => setTriggerLocate(false), 100);
    }
  };

  const handleLocationFound = (latlng: LatLng) => {
    setUserLocation(latlng);
    setIsLocating(false);
    
    // Calculate distances
    // We use a simple distance calc here just for sorting the list logic roughly
    // The Map component actually handles precise distance if we wanted, 
    // but here we can just use a Haversine approximation or just let the Map component do the heavy lifting?
    // The original code calculated distance inside the map event. 
    // Let's replicate that logic: The MapController will pass back the sorted stores.
  };

  const handleStoresSorted = (stores: Store[]) => {
      setClosestStores(stores);
  };

  const handleStoreClick = (store: Store) => {
    setFlyToStore(store);
    setTimeout(() => setFlyToStore(null), 100);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-coffee-foam font-sans">
      {/* GLOBAL STYLES FOR LEAFLET POPUPS TO MATCH ORIGINAL EXACTLY */}
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

      {/* 
          Updated positioning: 
          Removed 'max-md:left-1/2 max-md:-translate-x-1/2' because CSS transforms create a new stacking context 
          that traps fixed-position children (like our bottom sheet) relative to this container instead of the viewport.
          Replaced with 'max-md:left-0' and relying on 'max-md:items-center' (from flex) for centering the button.
      */}
      <div className="absolute top-[20px] left-[60px] max-md:top-auto max-md:bottom-[30px] max-md:left-0 z-[1000] flex flex-col gap-[15px] items-start max-md:items-center max-md:w-full pointer-events-none">
        
        <ControlPanel 
            isLocating={isLocating}
            userLocation={userLocation}
            onToggle={handleToggleLocation}
            closestStores={closestStores}
            isPanelVisible={isPanelVisible}
            onStoreClick={handleStoreClick}
        />

      </div>

      <div className="w-full h-full z-[1] bg-[#E5E9EC]">
        <MapController 
            stores={STORE_DATA}
            triggerLocate={triggerLocate}
            resetMap={resetMap}
            flyToStore={flyToStore}
            onLocationFound={handleLocationFound}
            onLocationError={() => {
                alert("Could not access your location.");
                handleToggleLocation();
            }}
            onSortedStores={handleStoresSorted}
        />
      </div>
    </div>
  );
}
