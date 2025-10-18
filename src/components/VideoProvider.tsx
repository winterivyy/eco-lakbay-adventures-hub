import React, { createContext, useState, useContext, ReactNode } from "react";

type Video = {
  id: string;
  title: string;
  youtubeId: string;
  description?: string;
};

type VideoContextType = {
  activeVideo: Video | null;
  setActiveVideo: (video: Video | null) => void;
};

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const VideoProvider = ({ children }: { children: ReactNode }) => {
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  return (
    <VideoContext.Provider value={{ activeVideo, setActiveVideo }}>
      {children}
    </VideoContext.Provider>
  );
};

export const useVideo = () => {
  const context = useContext(VideoContext);
  if (context === undefined) {
    throw new Error("useVideo must be used within a VideoProvider");
  }
  return context;
};
