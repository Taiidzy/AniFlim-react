import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Hls from 'hls.js';
import * as Icons from '../components/Icons';

const PlayerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const progressBarRef = useRef(null);

  const [episode, setEpisode] = useState(null);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const prevEpisodeIdRef = useRef(id);
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

  // После загрузки эпизода устанавливаем дефолтное качество (предпочтительно hls_720, если есть)
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

  // Слушатели событий play/pause для синхронизации состояния кнопки воспроизведения
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, []);

  // Инициализация HLS-плеера (и смена качества) с сохранением текущего времени
  useEffect(() => {
    if (!episode || !videoRef.current || !quality) return;
  
    const video = videoRef.current;
    const wasPlaying = !video.paused;
    // Если переключился эпизод, сбрасываем время в 0, иначе сохраняем текущее время
    let savedTime = video.currentTime;
    if (prevEpisodeIdRef.current !== id) {
      savedTime = 0;
    }
    // Обновляем ref с текущим идентификатором эпизода
    prevEpisodeIdRef.current = id;
  
    // Уничтожаем предыдущий экземпляр Hls, если он есть
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
  }, [episode, quality, id]);
  

  // Обновление текущего времени
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  // Обработчик клика по прогресс-бару для перемотки
  const handleProgressClick = useCallback((e) => {
    if (!episode || !progressBarRef.current || !videoRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = percent * episode.duration;
  }, [episode]);

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

  // Переключение воспроизведения с обновлением состояния вручную
  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });
    } else {
      video.pause();
      setIsPlaying(false);
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
    <div className="h-screen w-full bg-gray-900 relative group">
      <Link
        to={`/anime/${episode.release.alias}`}
        className="absolute top-4 left-4 z-20 p-2 text-red-50 hover:text-red-500 transition-colors"
      >
        <Icons.ArrowLeft02Icon className="w-8 h-8 text-rose-900 hover:text-red-800" />
      </Link>
      <video
        ref={videoRef}
        className="h-full w-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onClick={togglePlayPause}
      />

      {/* Overlay с контролами */}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 transition-opacity duration-300 opacity-100 group-hover:opacity-100">
        {/* Прогресс-бар */}
        <div 
          ref={progressBarRef}
          className="h-2 bg-gray-700 rounded-full mb-4 cursor-pointer"
          onClick={handleProgressClick}
        >
          <div 
            className="h-full bg-red-600 rounded-full relative transition-all duration-100"
            style={{ width: `${(currentTime / episode.duration) * 100}%` }}
          >
            <div className="w-3 h-3 bg-red-600 rounded-full absolute -right-1.5 -top-0.5 shadow-lg" />
          </div>
        </div>

        {/* Нижняя панель контролов */}
        <div className="flex flex-col gap-4">
          {/* Отображение времени и кнопки пропуска опенинга/эндинга */}
          <div className="flex items-center justify-between text-white">
            <span className="font-mono text-sm sm:text-base">{formatTime(currentTime)}</span>
            
            <div className="flex items-center gap-2">
              {currentTime >= episode.opening.start && currentTime < episode.opening.stop && (
                <button
                  onClick={() => {
                    videoRef.current.currentTime = episode.opening.stop;
                  }}
                  className="flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1 bg-red-600/90 hover:bg-red-700 rounded-full transition-all"
                >
                  <Icons.NextIcon className="text-base sm:text-lg text-amber-50 cursor-pointer" />
                  <span className="text-xs sm:text-sm hidden sm:inline">Пропустить опенинг</span>
                </button>
              )}

              {currentTime >= episode.ending.start && currentTime < episode.ending.stop && (
                <button
                  onClick={() => {
                    videoRef.current.currentTime = episode.ending.stop;
                  }}
                  className="flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1 bg-red-600/90 hover:bg-red-700 rounded-full transition-all"
                >
                  <Icons.NextIcon className="text-base sm:text-lg text-amber-50 cursor-pointer" />
                  <span className="text-xs sm:text-sm hidden sm:inline">Пропустить эндинг</span>
                </button>
              )}
            </div>

            <span className="font-mono text-sm sm:text-base">{formatTime(episode.duration)}</span>
          </div>

          {/* Главные контролы */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={togglePlayPause}
                className="p-1 sm:p-2 text-white hover:text-red-500 transition-colors"
              >
                {isPlaying ? (
                  <Icons.StopIcon className="w-6 h-6 sm:w-8 sm:h-8 text-amber-50 cursor-pointer" />
                ) : (
                  <Icons.PlayIcon className="w-6 h-6 sm:w-8 sm:h-8 text-amber-50 cursor-pointer" />
                )}
              </button>

              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={toggleMute}
                  className="p-1 sm:p-2 text-white hover:text-red-500 transition-colors"
                >
                  {isMuted ? (
                    <Icons.VolumeMute02Icon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-50 cursor-pointer" />
                  ) : (
                    <Icons.VolumeHighIcon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-50 cursor-pointer" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-16 sm:w-24 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer accent-red-500"
                />
              </div>

              {/* Кнопка открытия/закрытия выдвижного меню с эпизодами */}
              <button
                onClick={() => setShowEpisodes(!showEpisodes)}
                className="p-1 sm:p-2 text-white hover:text-red-500 transition-colors"
              >
                <Icons.LeftToRightListBulletIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 cursor-pointer" />
              </button>
            </div>

            {/* Выбор качества – динамически формируется из доступных ключей */}
            <div className="flex items-center gap-2 sm:gap-4">
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="bg-gray-800/70 text-white text-sm sm:text-base px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg backdrop-blur-sm border border-gray-600 focus:border-red-500 outline-none transition-all cursor-pointer"
              >
                {Object.keys(episode)
                  .filter(key => key.startsWith('hls_'))
                  .sort((a, b) => {
                    const aNum = parseInt(a.split('_')[1], 10);
                    const bNum = parseInt(b.split('_')[1], 10);
                    return aNum - bNum;
                  })
                  .map(q => {
                    const label = q.split('_')[1] + 'p';
                    return (
                      <option key={q} value={q}>
                        {label}
                      </option>
                    );
                  })}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Выдвижное меню с эпизодами */}
      <div
        className={`fixed top-0 left-0 h-full w-full sm:w-80 bg-gray-900/90 backdrop-blur-lg z-30 shadow-2xl p-4 transition-transform duration-300 ${
          showEpisodes ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h3 className="text-white text-lg sm:text-xl font-semibold flex items-center gap-2">
            <Icons.Tv01Icon className="text-red-500" />
            Эпизоды
          </h3>
          <button
            onClick={() => setShowEpisodes(false)}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Icons.Cancel01Icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-50 cursor-pointer" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 gap-4 max-h-[85vh] overflow-y-auto">
          {episode.release.episodes.map((ep) => (
            <Link
              key={ep.id}
              to={`/episode/${ep.id}`}
              onClick={() => setShowEpisodes(false)}
              className="group relative block rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all"
            >
              <div className="aspect-video bg-gray-900">
                <div className="w-full h-full bg-cover bg-center transition-transform duration-300 hover:scale-105" style={{ backgroundImage: `url(https://anilibria.top${ep.preview.src})` }}>
                  <div className="absolute inset-0 bg-black/50 transition-opacity group-hover:bg-black/40">
                    <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white p-3">
                      <h3 className="text-base md:text-lg font-bold mb-1 truncate max-w-[90%]">
                        {ep.name || `Эпизод ${ep.ordinal}`}
                      </h3>
                      <p className="text-sm md:text-base text-gray-200">
                        Эпизод {ep.ordinal}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlayerPage;
