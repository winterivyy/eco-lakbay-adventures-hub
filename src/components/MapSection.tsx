import { useEffect, useRef } from "react";

const MapSection = () => {
  const mapContainer = useRef(null);

  useEffect(() => {
    const initMap = () => {
      if (!window.mapboxgl || !mapContainer.current) return;

      window.mapboxgl.accessToken =
        "pk.eyJ1Ijoic2Vhbm1nY2xzIiwiYSI6ImNtaDA3aXloeTB5ZHoyam9qMGQwcWMwODMifQ.HF3buxwFOgazG8Z2j61b7g";

      const map = new window.mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [120.65, 15.08], // Pampanga region
        zoom: 8,
      });

      map.addControl(new window.mapboxgl.NavigationControl(), "top-right");
    };

    // ✅ Retry if the Mapbox script isn’t ready yet
    if (window.mapboxgl) {
      initMap();
    } else {
      const wait = setInterval(() => {
        if (window.mapboxgl) {
          clearInterval(wait);
          initMap();
        }
      }, 300);
    }
  }, []);

  return (
    <section className="relative py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-forest">
          Explore Sustainable Destinations
        </h2>
        <p className="text-lg text-gray-600 mt-2">
          Discover eco-certified spots across Pampanga and the Philippines.
        </p>
      </div>

      <div
        ref={mapContainer}
        className="w-full h-[500px] rounded-2xl shadow-lg border border-gray-200"
      />
    </section>
  );
};

export default MapSection;
