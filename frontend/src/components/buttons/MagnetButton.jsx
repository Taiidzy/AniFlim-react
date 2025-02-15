import React from 'react';
import { motion } from "framer-motion";
import * as Icons from '../Icons';

function MagnetButton({ magnet }) {

  // Функция для копирования текста в буфер обмена
  const handleDownload = () => {
    // Check if Clipboard API is available
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(magnet)
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
    <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="font-semibold rounded-lg transition-colors duration-200 transform shadow-lg hover:shadow-purple-900/30 cursor-pointer"
    >
    
      <Icons.Magnet02Icon className="text-gray-400 text-sm cursor-pointer" />
  </motion.button>
  );
}

export default MagnetButton;
