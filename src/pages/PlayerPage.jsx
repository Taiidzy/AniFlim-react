import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import VideoPlayer from '../components/player/VideoPlayer';
import PlayerControls from '../components/player/PlayerControls';
import EpisodeList from '../components/player/EpisodeList';
import * as Icons from '../components/Icons';

const PlayerPage = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [autoSkipOppening, setAutoSkipOppening] = useState();
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [modeMarathon, setModeMarathon] = useState();
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [episode, setEpisode] = useState(null);
  const [quality, setQuality] = useState(null);
  const [lastTime, setLastTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const containerRef = useRef(null);
  const timeoutRef = useRef(null);
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const socket = useRef(null);
  const { id } = useParams();

  useEffect(() => {
    const savedAutoSkipOppening = localStorage.getItem("autoSkipOppening");
    const savedModeMarathon = localStorage.getItem("autoModeMarathon");
    if (savedAutoSkipOppening !== null) {
      if (savedAutoSkipOppening === 'undefined') {
        setAutoSkipOppening(false)
      } else {
        setAutoSkipOppening(JSON.parse(savedAutoSkipOppening));
      }
    }
    if (savedModeMarathon !== null) {
      if (savedModeMarathon === 'undefined') {
        setModeMarathon(false)
      } else {
        setModeMarathon(JSON.parse(savedModeMarathon));
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("autoSkipOppening", JSON.stringify(autoSkipOppening));
    localStorage.setItem("autoModeMarathon", JSON.stringify(modeMarathon));
  }, [autoSkipOppening, modeMarathon]);

  // Логика скрытия контролов
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setShowControls(false), 2000);
  }, []);

  const handleInteraction = useCallback(() => {
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  useEffect(() => {
    resetControlsTimeout();
    return () => clearTimeout(timeoutRef.current);
  }, [resetControlsTimeout]);

  // Обработчик движения мыши
  const handleMouseMove = useCallback(() => {
    handleInteraction(); // Всегда вызываем обработчик взаимодействия
    if (!containerRef.current) return;
  
    // Логика курсора только для полноэкранного режима
    if (isFullscreen) {
      setShowControls(true);
      containerRef.current.style.cursor = 'default';
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setShowControls(false)
        if (containerRef.current) {
          containerRef.current.style.cursor = 'none';
        }
      }, 2000);
    }
  }, [isFullscreen, handleInteraction]);

  // Полноэкранный режим
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(console.error);
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(console.error);
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      const isFullscreenNow = !!document.fullscreenElement;
      setIsFullscreen(isFullscreenNow);
      if (!isFullscreenNow && containerRef.current) {
        containerRef.current.style.cursor = 'default';
      }
    };
    
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Загрузка данных эпизода
  useEffect(() => {
    const fetchEpisode = async () => {
      try {
        const response = await axios.get(
          `https://anilibria.top/api/v1/anime/releases/episodes/${id}`
        );
        setEpisode(response.data);
      } catch (error) {
        navigate('/error');
      }
    };
    fetchEpisode();
  }, [id, navigate]);

  // Установка дефолтного качества
  useEffect(() => {
    if (episode && !quality) {
      const availableQualities = Object.keys(episode).filter(key => key.startsWith('hls_'));
      let defaultQuality = availableQualities.find(q => q === 'hls_720');
      if (!defaultQuality && availableQualities.length > 0) {
        defaultQuality = availableQualities.sort((a, b) => {
          const aNum = parseInt(a.split('_')[1], 10);
          const bNum = parseInt(b.split('_')[1], 10);
          return aNum - bNum;
        })[0];
      }
      setQuality(defaultQuality);
    }
  }, [episode, quality]);

  // Обработчики управления
  const togglePlayPause = useCallback(() => {
    handleInteraction();
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [handleInteraction]);

  const handleVolumeChange = useCallback((e) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    handleInteraction();
  }, [handleInteraction]);

  const toggleMute = useCallback(() => {
    handleInteraction();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  }, [handleInteraction]);

  const formatTime = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  if (!episode) {
    return <div className="h-screen w-full bg-gray-900 animate-pulse" />;
  }

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 h-screen w-screen bg-black"
      onMouseMove={handleMouseMove}
      onTouchMove={handleInteraction}
    >
      <Link
        to={`/anime/${episode.release.alias}`}
        className="absolute top-4 left-4 z-20 p-2 "
      >
        <Icons.ArrowLeft02Icon className="w-8 h-8 text-red-50 hover:text-red-500 transition-colors" />
      </Link>

      <VideoPlayer 
        toggleFullscreen={toggleFullscreen}
        autoSkipOppening={autoSkipOppening}
        togglePlayPause={togglePlayPause}
        setCurrentTime={setCurrentTime}
        setIsPlaying={setIsPlaying}
        modeMarathon={modeMarathon}
        videoRef={videoRef}
        episode={episode}
        quality={quality}
        id={id}
      />

      <PlayerControls
        setAutoSkipOppening={setAutoSkipOppening}
        handleVolumeChange={handleVolumeChange}
        autoSkipOppening={autoSkipOppening}
        toggleFullscreen={toggleFullscreen}
        togglePlayPause={togglePlayPause}
        setModeMarathon={setModeMarathon}
        onInteraction={handleInteraction}
        setShowEpisodes={setShowEpisodes}
        showControls={showControls}
        isFullscreen={isFullscreen}
        modeMarathon={modeMarathon}
        currentTime={currentTime}
        toggleMute={toggleMute}
        formatTime={formatTime}
        setQuality={setQuality}
        isPlaying={isPlaying}
        videoRef={videoRef}
        episode={episode}
        isMuted={isMuted}
        quality={quality}
        volume={volume}
      />

      <EpisodeList
        episodes={episode.release.episodes}
        setShowEpisodes={setShowEpisodes}
        showEpisodes={showEpisodes}
        currentEpisodeId={id}
      />
    </div>
  );
};

export default PlayerPage;