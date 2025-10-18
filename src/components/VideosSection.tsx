import React from "react";
import { useVideo } from "./VideoProvider"; // Make sure to import the hook

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
  const { setActiveVideo } = useVideo();

  return (
    <section id="videos" className="max-w-6xl mx-auto py-12 px-4">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Watch & Learn</h2>
        <p className="text-sm text-muted-foreground">
          Curated videos about environmental protection, sustainable travel, and
          community projects.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {VIDEOS.map((v) => (
          <div
            key={v.id}
            className="bg-white dark:bg-card rounded-lg shadow overflow-hidden"
          >
            <button
              onClick={() => setActiveVideo(v)}
              className="w-full text-left"
              aria-label={`Play video: ${v.title}`}
            >
              <div className="relative">
                <img
                  src={`https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`}
                  alt={v.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/50 rounded-full p-3">
                    <svg
                      className="w-8 h-8 text-white"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium">{v.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {v.description}
                </p>
              </div>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}```

### 3. `FloatingVideoPlayer.tsx` - The New Player Component

Create this new component. It will be responsible for displaying the video in a fixed position at the corner of the screen whenever there's an active video in our `VideoContext`.

```tsx
import React from "react";
import { useVideo } from "./VideoProvider";

export default function FloatingVideoPlayer() {
  const { activeVideo, setActiveVideo } = useVideo();

  if (!activeVideo) {
    return null;
  }

  const makeEmbedUrl = (youtubeId: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const params = new URLSearchParams({
      autoplay: "1",
      modestbranding: "1",
      rel: "0",
      playsinline: "1",
      origin,
    }).toString();
    return `https://www.youtube-nocookie.com/embed/${youtubeId}?${params}`;
  };

  const makeWatchUrl = (youtubeId: string) =>
    `https://www.youtube.com/watch?v=${youtubeId}`;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-black rounded-lg shadow-lg max-w-sm w-full aspect-video overflow-hidden">
        <div className="relative w-full h-full">
          <iframe
            title={activeVideo.title}
            src={makeEmbedUrl(activeVideo.youtubeId)}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
          <div className="absolute top-1 right-1 flex gap-2">
            <a
              href={makeWatchUrl(activeVideo.youtubeId)}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/90 text-xs px-2 py-1 rounded"
            >
              YouTube
            </a>
            <button
              onClick={() => setActiveVideo(null)}
              className="bg-white/90 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold"
              aria-label="Close video"
            >
              ✕
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
            <h3 className="text-white text-sm font-semibold truncate">
              {activeVideo.title}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}
