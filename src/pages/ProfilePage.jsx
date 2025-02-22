import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import axios from 'axios';

import ChangeAvatar from '../components/profile/modals/СhangeAvatar';
import ChangePassword from '../components/profile/modals/СhangePassword';
import DeleteAccount from '../components/profile/modals/DeleteAccount';
import ConfirmDelete from '../components/profile/modals/ConfirmDelete';

import AnimeCard from '../components/AnimeCard';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userData, setUserData] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [activeTab, setActiveTab] = useState('watching');
  const [totalTime, setTotalTime] = useState(0);
  const [animeList, setAnimeList] = useState([]);
  const [deleteData, setDeleteData] = useState({
    login: '',
    password: ''
  });
  // Добавляем состояние для обновления версии аватарки
  const [avatarVersion, setAvatarVersion] = useState(Date.now());

  useEffect(() => {
    if (!token) navigate('/login');
    else {
      const get_user = async () => {
        try {
          const response = await axios.get('https://aniflim.space/api/user/info', {
            headers: { "x-token": token }
          });
          setUserData(response.data);
        } catch (error) {
          console.error(error);
          if (error.response?.status === 401 || error.response?.status === 404) {
            localStorage.removeItem('token');
            setToken(null);
            navigate('/login');
          }
        }
      };
      get_user();
    }
  }, [token, navigate]);

  useEffect(() => {
    const calculateTotalTime = async () => {
      let timeString = '';
      const totalTime = userData?.total_time;
  
      if (totalTime === 0) {
        timeString = '0 Секунд';
      } else if (totalTime < 60) {
        // Секунды
        const seconds = totalTime;
        let secondsLabel = 'Секунд';
        if (seconds % 10 === 1 && seconds % 100 !== 11) {
          secondsLabel = 'Секунда';
        } else if (seconds % 10 >= 2 && seconds % 10 <= 4 && (seconds % 100 < 10 || seconds % 100 >= 20)) {
          secondsLabel = 'Секунды';
        }
        timeString = `${seconds} ${secondsLabel}`;
      } else if (totalTime < 3600) {
        // Минуты
        const minutes = Math.floor(totalTime / 60);
        let minutesLabel = 'Минут';
        if (minutes % 10 === 1 && minutes % 100 !== 11) {
          minutesLabel = 'Минута';
        } else if (minutes % 10 >= 2 && minutes % 10 <= 4 && (minutes % 100 < 10 || minutes % 100 >= 20)) {
          minutesLabel = 'Минуты';
        }
        timeString = `${minutes} ${minutesLabel}`;
      } else {
        // Часы
        const hours = Math.floor(totalTime / 3600);
        let hourLabel = 'Часов';
        if (hours % 10 === 1 && hours % 100 !== 11) {
          hourLabel = 'Час';
        } else if (hours % 10 >= 2 && hours % 10 <= 4 && (hours % 100 < 10 || hours % 100 >= 20)) {
          hourLabel = 'Часа';
        }
        timeString = `${hours} ${hourLabel}`;
      }
      setTotalTime(timeString);
    };
    calculateTotalTime();
  }, [userData]);  

  useEffect(() => {
    const fetchAnimeData = async () => {
      const categoryMap = {
        watching: 'watching',
        watched: 'watched',
        planed: 'planed'
      };

      const category = categoryMap[activeTab];
      const categoryItems = userData[category] || [];

      try {
        // Создаем запросы для каждого элемента в категории
        const requests = categoryItems.map(item =>
          axios.get(`https://anilibria.top/api/v1/anime/releases/${item.id}`)
            .then(response => ({
              release: response.data,
              episode: item.episode
            }))
            .catch(error => {
              console.error(`Ошибка получения аниме ${item.id}:`, error);
              return null;
            })
        );

        const responses = await Promise.all(requests);
        const validData = responses.filter(item => item !== null);

        setAnimeList(validData);
      } catch (error) {
        console.error('Ошибка при выполнении запросов:', error);
        setAnimeList([]);
      }
    };
    
    fetchAnimeData();
  }, [activeTab, userData]);

  const handleLogout = async () => {
    try {
      await axios.post(
        'https://aniflim.space/api/user/logout',
        null, // Тело запроса отсутствует
        { headers: { "x-token": token } }
      );
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setToken(null);
        navigate('/login');
      }
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      navigate('/');
    }
  };
  
  return (
    <div className="container mx-auto p-2 sm:p-4">
      {/* Модальные окна */}
      {(modalType || confirmDelete) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          {modalType === 'password' && (
            <ChangePassword
              token={token}
              setModalType={setModalType}
              userData={userData}
            />
          )}

          {modalType === 'delete' && !confirmDelete && (
            <DeleteAccount
              setModalType={setModalType}
              setConfirmDelete={setConfirmDelete}
              setDeleteData={setDeleteData}
              deleteData={deleteData}
            />
          )}

          {modalType === 'avatar' && (
            <ChangeAvatar 
              token={token} 
              setModalType={setModalType} 
              setUserData={setUserData}
              setAvatarVersion={setAvatarVersion}
            />
          )}

          {confirmDelete && (
            <ConfirmDelete
              token={token}
              setModalType={setModalType}
              setToken={setToken}
              deleteData={deleteData}
            />
          )}
        </div>
      )}

      {/* Основной контент */}
      <div className="flex flex-col lg:grid lg:grid-cols-[350px_1fr] gap-4 lg:gap-8">
        {/* Левая колонка */}
        <div className="space-y-4 lg:space-y-6">
          <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 lg:p-8 shadow-2xl border-2 border-purple-500/30">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full mx-auto mb-4">
              {!userData ? (
                <div className="flex justify-center items-center min-h-[150px]">
                  <ClipLoader color="#3498db" size={50} />
                </div>
              ) : (
                <img
                  src={`https://aniflim.space${userData?.avatar}?v=${avatarVersion}`}
                  alt="User Avatar"
                  className="w-full h-full object-cover rounded-full"
                />
              )}
            </div>
            <div className="space-y-2 text-center">
              <button
                onClick={handleLogout}
                className="w-full p-2 text-sm sm:text-base text-white hover:text-gray-800 hover:bg-gray-100 rounded transition-colors cursor-pointer"
              >
                Выход
              </button>
              <button
                onClick={() => setModalType('password')}
                className="w-full p-2 text-sm sm:text-base text-white hover:text-gray-800 hover:bg-gray-100 rounded transition-colors cursor-pointer"
              >
                Изменить пароль
              </button>
              <button
                onClick={() => setModalType('avatar')}
                className="w-full p-2 text-sm sm:text-base text-white hover:text-gray-800 hover:bg-gray-100 rounded transition-colors cursor-pointer"
              >
                Изменить аватар
              </button>
              <button
                onClick={() => setModalType('delete')}
                className="w-full p-2 text-sm sm:text-base text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
              >
                Удалить аккаунт
              </button>
            </div>
          </div>

          <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 lg:p-8 shadow-2xl border-2 border-purple-500/30">
            <h2 className="text-lg sm:text-xl font-bold mb-3 text-center text-white">Информация</h2>
            {!userData ? (
              <div className="flex justify-center items-center">
                <ClipLoader color="#3498db" size={50} />
              </div>
            ) : (
              <div className="space-y-2">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent text-center">
                  {userData?.login}
                </h1>
                <p className="text-xs sm:text-sm font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                  Общее время просмотра: {totalTime}
                </p>
                <p className="text-xs sm:text-sm font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                  Всего просмотрено: {userData?.watched.length}
                </p>
                <p className="text-xs sm:text-sm font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                  Всего аниме: {userData?.watching.length + userData?.watched.length + userData?.planed.length} 
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Правая колонка */}
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 lg:p-8 shadow-2xl border-2 border-purple-500/30">
          <div className="flex overflow-x-auto pb-2 mb-4 lg:mb-6">
            <div className="flex gap-2 min-w-fit">
              <button
                key={"watching"}
                className={`px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg cursor-pointer transition-colors ${
                  activeTab === 'watching' ? 'bg-orange-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
                onClick={() => setActiveTab('watching')}
              >
                Смотрю {userData?.watching.length}
              </button>
              <button
                key={"watched"}
                className={`px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg cursor-pointer transition-colors ${
                  activeTab === 'watched' ? 'bg-orange-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
                onClick={() => setActiveTab('watched')}
              >
                Просмотрено {userData?.watched.length}
              </button>
              <button
                key={"planed"}
                className={`px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg cursor-pointer transition-colors ${
                  activeTab === 'planed' ? 'bg-orange-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
                onClick={() => setActiveTab('planed')}
              >
                Запланировано {userData?.planed.length}
              </button>
            </div>
          </div>

          {!userData ? (
            <div className="flex justify-center items-center min-h-[570px]">
              <ClipLoader color="#3498db" size={50} />
            </div>
          ) : (
            <div>
              {animeList.length === 0 ? 
                <div className="text-center text-gray-400 py-8">Нет аниме</div> : 
                <AnimeCard animeList={animeList} />
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
