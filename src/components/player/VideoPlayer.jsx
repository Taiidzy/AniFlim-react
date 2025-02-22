import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Hls from 'hls.js';

const VideoPlayer = ({
  toggleFullscreen,
  autoSkipOppening,
  togglePlayPause,
  setCurrentTime,
  setIsPlaying,
  modeMarathon,
  currentTime,
  videoRef,
  episode,
  quality,
  id,
}) => {
  const hlsRef = useRef(null);
  const prevEpisodeIdRef = useRef(id);
  const socket = useRef(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userData, setUserData] = useState(null);
  const [lastTime, setLastTime] = useState(0);
  const navigate = useNavigate();

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
        setUserData(response.data);
      } catch (error) {
        if (error.response.status == 401) {
          localStorage.removeItem('token');
          setUserData(null);
          setToken(null);
        }
      }
    };
    fetchData();
  }, [token, episode]);

  useEffect(() => {
    if (!episode || !episode.opening || !videoRef.current) return;
  
    const ordinal = episode.ordinal
    const duration = episode.duration
    const videoElement = videoRef.current;
    const openingStart = episode.opening.start;
    const openingStop = episode.opening.stop;
    const endingStart = episode.ending.start;
    const endingStop = episode.ending.stop;
    const allEpisode = episode.release.episodes.length;
    let nextepisode= '';
    if (allEpisode > ordinal) {
      nextepisode = episode.release.episodes[ordinal].id
    }
  
    const handleMarathon = () => {
      const currentTime = videoElement.currentTime;
      if (modeMarathon) {
        if (currentTime >= openingStart && currentTime < openingStop && ordinal !== 1) {
          videoElement.currentTime = openingStop;
        }
        if (currentTime >= endingStart && currentTime < endingStop && allEpisode > ordinal) {
          videoElement.currentTime = endingStop;
        }
        if (videoElement.currentTime >= duration - 0.1) {
          navigate(`/episode/${nextepisode}`);
        }
      }
    };
  
    videoElement.addEventListener('timeupdate', handleMarathon);
  
    return () => {
      videoElement.removeEventListener('timeupdate', handleMarathon);
    };
  }, [modeMarathon, episode, videoRef]);

  useEffect(() => {
    if(!episode.opening.start || !episode.opening.stop || !videoRef) return;
    const handleTimeUpdate = () => {
      if (autoSkipOppening && videoRef.current.currentTime >= episode.opening.start && videoRef.current.currentTime < episode.opening.stop) {
        videoRef.current.currentTime = episode.opening.stop;
      }
    };
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.addEventListener('timeupdate', handleTimeUpdate);
    }
    return () => {
      if (videoElement) {
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      }
    };
  }, [autoSkipOppening, episode.opening.start, episode.opening.stop, videoRef]);

  useEffect(() => {
    if (!episode || !videoRef.current || !quality) return;
    
    const video = videoRef.current;
    const wasPlaying = !video.paused;
    // Если userData уже загружен, используем его значение, иначе сохраняем текущее время
    let savedTime = 0;

    if (userData && episode.ordinal === userData.episode) {
      savedTime = userData.currenttime
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
  }, [episode, quality, id, videoRef, setIsPlaying, userData]);
  

  useEffect(() => {
    const wsUrl = `wss://aniflim.space/api/ws?token=${encodeURIComponent(token)}`;
    socket.current = new WebSocket(wsUrl);
  
    // Когда соединение установлено
    socket.current.onopen = () => {
    };
  
    // При возникновении ошибки
    socket.current.onerror = (error) => {
      socket.current.close();
    };
  
    // При получении сообщения от сервера
    socket.current.onmessage = (event) => {
    };
  
    // При закрытии соединения
    socket.current.onclose = () => {
      socket.current = null; // Очищаем ссылку на сокет
    };
  
    return () => {
      if (socket.current) {
        socket.current.close();
      }
    };
  }, [token, id]);
  
  const handleTimeUpdate = () => {
    if (!socket.current || socket.current.readyState !== WebSocket.OPEN) {
      const wsUrl = `wss://aniflim.space/api/ws?token=${encodeURIComponent(token)}`;
      socket.current = new WebSocket(wsUrl);
      return; // Не отправляем данные, если сокет закрыт или закрывается
    }
  
    const currentTime = videoRef.current.currentTime;
  
    if (Math.floor(currentTime) > Math.floor(lastTime)) {
      const data = {
        animeid: episode.release.id,
        episode: episode.ordinal,
        currenttime: Math.floor(currentTime),
        duration: episode.duration,
      };
      socket.current.send(JSON.stringify(data));
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
      autoPlay
      onPlay={() => setIsPlaying(true)}
      onPause={() => setIsPlaying(false)}
      onClick={togglePlayPause}
      onDoubleClick={toggleFullscreen}
    />
  );
};

export default VideoPlayer;
