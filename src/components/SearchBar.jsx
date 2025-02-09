import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      // Пример запроса поиска. Обратите внимание на реальный эндпоинт и параметры.
      const response = await axios.get(`https://api.anilibria.top/v1/search`, {
        params: { query }
      });
      setResults(response.data.results || []);
    } catch (error) {
      console.error('Ошибка поиска:', error);
    }
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Поиск аниме..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Найти</button>
      </form>
      {results.length > 0 && (
        <ul className="search-results">
          {results.map((anime) => (
            <li key={anime.id} onClick={() => navigate(`/anime/${anime.id}`)}>
              {anime.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
