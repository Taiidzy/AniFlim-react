import React, { useEffect } from 'react';
import Hls from 'hls.js';

const VideoPlayer = ({
  episode,
  quality,
  id,
  videoRef,
  currentTime,
  setCurrentTime,
  setIsPlaying,
  togglePlayPause
}) => {
  const hlsRef = React.useRef(null);
  const prevEpisodeIdRef = React.useRef(id);

  useEffect(() => {
    if (!episode || !videoRef.current || !quality) return;
    
    const video = videoRef.current;
    const wasPlaying = !video.paused;
    let savedTime = video.currentTime;
    if (prevEpisodeIdRef.current !== id) {
      savedTime = 0;
    }
    prevEpisodeIdRef.current = id;

    // Уничтожаем предыдущий экземпляр HLS, если он есть
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const streamUrl = episode[quality];
    if (Hls.isSupported()) {
      const hls = new Hls({ autoStartLoad: true, capLevelToPlayerSize: true });
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      const onManifestParsed = () => {
        video.currentTime = savedTime;
        if (wasPlaying) {
          video.play().catch(() => setIsPlaying(false));
        }
        hls.off(Hls.Events.MANIFEST_PARSED, onManifestParsed);
      };
      hls.on(Hls.Events.MANIFEST_PARSED, onManifestParsed);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      const onLoadedMetadata = () => {
        video.currentTime = savedTime;
        video.play();
        video.removeEventListener('loadedmetadata', onLoadedMetadata);
      };
      video.addEventListener('loadedmetadata', onLoadedMetadata);
    }
  }, [episode, quality, id, videoRef, setIsPlaying]);

  return (
    <video
      ref={videoRef}
      className="h-full w-full object-contain"
      onTimeUpdate={() => {
        if (videoRef.current) {
          setCurrentTime(videoRef.current.currentTime);
        }
      }}
      onPlay={() => setIsPlaying(true)}
      onPause={() => setIsPlaying(false)}
      onClick={togglePlayPause}
    />
  );
};

export default VideoPlayer;
