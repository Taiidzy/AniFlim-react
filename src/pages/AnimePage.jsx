import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import axios from "axios";
import styles from "../styles/AnimePage.module.css";
import TorrentButton from "../components/buttons/TorrentButton";
import MagnetButton from "../components/buttons/MagnetButton";
import SidebarMembers from "../components/SidebarMembers";

const AnimePage = () => {
  const { id } = useParams();
  const [anime, setAnime] = useState(null);

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        const response = await axios.get(
          `https://anilibria.top/api/v1/anime/releases/${id}`
        );
        console.log(response.data);
        setAnime(response.data);
      } catch (error) {
        console.error("Ошибка получения данных аниме:", error);
      }
    };

    fetchAnime();
  }, [id]);

  if (!anime) {
    return (
      <div className={styles.loader}>
        <ClipLoader color="#3498db" size={50} />
      </div>
    );
  }

  const posterUrl = anime.poster?.optimized?.src || anime.poster?.src || "";

  return (
    <div className="anime-page container mx-auto p-4 flex flex-col lg:flex-row gap-6">
      {/* Основной контент */}
      <div className="flex-1">
        <div className="anime-header flex flex-col md:flex-row gap-6 mb-8 items-center md:items-start">
          <div className="anime-poster flex-shrink-0 w-48 md:w-64">
            <img
              src={`https://anilibria.top${posterUrl}`}
              alt={anime.name.main}
              className="rounded-lg shadow-lg w-full h-auto object-cover"
            />
          </div>
          <div className="anime-details flex-1 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-50">
              {anime.name.main}
            </h1>
            <p className="mb-4 text-slate-700">{anime.description}</p>
            {anime.genres && anime.genres.length > 0 && (
              <div className="genres flex flex-wrap justify-center md:justify-start gap-2">
                {anime.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Сетка эпизодов */}
        <div className="episodes mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-center md:text-left text-gray-50">
            Эпизоды
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {anime.episodes
              .sort((a, b) => a.ordinal - b.ordinal)
              .map((episode) => {
                const episodeBg = episode.preview
                  ? `https://anilibria.top${episode.preview.src}`
                  : `https://anilibria.top${posterUrl}`;
                return (
                  <Link
                    key={episode.id}
                    to={`/episode/${episode.id}`}
                    className="relative block rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform"
                    style={{ width: "100%", maxHeight: "150px", minHeight: "100px" }}
                  >
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${episodeBg})` }}
                    >
                      <div className="absolute inset-0 bg-black opacity-50"></div>
                      <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white p-4">
                        <h3 className="text-lg font-bold">
                          {episode.name || `Эпизод ${episode.ordinal}`}
                        </h3>
                        <p className="mt-2">Эпизод {episode.ordinal}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
          </div>
        </div>
      </div>

      {/* Боковая панель */}
      <div className="w-full lg:w-96 bg-gray-800 p-4 rounded-lg shadow-lg hidden lg:block">
        <h1 className="text-lg font-bold text-white mb-4 text-center">Дополнительная информация</h1>
        <hr className="h-1 mx-auto my-4 bg-gray-100 border-0 rounded-sm md:my-10 dark:bg-gray-700" />
        <h2 className="text-lg font-bold text-white mb-4">Участники</h2>
        <SidebarMembers members={anime.members} />
        <hr className="h-1 mx-auto my-4 bg-gray-100 border-0 rounded-sm md:my-10 dark:bg-gray-700" />
        <h2 className="text-lg font-bold text-white mb-4">Торренты</h2>
          <div className="space-y-4">
          {anime.torrents.map((torrent) => (
            <div className="flex items-center justify-between gap-4 p-4 bg-gray-900 rounded-lg">
              <div className="flex flex-col">
                <h2 className="text-white w-36 h-8 rounded-full">Эпизоды: {torrent.description}</h2>
                <span className="text-gray-400 text-xs">
                  {(torrent.size / 1024 / 1024 / 1024).toFixed(2)} GB | {torrent.type.value} | {torrent.quality.value} | {torrent.codec.value}
                </span>
              </div>
              <TorrentButton torrent={torrent.id} />
              <MagnetButton magnet={torrent.magnet} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnimePage;
