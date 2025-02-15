import React from 'react';
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const BlockPage = () => {
  const navigate = useNavigate();
  return (
    <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br p-4">
        <div className="bg-gray-800 bg-opacity-80 rounded-lg shadow-2xl p-8 max-w-lg w-full text-center">
          <h1 className="text-4xl font-extrabold text-red-500 mb-6 animate-pulse">
            Данное аниме заблокировано
          </h1>
          <img
            src="/error.png" // Замените на URL вашей аниме-картинки
            alt="Anime Blocked"
            className="w-full rounded-md mb-6"
          />
          <p className="text-gray-200 text-lg">
            Извините, но доступ к этому тайтлу был ограничен на территории вашей страны.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            style={{
              marginTop: '20px',
              backgroundColor: '#7a1d5b',
              color: '#ffffff'
            }}
            className="font-semibold px-8 py-3 rounded-lg transition-colors duration-200 transform shadow-lg hover:shadow-purple-900/30 cursor-pointer"
          >
            На главную
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default BlockPage;
