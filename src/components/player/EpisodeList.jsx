// src/components/PlayerPage/EpisodeList.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import * as Icons from '../Icons'; // проверьте путь к иконкам

const EpisodeList = ({ episodes, showEpisodes, setShowEpisodes, currentEpisodeId }) => {
  if (!episodes) return null;
  
  return (
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
        {episodes.map((ep) => (
          <Link
            key={ep.id}
            to={`/episode/${ep.id}`}
            onClick={() => setShowEpisodes(false)}
            className={`group relative block rounded-lg overflow-hidden shadow-lg hover:shadow-xl border-2 transition-all ${currentEpisodeId == ep.id ? 'border-red-600' : ''}`}
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
  );
};

export default EpisodeList;
