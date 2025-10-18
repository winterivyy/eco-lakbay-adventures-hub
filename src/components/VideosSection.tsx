import React, { useEffect, useState } from "react";

type Video = {
  id: string; // unique id for internal use
  title: string;
  youtubeId: string;
  description?: string;
  // mark whether it was added by user (persisted to localStorage) so we can allow deletion
  userAdded?: boolean;
};

const DEFAULT_VIDEOS: Video[] = [
  {
    id: "v1",
    title: "Sustainable Travel Tips",
    youtubeId: "vzlS4P-R-rk",
    description: "Top ways to travel sustainably and reduce your footprint.",
  },
  {
    id: "v2",
    title: "Protecting Coastal Ecosystems",
    youtubeId: "3JZ_D3ELwOQ",
    description: "How communities protect shorelines and wildlife.",
  },
  {
    id: "v3",
    title: "Eco-Friendly Camping",
    youtubeId: "Zi_XLOBDo_Y",
    description: "Leave no trace principles and practical tips.",
  },
];

const LOCAL_STORAGE_KEY = "eco-lakbay-videos";

function parseYouTubeId(urlOrId: string): string | null {
  // Accept either a plain 11-char id or a full youtube url
  const trimmed = urlOrId.trim();

  // If it's already an 11-char id
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;

  // Try to parse common YouTube URL forms
  // Examples:
  // - https://www.youtube.com/watch?v=VIDEOID
  // - https://youtu.be/VIDEOID
  // - https://www.youtube.com/embed/VIDEOID
  const re =
    /(?:youtube\.com\/(?:watch\?.*v=|embed\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
  const m = trimmed.match(re);
  if (m && m[1]) return m[1];

  return null;
}

export default function VideosSection() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [active, setActive] = useState<Video | null>(null);

  // Form state for adding a video
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    // load saved videos from localStorage and merge with defaults (defaults first)
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      const saved: Video[] = raw ? JSON.parse(raw) : [];
      // ensure unique by youtubeId, keep defaults first, then user saved ones that are not duplicates
      const map = new Map<string, Video>();
      DEFAULT_VIDEOS.forEach((v) => map.set(v.youtubeId, v));
      saved.forEach((v) => map.set(v.youtubeId, { ...v, userAdded: true }));
      setVideos(Array.from(map.values()));
    } catch (err) {
      // fallback to defaults
      setVideos(DEFAULT_VIDEOS);
    }
  }, []);

  const persistUserVideos = (updated: Video[]) => {
    try {
      const userVideos = updated.filter((v) => v.userAdded);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userVideos));
    } catch (err) {
      console.error("Failed to persist videos to localStorage", err);
    }
  };

  const handleAddVideo = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isAdding) return;
    setIsAdding(true);

    const youtubeId = parseYouTubeId(videoUrl);
    if (!youtubeId) {
      alert("Please enter a valid YouTube URL or video ID.");
      setIsAdding(false);
      return;
    }

    const title = videoTitle.trim() || "New Video";
    const description = videoDescription.trim();

    const newVideo: Video = {
      id: `user-${Date.now()}`,
      title,
      youtubeId,
      description,
      userAdded: true,
    };

    const updated = [newVideo, ...videos];
    setVideos(updated);
    persistUserVideos(updated);

    // clear form
    setVideoUrl("");
    setVideoTitle("");
    setVideoDescription("");
    setIsAdding(false);
  };

  const handleRemoveVideo = (id: string) => {
    if (!confirm("Remove this video from your homepage?")) return;
    const updated = videos.filter((v) => v.id !== id);
    setVideos(updated);
    persistUserVideos(updated);
  };

  return (
    <section id="videos" className="max-w-6xl mx-auto py-12 px-4">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Watch & Learn</h2>
        <p className="text-sm text-muted-foreground">
          Curated videos about environmental protection, sustainable travel, and community projects.
        </p>
      </div>

      {/* Simple add-video form (persists to localStorage) */}
      <form onSubmit={handleAddVideo} className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          placeholder="YouTube URL or video id (e.g. https://youtu.be/VIDEOID)"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className="col-span-1 sm:col-span-2 px-3 py-2 rounded border"
          aria-label="YouTube URL or ID"
        />
        <div className="flex gap-2">
          <input
            placeholder="Title (optional)"
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            className="px-3 py-2 rounded border flex-1"
            aria-label="Video title"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-forest text-white rounded"
            disabled={isAdding}
          >
            {isAdding ? "Adding..." : "Add"}
          </button>
        </div>

        <input
          placeholder="Short description (optional)"
          value={videoDescription}
          onChange={(e) => setVideoDescription(e.target.value)}
          className="col-span-1 sm:col-span-3 px-3 py-2 rounded border"
          aria-label="Video description"
        />
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((v) => (
          <div key={v.id} className="bg-white dark:bg-card rounded-lg shadow overflow-hidden relative">
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

            {/* show remove button for user-added videos */}
            {v.userAdded && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveVideo(v.id);
                }}
                className="absolute top-2 right-2 bg-white/90 rounded-full p-1 text-sm"
                aria-label="Remove video"
                title="Remove video"
              >
                ✕
              </button>
            )}
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
              <iframe
                title={active.title}
                src={`https://www.youtube.com/embed/${active.youtubeId}?autoplay=1`}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <button
                onClick={() => setActive(null)}
                className="absolute top-2 right-2 bg-white/90 rounded-full p-1"
                aria-label="Close video"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
