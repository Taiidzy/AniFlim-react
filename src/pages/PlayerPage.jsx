import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import VideoPlayer from '../components/player/VideoPlayer';
import PlayerControls from '../components/player/PlayerControls';
import EpisodeList from '../components/player/EpisodeList';
import * as Icons from '../components/Icons'; // убедитесь, что путь корректный

const PlayerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [episode, setEpisode] = useState(null);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [quality, setQuality] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

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

  // Установка дефолтного качества после загрузки данных
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

  // Обработчик переключения воспроизведения
  const togglePlayPause = useCallback(() => {
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
  }, []);

  // Обработчик изменения громкости
  const handleVolumeChange = useCallback((e) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);

  // Переключение mute
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  }, []);

  // Функция форматирования времени в формате mm:ss
  const formatTime = useCallback((seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  if (!episode) {
    return <div className="h-screen w-full bg-gray-900 animate-pulse" />;
  }

  return (
    <div className="fixed top-0 left-0 h-screen w-screen bg-gray-200/20">
      <Link
        to={`/anime/${episode.release.alias}`}
        className="absolute top-4 left-4 z-20 p-2 text-red-50 hover:text-red-500 transition-colors"
      >
        <Icons.ArrowLeft02Icon className="w-8 h-8 text-rose-900 hover:text-red-800" />
      </Link>

      <VideoPlayer 
        episode={episode}
        quality={quality}
        id={id}
        videoRef={videoRef}
        currentTime={currentTime}
        setCurrentTime={setCurrentTime}
        setIsPlaying={setIsPlaying}
        togglePlayPause={togglePlayPause}
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
      />

      <EpisodeList
        episodes={episode.release.episodes}
        showEpisodes={showEpisodes}
        setShowEpisodes={setShowEpisodes}
      />
    </div>
  );
};

export default PlayerPage;
