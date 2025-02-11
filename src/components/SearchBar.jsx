import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as Icons from './Icons';

const SearchBar = () => {
  const [isOpen, setIsOpen] = useState(false);   // Состояние открытия меню поиска
  const [query, setQuery] = useState('');          // Текст запроса
  const [results, setResults] = useState([]);      // Результаты поиска
  const navigate = useNavigate();

  // Выполняем запрос к API при изменении текста запроса с дебаунсом в 300 мс
  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim() === '') {
        setResults([]);
        return;
      }
      try {
        const response = await axios.get(`https://anilibria.top/api/v1/app/search/releases?query=${query}`);
        console.log(response.data);
        setResults(response.data);
      } catch (error) {
        console.error('Ошибка поиска:', error);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Обработка клика по элементу результата
  const handleResultClick = (alias) => {
    navigate(`/anime/${alias}`);
    closeSearch();
  };

  // Закрытие меню поиска
  const closeSearch = () => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
  };

  // Общее содержимое меню поиска
  const searchContent = (
    <>
      {/* Заголовок с полем ввода и кнопкой закрытия */}
      <div className="flex items-center justify-between border-b pb-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Введите название..."
          className="w-full px-4 py-2 bg-gray-800 text-white placeholder-gray-400 focus:outline-none"
        />
        <button
          onClick={closeSearch}
          className="ml-2 text-white text-xl"
        >
          ✕
        </button>
      </div>

      {/* Список результатов */}
      <div className="mt-4 overflow-y-auto max-h-120">
        {results.length > 0 ? (
          results.map((item) => (
            <div
              key={item.id}
              className="flex items-center p-2 hover:bg-gray-700/50 cursor-pointer"
              onClick={() => handleResultClick(item.alias)}
            >
              <img
                src={
                  item.poster?.thumbnail
                    ? `https://anilibria.top${item.poster.optimized.src}`
                    : 'https://via.placeholder.com/50'
                }
                alt={item.name?.main || 'Постер'}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-white">{item.name?.main}</h3>
                <p className="text-gray-400 text-sm">
                  {item.description && item.description.length > 150
                    ? item.description.substring(0, 150) + '...'
                    : item.description || 'Нет описания'}
                </p>
              </div>
            </div>
          ))
        ) : (
          // Если пользователь ввёл текст, но результатов нет
          query && <p className="p-2 text-gray-500">Ничего не найдено.</p>
        )}
      </div>
    </>
  );

  return (
    <div className="relative">
      {/* Кнопка для открытия/закрытия меню поиска */}
      <button
        className="px-4 py-2 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Icons.Search02Icon className="w-5 h-5 text-gray-100 hover:text-indigo-300 transition-colors duration-200 cursor-pointer" />
      </button>

      {/* Мобильная версия: полноэкранный оверлей (отображается на устройствах меньше sm) */}
      <div
        className={`
          fixed inset-0 z-50 bg-gray-900 bg-opacity-95 p-4 transition-all duration-300 transform
          ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}
          sm:hidden
        `}
      >
        {searchContent}
      </div>

      {/* Десктопная версия: выпадающий блок (отображается на устройствах от sm и выше) */}
      <div
        className={`
          absolute top-12 right-0 w-96 bg-gray-800 border border-gray-600 rounded shadow-lg z-10 p-4 transition-all duration-300 transform
          ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}
          hidden sm:block
        `}
      >
        {searchContent}
      </div>
    </div>
  );
};

export default SearchBar;
