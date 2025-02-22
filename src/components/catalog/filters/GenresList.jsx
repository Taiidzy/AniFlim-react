import React, { useEffect }  from 'react';

const GenresList = ({
  setIsGenresOpen,
  isGenresOpen,
  dropdownRef,
  setFilters,
  genresList,
  filters
}) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsGenresOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
    
  const toggleGenre = (genreId) => {
    setFilters((prev) => {
      if (prev.genres.includes(genreId)) {
        return { ...prev, genres: prev.genres.filter((id) => id !== genreId) };
      } else {
        return { ...prev, genres: [...prev.genres, genreId] };
      }
    });
  };

  return (
    <div className="mb-2">
      <div className="mb-2 relative" ref={dropdownRef}>
        <label className="block mb-1 font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          Жанры
        </label>
        {/* Блок для открытия/закрытия dropdown'а */}
        <div
          className="w-full p-2 border rounded cursor-pointer text-white border-gray-700"
          onClick={() => setIsGenresOpen(!isGenresOpen)}
        >
          Выберите жанры
        </div>
        {isGenresOpen && (
          <div className="absolute w-full bg-gray-900 border rounded mt-1 max-h-40 overflow-y-auto z-10 p-2 border-purple-500">
          {genresList.map((genre) => (
            <label
              key={genre.id}
              className="flex items-center gap-2 px-2 py-1 text-white cursor-pointer rounded-md hover:bg-gray-800 transition"
            >
              <input
                type="checkbox"
                checked={filters.genres.includes(genre.id)}
                onChange={() => toggleGenre(genre.id)}
                className="hidden"
              />
              <div className={`w-5 h-5 flex items-center justify-center border-2 rounded-md transition-all
                ${filters.genres.includes(genre.id) ? "bg-purple-600 border-purple-500" : "border-gray-500"}
              `}>
                {filters.genres.includes(genre.id) && (
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
              </div>
              {genre.name}
            </label>
          ))}
        </div>
        )}
      </div>
    </div>
  );
};

export default GenresList;