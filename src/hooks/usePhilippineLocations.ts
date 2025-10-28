import { useState, useEffect } from 'react';

// Simplified interface for our location data structure
interface LocationData {
  [province: string]: {
    municipality_list: {
      [municipality: string]: {
        barangay_list: string[];
      };
    };
  };
}

export const usePhilippineLocations = () => {
  const [provinces, setProvinces] = useState<string[]>([]);
  const [municipalities, setMunicipalities] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        // We're fetching a structured JSON file of Philippine locations.
        // This is much more efficient than storing 42,000+ barangays in your database.
        const response = await fetch('https://raw.githubusercontent.com/flores-jacob/philippine-regions-provinces-cities-municipalities-barangays/master/philippine_provinces_cities_municipalities_and_barangays_2019v2.json');
        const data: LocationData = await response.json();

        const provinceList = Object.keys(data).sort();
        const municipalityMap: Record<string, string[]> = {};

        provinceList.forEach(province => {
          municipalityMap[province] = Object.keys(data[province].municipality_list).sort();
        });

        setProvinces(provinceList);
        setMunicipalities(municipalityMap);
      } catch (error) {
        console.error("Failed to fetch Philippine locations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  return { provinces, municipalities, loading };
};