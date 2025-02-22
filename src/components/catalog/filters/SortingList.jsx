import React from "react";

const SortingList = ({
    sortingList,
    setFilters,
    filters
}) => {
    return (
        <div className="mb-4 relative">
          <label className="block mb-2 text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Сортировка
          </label>
          <div className="relative">
            <select
              value={filters.sorting}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  sorting: e.target.value,
                }))
              }
              className="w-full p-3 text-white bg-gray-900 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
            >
              <option value="">Без сортировки</option>
              {sortingList.map((sorting, index) => (
                <option key={index} value={sorting.value}>
                  {sorting.label}
                </option>
              ))}
            </select>
          </div>
        </div>
    );
};

export default SortingList;