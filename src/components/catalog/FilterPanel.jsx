import React, { useState, useEffect, useRef, useCallback } from 'react';

import GenresList from './filters/GenresList';
import TypesList from './filters/TypesList';
import SeasonsList from './filters/SeasonsList';
import YearRangeSlider from './filters/YearRangeSlider';
import AgeRetings from './filters/AgeRatings';
import SortingList from './filters/SortingList';

const FilterPanel = ({
    setIsGenresOpen,
    ageRetingsList,
    isGenresOpen,
    sortingList,
    seasonsList,
    setFilters,
    genresList,
    typesList,
    yearsList,
    filters,
}) => {
    const dropdownRef = useRef(null);
    return (
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 sm:p-6 lg:p-8 shadow-2xl border-2 border-purple-500/30">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-4 text-center">Фильтры</h2>
            {/* Фильтр: Жанры */}
            <GenresList
              setIsGenresOpen={setIsGenresOpen}
              isGenresOpen={isGenresOpen}
              dropdownRef={dropdownRef}
              setFilters={setFilters}
              genresList={genresList}
              filters={filters}
            />
            <hr className='border-t border-gray-600 my-4' />
            {/* Фильтр: Типы */}
            <TypesList
              setFilters={setFilters}
              typesList={typesList}
              filters={filters}
            />
            <hr className='border-t border-gray-600 my-4' />
            {/* Фильтр: Сезоны */}
            <SeasonsList 
              seasonsList={seasonsList}
              setFilters={setFilters}
              yearsList={yearsList}
              filters={filters}
            />
            {/* Фильтры: Годы */}
            <hr className='border-t border-gray-600 my-4' />
            <YearRangeSlider
              filters={filters}
              setFilters={setFilters}
              yearsList={yearsList}
              sliderConfig={{
                trackStyle: [{ backgroundColor: "#e60076" }],
                handleStyle: [{ borderColor: "#3f266b" }, { borderColor: "#3f266b" }],
                dotStyle: { borderColor: "#101828" },
              }}
            />

            {/* Фильтр: Возрастные рейтинги */}
            <hr className='border-t border-gray-600 my-4' />
            <div className="mb-2">
              <AgeRetings
                ageRetingsList={ageRetingsList}
                setFilters={setFilters}
                filters={filters}
              />
            </div>
            {/* Фильтр: Сортировка */}
            <div className="mb-2">
              
              <SortingList
                sortingList={sortingList}
                setFilters={setFilters}
                filters={filters}
              />
            </div>
          </div>
    )
};

export default FilterPanel;