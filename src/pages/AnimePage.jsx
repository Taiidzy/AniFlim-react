import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import axios from "axios";
import { FiMenu, FiX } from "react-icons/fi";

import SideBar from "../components/anime/SideBar";
import EpisodesList from "../components/anime/EpisodesList";
import AgeRatingBadge from "../components/anime/AgeRatingBadge";
import BlockPage from "./BlockPage";

const AnimePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [anime, setAnime] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userData, setUserData] = useState(null);
  const [franchises, setFranchises] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [listStatus, setListStatus] = useState('');

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        const response = await axios.get(
          `https://anilibria.top/api/v1/anime/releases/${id}`
        );
        setAnime(response.data);
      } catch (error) {
        navigate('/error');
      }
    };
  
    fetchAnime();
  }, [id, navigate]);

  useEffect(() => {
    if (!anime) return; // Проверка на null перед выполнением запроса
    const getFranchises = async () => {
      try {
        const response = await axios.get(
          `https://anilibria.top/api/v1/anime/franchises/release/${anime.id}`
        );
        setFranchises(response.data);
      } catch (error) {
        navigate('/error');
      }
    };
  
    getFranchises();
  }, [anime]); // Зависимостью остается только anime, без anime.id

  useEffect(() => {
    const fetchData = async () => {
      if (!token || !anime) return; // Проверяем, что token и anime загружены
      try {
        const response = await axios.post('https://aniflim.space/api/user/anime', {
          animeid: anime.id
        }, {
          headers: { "x-token": token }
        });
  
        if (response.status === 401) {
          localStorage.removeItem('token');
          setUserData(null);
          setToken(null);
        }
  
        setListStatus(response.data.status);
        setUserData(response.data);
      } catch (error) {
        console.log('error: ', error);
      }
    };
  
    fetchData();
  }, [token, anime]);

  const updateList = async (newListStatus) => {
    if (!token) return;
    try {
      if (newListStatus === "not") {
        const response = await axios.delete('https://aniflim.space/api/anime', {
          headers: { "x-token": token },
          data: { animeid: anime.id }
        });
        if (response.status === 401) {
          localStorage.removeItem('token');
          setUserData(null);
          setToken(null);
          fetchData();
        }
        fetchData();
      } else {
        const response = await axios.patch('https://aniflim.space/api/anime', {
          action: newListStatus,
          animeid: anime.id,
          episode: userData.episode || 1
        }, {
          headers: { "x-token": token }
        });
        if (response.status === 401) {
          localStorage.removeItem('token');
          setUserData(null);
          setToken(null);
          fetchData();
        }
        fetchData();
      }
    } catch (error) {
      console.log('error: ', error);
      fetchData();
    }
  };
  
  if (!anime) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ClipLoader color="#3498db" size={50} />
      </div>
    );
  }

  if (anime.is_blocked_by_geo == true) {
    return <BlockPage />;
  }

  const posterUrl = anime.poster?.optimized?.src || anime.poster?.src || "";

  return (
    <div className="container mx-auto px-4 py-6 lg:py-8 flex flex-col lg:flex-row gap-6 relative">
      {/* Mobile Sidebar Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed right-4 bottom-4 z-50 p-3 bg-purple-600 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
      >
        {isSidebarOpen ? (
          <FiX className="w-6 h-6 text-white" />
        ) : (
          <FiMenu className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Main Content */}
      <div className="flex-1 lg:max-w-[calc(100%-400px)]">
        <div className="flex flex-col md:flex-row gap-6 mb-8 items-center md:items-start">
          <div className="w-48 md:w-64 flex-shrink-0">
            <img
              src={`https://anilibria.top${posterUrl}`}
              alt={anime.name.main}
              className="rounded-lg shadow-lg w-full h-auto object-cover"
              loading="lazy"
            />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-50">
              {anime.name.main}
            </h1>
            <p className="mb-4 text-gray-400 text-sm md:text-base leading-relaxed">
              {anime.description}
            </p>
            <div className="mb-4 flex flex-wrap justify-center md:justify-start gap-3">
              <AgeRatingBadge 
                label={anime.age_rating.label} 
                description={anime.age_rating.description} 
              />
            </div>
            {anime.genres?.length > 0 && (
              <div className="flex flex-wrap justify-center md:justify-start gap-2 items-center">
                {anime.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="bg-gray-900 text-white border-purple-500/30 border-1 px-2 py-1 rounded text-xs md:text-sm"
                  >
                    {genre.name}
                  </span>
                ))}

                {userData ? (
                  <select
                    name="list"
                    value={listStatus}
                    onChange={(e) => updateList(e.target.value)} // Вызов функции updateList
                    className="bg-gray-800/70 text-white text-sm sm:text-base px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg backdrop-blur-sm border border-gray-600 focus:border-red-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="not">Нету в списках</option>
                    <option value="watching">Смотрю</option>
                    <option value="watched">Просмотрено</option>
                    <option value="planed">Запланировано</option>
                  </select>
                ) : null}
              </div>
            )}
          </div>
        </div>

        <EpisodesList episodes={anime.episodes} currentEpisode={userData?.episode} />
      </div>

      {/* Sidebar (Hidden on Mobile by Default) */}
      <div className={`lg:static lg:translate-x-0 fixed top-0 right-0 h-full w-80 z-40 bg-gray-800/90 backdrop-blur-sm transition-transform duration-300 ease-in-out rounded-xl p-8 shadow-2xl border-2 border-purple-500/30 ${
        isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <SideBar 
          members={anime.members} 
          torrents={anime.torrents}
          alias={anime.alias}
          franchises={franchises}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>
    </div>
  );
};

export default AnimePage;