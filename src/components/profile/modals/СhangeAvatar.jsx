import React, { useState } from 'react';
import axios from 'axios';

const ChangeAvatar = ({ token, setModalType, setUserData, setAvatarVersion }) => {
  const [avatarFile, setAvatarFile] = useState(null);

  const handleUpdateAvatar = async e => {
    e.preventDefault();
    if (!avatarFile) return;
    
    const formData = new FormData();
    formData.append('file', avatarFile);
    
    try {
      await axios.patch('https://aniflim.space/api/user/avatar', formData, {
        headers: {
          "x-token": token,
          'Content-Type': 'multipart/form-data'
        }
      });
      setModalType(null);
      setAvatarFile(null);
      // Обновляем данные пользователя
      const response = await axios.get('https://aniflim.space/api/user/info', {
        headers: { "x-token": token }
      });
      setUserData(response.data);
      // Обновляем версию аватарки (сбрасываем кеш)
      setAvatarVersion(Date.now());
    } catch (error) {
      console.error(error);
    }
  };

  const handleAvatarChange = e => {
    setAvatarFile(e.target.files[0]);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
      <h3 className="text-xl font-bold mb-4 text-white text-center">Изменить аватар</h3>
      <form onSubmit={handleUpdateAvatar} className="space-y-4">
        <input
          type="file"
          name="file"
          placeholder=" "
          onChange={handleAvatarChange}
          className="anime-input cursor-pointer"
        />
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => setModalType(null)}
            className="w-full anime-button-primary relative overflow-hidden py-3 px-6 rounded-lg font-bold transition-all cursor-pointer"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="w-full anime-button-primary relative overflow-hidden py-3 px-6 rounded-lg font-bold transition-all cursor-pointer"
          >
            Сохранить
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChangeAvatar;
