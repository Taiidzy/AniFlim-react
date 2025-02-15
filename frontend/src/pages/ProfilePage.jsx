import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
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
  const [animeList, setAnimeList] = useState([]);
  const [deleteData, setDeleteData] = useState({
    login: '',
    password: ''
  });

  useEffect(() => {
    if (!token) navigate('/login');
    else {
      const get_user = async () => {
        try {
          const response = await axios.get('http://localhost:5020/user/info', {
            headers: { "x-token": token }
          });
          console.log(response.data)
          setUserData(response.data);
        } catch (error) {
          console.error(error);
          if (error.response?.status === 401) {
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
    const fetchAnimeData = async () => {
      if (!userData?.anime) return;
  
      const categoryMap = {
        watching: 'watching',
        watched: 'watched', 
        planned: 'planned'
      };
  
      const category = categoryMap[activeTab];
      const animeIds = Object.keys(userData.anime[category] || {});
  
      try {
        const requests = animeIds.map(id => 
          axios.get(`https://anilibria.top/api/v1/anime/releases/${id}`)
            .then(response => ({
              release: response.data, // Оборачиваем данные в объект release
              new_release_episode: null, // Добавляем недостающие поля
              new_release_episode_ordinal: null
            }))
            .catch(error => {
              console.error(`Ошибка получения аниме ${id}:`, error);
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
      const response = await axios.post(
        'http://localhost:5020/user/logout',
        null, // Тело запроса отсутствует
        { headers: { "x-token": token } }
      );
      console.log(response.data);
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
              <img
                src={`http://localhost:5020${userData?.avatar}`}
                alt="User Avatar"
                className="w-full h-full object-cover rounded-full"
              />
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
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent text-center">
                {userData?.login || 'Загрузка...'}
              </h1>
              <p className="text-xs sm:text-sm font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                Общее время просмотра: {userData?.createdAt || '4ч 32м'}
              </p>
              <p className="text-xs sm:text-sm font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                Всего просмотрено: 0
              </p>
            </div>
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
                Смотрю
              </button>
              <button
                key={"watched"}
                className={`px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg cursor-pointer transition-colors ${
                  activeTab === 'watched' ? 'bg-orange-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
                onClick={() => setActiveTab('watched')}
              >
                Просмотрено
              </button>
              <button
              key={"planed"}
                className={`px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg cursor-pointer transition-colors ${
                  activeTab === 'planned' ? 'bg-orange-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
                onClick={() => setActiveTab('planned')}
              >
                Запланировано
              </button>
            </div>
          </div>
          
          <AnimeCard animeList={animeList} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;