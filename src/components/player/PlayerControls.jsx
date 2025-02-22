import React, { useRef, useCallback, useState } from 'react';
import * as Icons from '../Icons';

const PlayerControls = ({
  setAutoSkipOppening,
  handleVolumeChange,
  autoSkipOppening,
  toggleFullscreen,
  togglePlayPause,
  setModeMarathon,
  setShowEpisodes,
  onInteraction,
  showControls,
  isFullscreen,
  modeMarathon,
  currentTime,
  toggleMute,
  setQuality,
  formatTime,
  isPlaying,
  videoRef,
  episode,
  isMuted,
  quality,
  volume,
}) => {
  const progressBarRef = useRef(null);
  const [showSettings, setShowSettings] = useState(false);
  const handleProgressClick = useCallback((e) => {
    if (!episode || !progressBarRef.current || !videoRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = percent * episode.duration;
    onInteraction();
  }, [episode, videoRef, onInteraction]);

  return (
    <div className={`absolute inset-0 flex flex-col justify-end 
      bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 
      transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}
      pointer-events-none`}
    >
      <div className="pointer-events-auto relative">
        <div 
        ref={progressBarRef}
        className="h-2 bg-gray-700 rounded-full mb-4 cursor-pointer"
        onClick={handleProgressClick}
        >
          <div className="h-full bg-red-600 rounded-full relative transition-all duration-100" style={{ width: `${(currentTime / episode.duration) * 100}%` }} >
            <div className="w-3 h-3 bg-red-600 rounded-full absolute -right-1.5 -top-0.5 shadow-lg" />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-white">
            <span className="font-mono text-sm sm:text-base">{formatTime(currentTime)}</span>
            <div className="flex items-center gap-2">
              {currentTime >= episode.opening.start && currentTime < episode.opening.stop && (
                <button
                  onClick={() => {
                    videoRef.current.currentTime = episode.opening.stop;
                    onInteraction();
                  }}
                  className="flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1 bg-red-600/90 hover:bg-red-700 rounded-full transition-all  cursor-pointer"
                >
                  <Icons.NextIcon className="text-base sm:text-lg text-amber-50 cursor-pointer" />
                  <span className="text-xs sm:text-sm hidden sm:inline">Пропустить опенинг</span>
                </button>
              )}
              {currentTime >= episode.ending.start && currentTime < episode.ending.stop && (
                <button
                  onClick={() => {
                    videoRef.current.currentTime = episode.ending.stop;
                    onInteraction();
                  }}
                  className="flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1 bg-red-600/90 hover:bg-red-700 rounded-full transition-all  cursor-pointer"
                >
                  <Icons.NextIcon className="text-base sm:text-lg text-amber-50 cursor-pointer" />
                  <span className="text-xs sm:text-sm hidden sm:inline">Пропустить эндинг</span>
                </button>
              )}
            </div>
            <span className="font-mono text-sm sm:text-base">{formatTime(episode.duration)}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => {
                  togglePlayPause();
                  onInteraction();
                }}
                className="p-1 sm:p-2"
              >
                {isPlaying ? (
                  <Icons.StopIcon className="w-6 h-6 sm:w-8 sm:h-8 text-amber-50 cursor-pointer hover:text-red-500 transition-colors" />
                ) : (
                  <Icons.PlayIcon className="w-6 h-6 sm:w-8 sm:h-8 text-amber-50 cursor-pointer hover:text-red-500 transition-colors" />
                )}
              </button>
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => {
                    toggleMute();
                    onInteraction();
                  }}
                  className="p-1 sm:p-2"
                >
                  {isMuted ? (
                    <Icons.VolumeMute02Icon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-50 cursor-pointer hover:text-red-500 transition-colors" />
                  ) : (
                    <Icons.VolumeHighIcon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-50 cursor-pointer hover:text-red-500 transition-colors" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => {
                    handleVolumeChange(e);
                    onInteraction();
                  }}
                  className="w-16 sm:w-24 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer accent-red-500"
                />
              </div>
              <button
                onClick={() => {
                  setShowEpisodes(prev => !prev);
                  onInteraction();
                }}
                className="p-1 sm:p-2"
              >
                <Icons.LeftToRightListBulletIcon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-50 cursor-pointer hover:text-red-500 transition-colors" />
              </button>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => {
                  toggleFullscreen();
                  onInteraction();
                }}
                className="p-1 sm:p-2"
              >
                {isFullscreen ? (
                  <Icons.SquareArrowShrink02Icon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-50 cursor-pointer hover:text-red-500 transition-colors" />
                ) : (
                  <Icons.SquareArrowExpand01Icon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-50 cursor-pointer hover:text-red-500 transition-colors" />
                )}
              </button>
              <select
                value={quality}
                onChange={(e) => {
                  setQuality(e.target.value);
                  onInteraction();
                }}
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
              {showSettings && (
                <div className="absolute bottom-full mb-2 right-0 w-64 bg-gray-800 p-2 rounded-lg shadow-lg text-white items-center justify-center">
                  <div className="flex flex-col  gap-4">
                    <div 
                      className="flex items-center space-x-4 cursor-pointer select-none"
                      onClick={() => setModeMarathon(!modeMarathon)}
                    >
                      <span className="text-sm font-medium">
                        Режим марафона
                      </span>
                      <div className={`w-13 h-7 flex items-center rounded-full p-1 transition-all duration-500 ${modeMarathon ? "bg-red-500" : "bg-gray-300"}`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-all ${modeMarathon ? "translate-x-6" : "translate-x-0"}`} />
                      </div>
                    </div>
                    <div 
                      className="flex items-center space-x-4 cursor-pointer select-none"
                      onClick={() => setAutoSkipOppening(!autoSkipOppening)}
                    >
                      <span className="text-sm font-medium">
                        Автопропуск опенинга
                      </span>
                      <div className={`w-13 h-7 flex items-center rounded-full p-1 transition-all duration-500 ${autoSkipOppening ? "bg-red-500" : "bg-gray-300"}`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-all ${autoSkipOppening ? "translate-x-6" : "translate-x-0"}`} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <button
                onClick={() => setShowSettings(prev => !prev)}
                className="p-1 sm:p-2 relative"
              >
                <Icons.Settings02Icon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-50 cursor-pointer hover:text-red-500 transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerControls;