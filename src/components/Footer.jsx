import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as Icons from './Icons';

const Footer = () => {
    const location = useLocation();

    if (location.pathname.startsWith('/episode/')) {
        return null;
    }

    return (
      <footer className="bg-gray-900 text-gray-300 border-t border-purple-500/20 mt-16">
        <div className="mx-auto px-4 py-12 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Лого и описание */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                    AniFlim
                </h2>
                <p className="text-sm text-gray-400">
                    Лучшая платформа для просмотра аниме с открытым API и активным сообществом
                </p>
                <span className="text-sm text-gray-400">
                    Созданно при поддержке: <Link to="https://anilibria.top/" className="text-purple-400 hover:text-pink-600 transition-colors duration-300">AniLibria</Link>
                </span>
            </div>
  
            {/* Навигация */}
            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-4">Навигация</h3>
              <ul className="space-y-3">
                  <li>
                    <Link
                      to="/"
                      className="text-sm hover:text-purple-300 transition-colors duration-300"
                    >
                        Главная
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/profile"
                      className="text-sm hover:text-purple-300 transition-colors duration-300"
                    >
                        Профиль
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/login"
                      className="text-sm hover:text-purple-300 transition-colors duration-300"
                    >
                        Авторизация
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/register"
                      className="text-sm hover:text-purple-300 transition-colors duration-300"
                    >
                        Регистрация
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/random"
                      className="text-sm hover:text-purple-300 transition-colors duration-300"
                    >
                        Случайный релиз
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/catalog"
                      className="text-sm hover:text-purple-300 transition-colors duration-300"
                    >
                        Каталог
                    </Link>
                  </li>
              </ul>
            </div>
  
            {/* Ресурсы */}
            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-4">Ресурсы</h3>
              <ul className="space-y-3">
                <li>
                  <a 
                    href="/api-docs" 
                    className="text-sm hover:text-purple-300 transition-colors duration-300"
                  >
                    API Документация
                  </a>
                </li>
                <li>
                  <a 
                    href="https://t.me/AniFlimProduction" 
                    target="_blank"
                    className="text-sm hover:text-purple-300 transition-colors duration-300 flex items-center gap-2"
                  >
                    <Icons.TelegramIcon className="w-6 h-6 text-white" />
                    Telegram Канал
                  </a>
                </li>
              </ul>
            </div>
  
            {/* Контакты */}
            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-4">Контакты</h3>
              <ul className="space-y-3">
                <li>
                  <a 
                    href="mailto:Taiidzy@yandex.ru" 
                    className="text-sm hover:text-purple-300 transition-colors duration-300"
                  >
                    Taiidzy@yandex.ru
                  </a>
                </li>
                <li>
                  <a 
                    href="https://t.me/Taiidzy" 
                    target="_blank" 
                    className="text-sm hover:text-purple-300 transition-colors duration-300"
                  >
                    Taiidzy
                  </a>
                </li>
                <li className="flex gap-4 mt-4">
                  <Link to="https://github.com/Taiidzy" target="_blank">
                    <Icons.Github01Icon className="w-6 h-6 text-white" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
  
          <div className="border-t border-purple-500/20 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>
              © {new Date().getFullYear()} AniFlim. Open-source project under MIT License
            </p>
          </div>
        </div>
      </footer>
    );
};

export default Footer;
