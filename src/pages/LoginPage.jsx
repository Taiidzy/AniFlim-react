import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [login, setLogin] = useState('');
  const [noLogout, setNoLogout] = useState(false);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!login || !password) {
      setMessage('Все поля должны быть заполнены!');
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post('https://aniflim.space/api/login', {
        login: login,
        password: password,
        nologout: noLogout,
      });
      localStorage.setItem('token', response.data.token);
      setMessage(response.data.message || 'Вы успешно вошли');
      setLogin('');
      setPassword('');
      navigate('/profile');
    } catch (error) {
      setMessage(
        error.response?.data?.detail || 'Ошибка соединения с сервером'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="relative w-full max-w-md anime-border-glow">
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-8 shadow-2xl border-2 border-purple-500/30">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <img
                src="/logo.png"
                alt="AniFlim"
                className="h-16 mx-auto hover:scale-105 transition-transform"
              />
            </Link>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mt-4">
              Авторизация
            </h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="anime-input-group">
              <input
                type="text"
                placeholder=" "
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="anime-input"
              />
              <label className="anime-label">Логин</label>
              <div className="anime-input-highlight"></div>
            </div>
            <div className="anime-input-group">
              <input
                type="password"
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="anime-input"
              />
              <label className="anime-label">Пароль</label>
              <div className="anime-input-highlight"></div>
            </div>
            <div className="flex items-center justify-between">
                <label 
                    htmlFor="noLogout" 
                    className="text-gray-300 cursor-pointer select-none"
                >
                    Не выходить
                </label>
                <div 
                className="flex items-center space-x-4 cursor-pointer select-none"
                onClick={() => setNoLogout(!noLogout)}
                >
                  <div className={`w-13 h-7 flex items-center rounded-full p-1 transition-all duration-500 ${noLogout ? "bg-gradient-to-br from-purple-600 to-pink-600 border-transparent" : "bg-gray-600"}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-all ${noLogout ? "translate-x-6" : "translate-x-0"}`} />
                  </div>
                </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full anime-button-primary relative overflow-hidden py-3 px-6 rounded-lg font-bold transition-all cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="anime-loading-spinner"></div>
                  <span>Загрузка...</span>
                </div>
              ) : (
                'Войти'
              )}
            </button>
          </form>
          {message && (
            <div
              className={`mt-6 p-3 rounded-lg border text-center ${
                message.includes('Все поля') ||
                message.includes('Неверный логин или пароль')
                  ? 'bg-yellow-900/30 border-yellow-400 text-yellow-300'
                  : message.includes('Ошибка')
                  ? 'bg-red-900/30 border-red-400 text-red-300'
                  : 'bg-green-900/30 border-green-400 text-green-300'
              } anime-message-pop`}
            >
              {message}
            </div>
          )}
          <p className="text-center mt-6 text-gray-400">
            Ещё нет аккаунта?{' '}
            <Link
              to="/register"
              className="text-purple-400 hover:text-pink-400 transition-colors font-semibold"
            >
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
