import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const AnimeCard = ({ animeList }) => {
    if (!animeList) return null;
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {animeList.length > 0 ? (
                animeList.map((item) => (
                    <Link 
                    key={item.release.id} 
                    to={item.episode ? `/episode/${item.release.episodes[item.episode - 1].id}` : `/anime/${item.release.alias}`}
                    className="group relative block bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                    >
                    <div className="aspect-w-2 aspect-h-3">
                        <img
                        src={`https://anilibria.top${item.release.poster.optimized.src}`}
                        alt={item.release.name.main}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                        loading="lazy"
                        />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-center text-sm md:text-base text-white">
                        {item.release.name.main}
                        {item.episode ? (
                            <>
                                <hr />
                                {item.episode} Эпизод
                            </>
                        ) : null}
                        </div>
                    </div>
                    </Link>
                ))
                ) : (
                <div className="col-span-full text-center text-gray-400 py-8">
                    Нет аниме на этот день
                </div>
                )}
        </div>
    );
};

export default AnimeCard;