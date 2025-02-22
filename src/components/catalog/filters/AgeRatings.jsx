import React from 'react';

const AgeRetings = ({
    ageRetingsList,
    setFilters,
    filters
}) => {
    const toggleAgeRetings = (ageRetingsId) => {
        setFilters((prev) => {
          if (prev.ageRatings.includes(ageRetingsId)) {
            return { ...prev, ageRatings: prev.ageRatings.filter((id) => id !== ageRetingsId) };
          } else {
            return { ...prev, ageRatings: [...prev.ageRatings, ageRetingsId] };
          }
        });
    };

    return (
        <div className="mb-2">
            <div className="mb-2 relative">
                <label className="block mb-1 font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                    Возрастной рейтинг
                </label>
                <div className="w-full border rounded mt-1 p-2 flex flex-wrap gap-2">
                    {ageRetingsList.map((ageReting) => (
                        <div
                            key={ageReting.value}
                            onClick={() => toggleAgeRetings(ageReting.value)}
                            className={`px-3 py-1 cursor-pointer border rounded-lg transition-all ${
                                filters.ageRatings.includes(ageReting.value)
                                    ? 'bg-pink-600 text-white' 
                                    : 'bg-gray-900 hover:bg-zinc-600 border-purple-500/30 border-1 text-white'
                            }`}
                        >
                            {ageReting.label}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AgeRetings;