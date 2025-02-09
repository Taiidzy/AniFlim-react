import React from 'react';

function MagnetButton({ magnet }) {

  // Функция для копирования текста в буфер обмена
  const handleDownload = () => {
    // Копируем текст в буфер обмена
    navigator.clipboard.writeText(magnet)
      .catch((err) => {
        // Обработка ошибки, если копирование не удалось
        console.error('Ошибка при копировании в буфер обмена: ', err);
      });
  };

  return (
    <button id={magnet} onClick={handleDownload}>
      <i className="mdi-magnet-on mdi text-gray-400 text-sm"></i>
    </button>
  );
}

export default MagnetButton;
