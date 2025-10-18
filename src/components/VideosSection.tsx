import React, { useState } from "react";

type Video = {
  id: string;
  title: string;
  youtubeId: string;
  description?: string;
};

const VIDEOS: Video[] = [
  {
    id: "v1",
    title: "Sustainable Travel Tips",
    youtubeId: "2Xu6Wp1-jXmmQn6Y",
    description: "Top ways to travel sustainably and reduce your footprint.",
  },
  {
    id: "v2",
    title: "Protecting Coastal Ecosystems",
    youtubeId: "2Xu6Wp1-jXmmQn6Y",
    description: "How communities protect shorelines and wildlife.",
  },
  {
    id: "v3",
    title: "Eco-Friendly Camping",
    youtubeId: "2Xu6Wp1-jXmmQn6Y",
    description: "Leave no trace principles and practical tips.",
  },
];

export default function VideosSection() {
  const [active, setActive] = useState<Video | null>(null);

  // helper to build a safer embed URL (privacy-enhanced)
  const makeEmbedUrl = (youtubeId: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const params = new URLSearchParams({
      autoplay: "1",
      modestbranding: "1",
      rel: "0",
      playsinline: "1",
      origin,
    }).toString();

    // privacy-enhanced domain
    return `https://www.youtube-nocookie.com/embed/${youtubeId}?${params}`;
  };

  // fallback direct YouTube watch url
  const makeWatchUrl = (youtubeId: string) => `https://www.youtube.com/watch?v=${youtubeId}`;

  return (
    <section id="videos" className="max-w-6xl mx-auto py-12 px-4">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Watch & Learn</h2>
        <p className="text-sm text-muted-foreground">
          Curated videos about environmental protection, sustainable travel, and community projects.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {VIDEOS.map((v) => (
          <div key={v.id} className="bg-white dark:bg-card rounded-lg shadow overflow-hidden">
            <button
              onClick={() => setActive(v)}
              className="w-full text-left"
              aria-label={`Open video: ${v.title}`}
            >
              <div className="relative">
                <img
                  src={`https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`}
                  alt={v.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/50 rounded-full p-3">
                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium">{v.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{v.description}</p>
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setActive(null)}
        >
          <div
            className="bg-black rounded-lg max-w-4xl w-full aspect-video overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full">
              {/* primary embed (privacy-enhanced domain) */}
              <iframe
                title={active.title}
                src={makeEmbedUrl(active.youtubeId)}
                className="w-full h-full"
                frameBorder="0"
                // recommended allow string; autoplay may still be blocked by browser policy
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
              />

              {/* control row with fallback link */}
              <div className="absolute top-2 right-2 flex gap-2">
                <a
                  href={makeWatchUrl(active.youtubeId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/90 text-sm px-3 py-1 rounded"
                >
                  Open on YouTube
                </a>
                <button
                  onClick={() => setActive(null)}
                  className="bg-white/90 rounded-full p-1 text-sm"
                  aria-label="Close video"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
