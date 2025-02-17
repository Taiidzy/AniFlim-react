import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import VideoPlayer from '../components/player/VideoPlayer';
import PlayerControls from '../components/player/PlayerControls';
import EpisodeList from '../components/player/EpisodeList';
import * as Icons from '../components/Icons';

const PlayerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [episode, setEpisode] = useState(null);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [quality, setQuality] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const timeoutRef = useRef(null);
  

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
        episode={episode}
        quality={quality}
        id={id}
        videoRef={videoRef}
        setCurrentTime={setCurrentTime}
        setIsPlaying={setIsPlaying}
        togglePlayPause={togglePlayPause}
        toggleFullscreen={toggleFullscreen}
      />

      <PlayerControls
        videoRef={videoRef}
        episode={episode}
        currentTime={currentTime}
        isPlaying={isPlaying}
        togglePlayPause={togglePlayPause}
        volume={volume}
        isMuted={isMuted}
        toggleMute={toggleMute}
        handleVolumeChange={handleVolumeChange}
        formatTime={formatTime}
        quality={quality}
        setQuality={setQuality}
        setShowEpisodes={setShowEpisodes}
        showControls={showControls}
        onInteraction={handleInteraction}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
      />

      <EpisodeList
        episodes={episode.release.episodes}
        showEpisodes={showEpisodes}
        setShowEpisodes={setShowEpisodes}
        currentEpisodeId={id}
      />
    </div>
  );
};

export default PlayerPage;