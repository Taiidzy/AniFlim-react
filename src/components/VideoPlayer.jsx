import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

const VideoPlayer = ({ streamUrl, qualities = [] }) => {
  const videoRef = useRef(null);

  // Если есть качества, используем первое, иначе создаём дефолтное значение
  const initialQuality =
    qualities.length > 0 ? qualities[0] : { quality: 'auto', url: streamUrl };
  const [currentQuality, setCurrentQuality] = useState(initialQuality);

  // Выбираем URL для воспроизведения: если установлено качество, берем его url, иначе исходный streamUrl
  const selectedStreamUrl = currentQuality?.url || streamUrl;

  useEffect(() => {
    if (videoRef.current) {
      // Если браузер поддерживает HLS нативно, задаём src напрямую
      if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        videoRef.current.src = selectedStreamUrl;
      } else if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(selectedStreamUrl);
        hls.attachMedia(videoRef.current);
        return () => {
          hls.destroy();
        };
      }
    }
  }, [selectedStreamUrl]);

  const handleQualityChange = (quality) => {
    setCurrentQuality(quality);
    // Дополнительно можно обновлять URL потока, если требуется (useEffect сработает автоматически)
  };

  return (
    <div className="video-player">
      <video ref={videoRef} controls style={{ width: '100%' }} />
      {qualities.length > 0 && (
        <div className="quality-selector" style={{ marginTop: '8px' }}>
          <span>Качество: </span>
          {qualities.map((q) => (
            <button
              key={q.quality} // Используем строковое значение качества в качестве ключа
              onClick={() => handleQualityChange(q)}
              className={currentQuality?.quality === q.quality ? 'active' : ''}
              style={{
                marginRight: '8px',
                padding: '4px 8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor:
                  currentQuality?.quality === q.quality ? '#007bff' : '#fff',
                color: currentQuality?.quality === q.quality ? '#fff' : '#000',
                cursor: 'pointer',
              }}
            >
              {q.quality}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
