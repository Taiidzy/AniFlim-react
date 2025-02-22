import React from 'react';

const TypesList = ({
    setFilters,
    typesList,
    filters
}) => {
    const toggleType = (typesId) => {
        setFilters((prev) => {
            if (prev.types.includes(typesId)) {
                return { ...prev, types: prev.types.filter((id) => id !== typesId) };
            } else {
                return { ...prev, types: [...prev.types, typesId] };
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
                    {typesList.map((type) => (
                        <div
                            key={type.value}
                            onClick={() => toggleType(type.value)}
                            className={`px-3 py-1 cursor-pointer border rounded-lg transition-all ${
                                filters.types.includes(type.value) 
                                    ? 'bg-pink-600 text-white' 
                                    : 'bg-gray-900 hover:bg-zinc-600 border-purple-500/30 border-1 text-white'
                            }`}
                        >
                            {type.description}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TypesList;