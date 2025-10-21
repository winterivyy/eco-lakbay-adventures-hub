// src/components/MapPampanga.tsx

import { useState, useEffect } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import { supabase } from '@/integrations/supabase/client';

// Mapbox CSS is required
import 'mapbox-gl/dist/mapbox-gl.css';

// --- Interfaces ---
export interface Location {
  id: number;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
}

// --- Component ---
const PAMPANGA_COORDS = {
  longitude: 120.68,
  latitude: 15.08,
  zoom: 9.5
};

export default function MapPampanga() {
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // This useEffect fetches BOTH the token and the locations from Supabase
  useEffect(() => {
    const fetchMapData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // --- Fetch the Mapbox Token ---
        const { data: tokenData, error: tokenError } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'mapbox_token')
          .single(); // .single() gets one row instead of an array

        if (tokenError) throw new Error(`Could not fetch map configuration: ${tokenError.message}`);
        if (!tokenData) throw new Error("Mapbox token not found in the database.");
        
        // --- Fetch the Locations ---
        const { data: locationsData, error: locationsError } = await supabase
          .from('locations')
          .select('*');

        if (locationsError) throw new Error(`Could not fetch locations: ${locationsError.message}`);

        // --- Set the State ---
        setMapboxToken(tokenData.value);
        setLocations(locationsData || []);

      } catch (err: any) {
        console.error("Error loading map data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMapData();
  }, []); // The empty array ensures this runs only once

  // --- Conditional Rendering for a great User Experience ---
  if (isLoading) {
    return <div className="w-full h-[500px] flex items-center justify-center bg-gray-200 rounded-lg"><p>Loading Map...</p></div>;
  }

  if (error) {
    return <div className="w-full h-[500px] flex items-center justify-center bg-red-100 text-red-700 rounded-lg"><p>Error: {error}</p></div>;
  }
  
  if (!mapboxToken) {
    return <div className="w-full h-[500px] flex items-center justify-center bg-gray-200 rounded-lg"><p>Map configuration is missing.</p></div>;
  }

  // --- Render the Map once everything is loaded ---
  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden shadow-lg">
      <Map
        initialViewState={PAMPANGA_COORDS}
        mapboxAccessToken={mapboxToken}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
        {locations.map((location) => (
          <Marker
            key={location.id}
            longitude={location.longitude}
            latitude={location.latitude}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedLocation(location);
            }}
          >
            <div className="text-3xl cursor-pointer">📍</div>
          </Marker>
        ))}

        {selectedLocation && (
          <Popup
            longitude={selectedLocation.longitude}
            latitude={selectedLocation.latitude}
            onClose={() => setSelectedLocation(null)}
            anchor="top"
          >
            <div>
              <h3 className="font-bold">{selectedLocation.name}</h3>
              <p>{selectedLocation.description}</p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
