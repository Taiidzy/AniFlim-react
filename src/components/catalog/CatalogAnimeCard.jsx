import React from 'react';
import { Link } from 'react-router-dom';
import { ClipLoader } from "react-spinners";

const CatalogAnimeCard = ({
  handleLoadMore,
  results,
  hasMore,
  loading
}) => {
  if (results.length === 0)
    return (
      <div className="flex flex-col gap-4 mx-auto w-full lg:max-w-4xl px-4">
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 lg:p-8 shadow-2xl border-2 border-purple-500/30">
          <p className="text-center text-white">Ничего не нашлось</p>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col gap-4 mx-auto w-full lg:max-w-4xl px-4">
      {results.map((item, index) => (
        <Link
          key={index}
          className="hover:scale-105 transition-transform"
          to={`/anime/${item.alias}`}
        >
          <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 lg:p-8 shadow-2xl border-2 border-purple-500/30">
            <div className="flex flex-col md:flex-row items-start gap-4">
              <div className="flex-shrink-0 w-full md:w-[180px]">
                <img
                  src={`https://anilibria.top${item.poster?.optimized?.src}`}
                  alt={item.name?.main || 'Без названия'}
                  className="object-cover w-full h-full transition-transform rounded-xl"
                  loading="lazy"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-center md:text-left text-white mb-4">
                  {item.title || item.name?.main || 'Без названия'}
                </h2>
                <div>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 items-center">
                    {item.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="bg-gray-900 text-white border border-purple-500/30 px-2 py-1 rounded text-xs md:text-sm"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                  <hr className="border-t border-gray-600 my-4" />
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 items-center">
                    <p className="bg-gray-900 text-white border border-purple-500/30 px-2 py-1 rounded text-xs md:text-sm">
                      {item.year || 'Год отсутствует'}
                    </p>
                    <p className="bg-gray-900 text-white border border-purple-500/30 px-2 py-1 rounded text-xs md:text-sm">
                      {item.season?.description || 'Сезон отсутствует'}
                    </p>
                    <p className="bg-gray-900 text-white border border-purple-500/30 px-2 py-1 rounded text-xs md:text-sm">
                      {item.type?.description || 'Тип отсутствует'}
                    </p>
                    <p className="bg-gray-900 text-white border border-red-500/30 px-2 py-1 rounded text-xs md:text-sm">
                      {item.age_rating?.label || 'Возрастное ограничение отсутствует'}
                    </p>
                  </div>
                  <hr className="border-t border-gray-600 my-4" />
                  <p className="text-gray-600 line-clamp-3">
                    {item.description || 'Описание отсутствует'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
      {loading && (
        <div className="flex justify-center items-center py-4">
          <ClipLoader color="#3498db" size={50} />
        </div>
      )}
      {!loading && hasMore && (
        <button
          onClick={handleLoadMore}
          className="mt-2 p-2 bg-gray-800 text-white rounded-xl transition w-full border-2 border-purple-500/30 cursor-pointer hover:bg-gray-900"
        >
          Загрузить ещё
        </button>
      )}
    </div>
  );
};

export default CatalogAnimeCard;
