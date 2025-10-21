import { useEffect, useRef } from "react";

const MapSection = () => {
  const mapContainer = useRef(null);

  useEffect(() => {
    // Wait until Mapbox script is available globally
    if (!window.mapboxgl) return;

    window.mapboxgl.accessToken =
      "YOUR_MAPBOX_ACCESS_TOKEN"; // 🔑 replace with your token

    const map = new window.mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [120.65, 15.08], // Pampanga region
      zoom: 8,
    });

    map.addControl(new window.mapboxgl.NavigationControl(), "top-right");

    return () => map.remove();
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
