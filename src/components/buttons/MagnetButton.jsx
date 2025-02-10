import React from 'react';

function MagnetButton({ magnet }) {

  // Функция для копирования текста в буфер обмена
  const handleDownload = () => {
    // Check if Clipboard API is available
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(magnet)
        .then(() => {
          console.log('Текст скопирован!');
        })
        .catch((err) => {
          console.error('Ошибка при копировании в буфер обмена: ', err);
        });
    } else {
      // Fallback for browsers that do not support navigator.clipboard
      fallbackCopyTextToClipboard(magnet);
    }
  };

  // Fallback copy method using a temporary textarea
  const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      console.log(successful ? 'Fallback: Текст скопирован!' : 'Fallback: Не удалось скопировать текст');
    } catch (err) {
      console.error('Fallback: Ошибка при копировании текста', err);
    }

    document.body.removeChild(textArea);
  };

  return (
    <button id={magnet} onClick={handleDownload}>
      <i className="mdi-magnet-on mdi text-gray-400 text-sm"></i>
    </button>
  );
}

export default MagnetButton;
