import React from "react";
import { Link } from 'react-router-dom';

const Episode = ({ episodes }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {episodes
            ?.sort((a, b) => a.ordinal - b.ordinal)
            .map((episode) => {
                const episodeBg = episode.preview
                ? `https://anilibria.top${episode.preview.src}`
                : `https://anilibria.top${posterUrl}`;
                return (
                    <Link
                    key={episode.id}
                    to={`/episode/${episode.id}`}
                    className="group relative block rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all"
                    >
                        <div className="aspect-video bg-gray-900">
                            <div 
                                className="w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                                style={{ backgroundImage: `url(${episodeBg})` }}
                            >
                                <div className="absolute inset-0 bg-black/50 transition-opacity group-hover:bg-black/40"/>
                                <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white p-3">
                                    <h3 className="text-base md:text-lg font-bold mb-1 truncate max-w-[90%]">
                                        {episode.name || `Эпизод ${episode.ordinal}`}
                                    </h3>
                                    <p className="text-sm md:text-base text-gray-200">
                                        Эпизод {episode.ordinal}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    )
}

export default Episode