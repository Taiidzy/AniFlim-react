import React from 'react';

const SeasonsList = ({
    seasonsList,
    setFilters,
    filters
}) => {
    const toggleType = (seasonsId) => {
        setFilters((prev) => {
            if (prev.seasons.includes(seasonsId)) {
                return { ...prev, seasons: prev.seasons.filter((id) => id !== seasonsId) };
            } else {
                return { ...prev, seasons: [...prev.seasons, seasonsId] };
            }
        });
    };

    return (
        <div className="mb-2">
            <div className="mb-2 relative">
                <label className="block mb-1 font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                    Типы
                </label>
                <div className="w-full border rounded mt-1 p-2 flex flex-wrap gap-2">
                    {seasonsList.map((seasons) => (
                        <div
                            key={seasons.value}
                            onClick={() => toggleType(seasons.value)}
                            className={`px-3 py-1 cursor-pointer border rounded-lg transition-all ${
                                filters.seasons.includes(seasons.value)
                                    ? 'bg-pink-600 text-white' 
                                    : 'bg-gray-900 hover:bg-zinc-600 border-purple-500/30 border-1 text-white'
                            }`}
                        >
                            {seasons.description}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SeasonsList;