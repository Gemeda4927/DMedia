'use client';

import { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';

interface VideoPlayerProps {
  url: string;
  hlsUrl?: string;
  youtubeEmbedUrl?: string;
  youtubeVideoId?: string;
  title?: string;
  onProgress?: (progress: number) => void;
  className?: string;
}

export default function VideoPlayer({ 
  url, 
  hlsUrl,
  youtubeEmbedUrl,
  youtubeVideoId,
  title, 
  onProgress,
  className = '' 
}: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const playerRef = useRef<ReactPlayer>(null);

  // Determine video URL - prioritize YouTube if available
  const getVideoUrl = () => {
    if (youtubeEmbedUrl) {
      // Convert embed URL to watch URL for ReactPlayer
      const videoId = youtubeEmbedUrl.match(/embed\/([^?]+)/)?.[1] || youtubeVideoId;
      if (videoId) {
        return `https://www.youtube.com/watch?v=${videoId}`;
      }
      return youtubeEmbedUrl;
    }
    if (url?.includes('youtube.com') || url?.includes('youtu.be')) {
      return url;
    }
    return hlsUrl || url;
  };

  const videoUrl = getVideoUrl();
  const isYouTube = videoUrl?.includes('youtube.com') || videoUrl?.includes('youtu.be');

  const handleProgress = (state: { played: number; playedSeconds: number }) => {
    setProgress(state.played);
    if (onProgress) {
      onProgress(state.playedSeconds);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTo = parseFloat(e.target.value);
    setProgress(seekTo);
    if (playerRef.current) {
      playerRef.current.seekTo(seekTo);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      <div className="relative pt-[56.25%]">
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          playing={playing}
          volume={volume}
          muted={muted}
          width="100%"
          height="100%"
          className="absolute top-0 left-0"
          onProgress={handleProgress}
          onDuration={setDuration}
          controls
          config={{
            youtube: {
              playerVars: {
                autoplay: 0,
                controls: 1,
                modestbranding: 1,
                rel: 0,
                showinfo: 0,
              },
            },
            file: {
              attributes: {
                controlsList: 'nodownload',
              },
              hlsOptions: {
                enableWorker: true,
              },
            },
          }}
        />
      </div>
      
      {title && (
        <div className="p-4 bg-gray-900">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          {isYouTube && (
            <p className="text-sm text-gray-400 mt-1">Playing from YouTube</p>
          )}
        </div>
      )}
    </div>
  );
}

