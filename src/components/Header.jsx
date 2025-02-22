import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SearchBar from './SearchBar';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  // Скрываем хедер на странице плеера
  if (location.pathname.startsWith('/episode/')) {
    return null;
  }

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 shadow-lg z-100">
      <div className="container mx-auto flex items-center justify-between">
        <h1 className="text-2xl md:text-4xl font-bold hover:text-indigo-300 transition-colors duration-200">
          <Link to="/">AniFlim</Link>
        </h1>

        {/* Декстопное меню */}
        <nav className="hidden md:flex space-x-4">
          <Link to="/catalog" className="text-base md:text-lg hover:text-indigo-300 transition-colors duration-200">
            Каталог
          </Link>
          <Link to="/" className="text-base md:text-lg hover:text-indigo-300 transition-colors duration-200">
            Расписание
          </Link>
          <Link to="/random" className="text-base md:text-lg hover:text-indigo-300 transition-colors duration-200">
            Случайный релиз
          </Link>
          <Link to="/profile" className="text-base md:text-lg hover:text-indigo-300 transition-colors duration-200">
            Профиль
          </Link>
          <SearchBar />
        </nav>

        {/* Кнопка для открытия мобильного меню */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="block md:hidden">
          <SearchBar />  {/* Отображается только на мобильных */}
        </div>
      </div>

      {/* Мобильное меню */}
      {isMenuOpen && (
        <div className="md:hidden absolute w-full bg-purple-600 left-0 top-16 z-50 shadow-lg">
          <nav className="flex flex-col p-4 space-y-3">
            <Link
              to="/"
              className="text-lg hover:text-indigo-300 transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Расписание
            </Link>
            <Link
              to="/random"
              className="text-lg hover:text-indigo-300 transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Случайный релиз
            </Link>
            <Link
              to="/profile"
              className="text-lg hover:text-indigo-300 transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Профиль
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;