import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const RegisterPage = () => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!login || !password) {
            setMessage('Все поля должны быть заполнены!');
            return;
        }
        if (password !== confirmPassword) {
            setMessage('Пароли не совпадают!');
            return;
        }
        setIsLoading(true);
        try {
            const response = await axios.post('https://aniflim.space/api/register', {
                login: login,
                password: password,
            });
            setMessage(response.data.message);

            if (data.status === 400) {
                setMessage('Пользователь с таким логином уже существует!');
                return;
            }
            
            setLogin('');
            setPassword('');
            setConfirmPassword('');
        } catch (error) {
            setMessage(error.response?.data?.detail || 'Ошибка соединения с сервером');
        } finally {
            setIsLoading(false);
            navigate('/login');
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
                            Регистрация
                        </h1>
                    </div>
                    <form onSubmit={handleRegister} className="space-y-6">
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
                        <div className="anime-input-group">
                            <input
                                type="password"
                                placeholder=" "
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="anime-input"
                            />
                            <label className="anime-label">Подтверждение пароля</label>
                            <div className="anime-input-highlight"></div>
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
                                'Создать аккаунт'
                            )}
                        </button>
                    </form>
                    {message && (
                        <div
                        className={`mt-6 p-3 rounded-lg border text-center ${
                        message.includes('Все поля') || message.includes('Пароли не совпадают') || message.includes('Пользователь')
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
                        Уже есть аккаунт?{' '}
                        <Link 
                            to="/login" 
                            className="text-purple-400 hover:text-pink-400 transition-colors font-semibold"
                        >
                            Войти
                        </Link>
                    </p>
                </div>
                {/* Декоративные элементы */}
                <div className="absolute inset-0 -z-10 animate-pulse-slow">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500 rounded-full mix-blend-screen opacity-20 blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-pink-500 rounded-full mix-blend-screen opacity-20 blur-3xl"></div>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;