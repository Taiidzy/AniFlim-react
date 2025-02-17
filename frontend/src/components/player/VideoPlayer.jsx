import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Hls from 'hls.js';

const VideoPlayer = ({
  episode,
  quality,
  id,
  videoRef,
  currentTime,
  setCurrentTime,
  setIsPlaying,
  togglePlayPause,
  toggleFullscreen
}) => {
  const hlsRef = useRef(null);
  const prevEpisodeIdRef = useRef(id);
  const socket = useRef(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userData, setUserData] = useState(null);
  const [lastTime, setLastTime] = useState(0);

  // UseEffect for data fetching
  useEffect(() => {
    const fetchData = async () => {
      if (!token || !episode) return;
      try {
        const response = await axios.post('https://aniflim.space/api/user/anime/progress/get', {
          animeid: episode.release.id
        }, {
          headers: { "x-token": token }
        });

        if (response.status === 401) {
          localStorage.removeItem('token');
          setUserData(null);
          setToken(null);
        } else {
          setUserData(response.data);
        }
      } catch (error) {
        console.log('Error fetching data: ', error);
      }
    };
    fetchData();
  }, [token, episode]);

  // UseEffect for HLS setup
  useEffect(() => {
    if (!episode || !videoRef.current || !quality) return;
    
    const video = videoRef.current;
    const wasPlaying = !video.paused;
    let savedTime = video.currentTime;

    if (prevEpisodeIdRef.current !== id) {
      savedTime = 0;
    }
    prevEpisodeIdRef.current = id;

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
      video.currentTime = savedTime;
      video.play();
    }
  }, [episode, quality, id, videoRef, setIsPlaying]);

  useEffect(() => {
    if (userData && userData.currenttime && videoRef.current) {
      videoRef.current.currentTime = userData.currenttime;
    }
  }, [userData]);

  useEffect(() => {
    if (!token) return;

    socket.current = new WebSocket(`ws://localhost:5020/ws?token=${token}`);

    socket.current.onerror = (error) => {
      console.log('WebSocket Error:', error);
    };

    return () => {
      socket.current.close();
    };
  }, [token]);

  const handleTimeUpdate = () => {
    const currentTime = videoRef.current.currentTime;
  
    if (Math.floor(currentTime) > Math.floor(lastTime)) {
      socket.current.send(JSON.stringify({
        animeid: episode.release.id,
        episode: episode.ordinal,
        currenttime: Math.floor(currentTime),
        duration: episode.duration
      }));
      setLastTime(currentTime);
    }
  };

  return (
    <video
      ref={videoRef}
      className="h-full w-full object-cover"
      onTimeUpdate={() => {
        if (videoRef.current) {
          setCurrentTime(videoRef.current.currentTime);
          handleTimeUpdate();
        }
      }}
      onPlay={() => setIsPlaying(true)}
      onPause={() => setIsPlaying(false)}
      onClick={togglePlayPause}
      onDoubleClick={toggleFullscreen}
    />
  );
};

export default VideoPlayer;
