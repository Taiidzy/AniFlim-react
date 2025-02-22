import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

import CatalogAnimeCard from '../components/catalog/CatalogAnimeCard';
import FilterPanel from '../components/catalog/FilterPanel';

const LIMIT = 15;

const CatalogPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    genres: [],
    types: [],
    seasons: [],
    fromYear: '',
    toYear: '',
    ageRatings: [],
    sorting: 'RATING_DESC',
  });

  // Константы для фильтров
  const [genresList, setGenresList] = useState([]);
  const [typesList, setTypesList] = useState([]);
  const [seasonsList, setSeasonsList] = useState([]);
  const [yearsList, setYearsList] = useState([]);
  const [ageRetingsList, setAgeRetingsList] = useState([]);
  const [sortingList, setSortingList] = useState([]);

  // Консты для выпадающих списков
  const [isGenresOpen, setIsGenresOpen] = useState(false);

  // Получение фильтров с сервера
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await axios.get('https://anilibria.top/api/v1/anime/catalog/references/genres');
        setGenresList(response.data);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };

    const fetchTypes = async () => {
      try {
        const response = await axios.get('https://anilibria.top/api/v1/anime/catalog/references/types');
        setTypesList(response.data);
      } catch (error) {
        console.error('Error fetching types:', error);
      }
    };
    
    const fetchSesons = async () => {
      try {
        const response = await axios.get('https://anilibria.top/api/v1/anime/catalog/references/seasons');
        setSeasonsList(response.data);
      } catch (error) {
        console.error('Error fetching seasons:', error);
      }
    };
    
    const fetchYears = async () => {
      try {
        const response = await axios.get("https://anilibria.top/api/v1/anime/catalog/references/years");
        const sortedYears = response.data.sort((a, b) => a - b);
        setYearsList(sortedYears);
      } catch (error) {
        console.error("Error fetching years:", error);
      }
    };
    
    const fetchAgeRetings = async () => {
      try {
        const response = await axios.get("https://anilibria.top/api/v1/anime/catalog/references/age-ratings");
        setAgeRetingsList(response.data);
      } catch (error) {
        console.error("Error fetching age ratings:", error);
      }
    };
    
    const fetchSorting = async () => {
      try {
        const response = await axios.get("https://anilibria.top/api/v1/anime/catalog/references/sorting");
        setSortingList(response.data);
      } catch (error) {
        console.error("Error fetching sorting options:", error);
      }
    };

    fetchGenres();
    fetchTypes();
    fetchSesons();
    fetchYears();
    fetchAgeRetings();
    fetchSorting();
  }, []);

  // Формирование URL запроса для каталога
  const buildUrl = useCallback((currentPage) => {
    const params = new URLSearchParams();
    params.append('page', currentPage);
    params.append('limit', LIMIT);
    if (filters.genres.length)
      params.append('f[genres]', filters.genres.join(','));
    if (filters.types.length)
      params.append('f[types]', filters.types.join(','));
    if (filters.seasons.length)
      params.append('f[seasons]', filters.seasons.join(','));
    if (filters.fromYear)
      params.append('f[years][from_year]', filters.fromYear);
    if (filters.toYear)
      params.append('f[years][to_year]', filters.toYear);
    if (searchQuery.trim())
      params.append('f[search]', searchQuery.trim());
    if (filters.sorting)
      params.append('f[sorting]', filters.sorting);
    if (filters.ageRatings.length)
      params.append('f[age_ratings]', filters.ageRatings.join(','));
    return `https://anilibria.top/api/v1/anime/catalog/releases?${params.toString()}`;
  }, [searchQuery, filters]);

  const fetchData = useCallback(async (currentPage = 1, replace = false) => {
    setLoading(true);
    try {
      const url = buildUrl(currentPage);
      const { data } = await axios.get(url);
      const newResults = data.data || data.results || [];
      setResults(prev => (replace ? newResults : [...prev, ...newResults]));
      setHasMore(newResults.length >= LIMIT);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  }, [buildUrl]);

  // При изменении фильтров или поисковой строки сбрасываем страницу и результаты
  useEffect(() => {
    setPage(1);
    setResults([]);
    setHasMore(true);
    fetchData(1, true);
  }, [filters, searchQuery, fetchData]);

  const handleLoadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchData(nextPage);
  }, [page, fetchData]);

  return (
    <div className="p-4">
      {/* Строка поиска */}
      <div className="mb-4">
        <input
          type="text"
          className="w-full p-2 rounded bg-gray-800/80 backdrop-blur-sm shadow-2xl border-2 border-purple-500/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
          placeholder="Поиск..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Кнопка для открытия фильтров на мобильных устройствах */}
      <div className="mb-4 lg:hidden">
        <button
          className="w-full p-2 bg-purple-600 text-white rounded"
          onClick={() => setMobileFiltersOpen(true)}
        >
          Фильтры
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8">
        <div>
          {/* Список результатов */}
          <CatalogAnimeCard
            handleLoadMore={handleLoadMore}
            results={results}
            hasMore={hasMore}
            loading={loading}
          />
        </div>

        {/* Фильтры для десктопа */}
        <div className="hidden lg:block lg:w-80 xl:w-96 lg:sticky lg:top-4 h-fit z-50">
          <FilterPanel
            setIsGenresOpen={setIsGenresOpen}
            ageRetingsList={ageRetingsList}
            isGenresOpen={isGenresOpen}
            sortingList={sortingList}
            seasonsList={seasonsList}
            setFilters={setFilters}
            genresList={genresList}
            typesList={typesList}
            yearsList={yearsList}
            filters={filters}
          />
        </div>
      </div>

      {/* Мобильное меню фильтров */}
      {mobileFiltersOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
          onClick={(e) => {
            // Закрываем модальное окно, если клик вне контента
            if (e.target === e.currentTarget) {
              setMobileFiltersOpen(false);
            }
          }}
        >
          <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl w-full max-w-md p-4 sm:p-6 lg:p-8 shadow-2xl border-2 border-purple-500/30 relative max-h-full overflow-y-auto">
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="absolute top-2 right-2 text-white"
            >
              Закрыть
            </button>
            <FilterPanel
              setIsGenresOpen={setIsGenresOpen}
              ageRetingsList={ageRetingsList}
              isGenresOpen={isGenresOpen}
              sortingList={sortingList}
              seasonsList={seasonsList}
              setFilters={setFilters}
              genresList={genresList}
              typesList={typesList}
              yearsList={yearsList}
              filters={filters}
            />
            <div className="mt-4">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full p-2 bg-purple-600 text-white rounded"
              >
                Применить фильтры
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogPage;
