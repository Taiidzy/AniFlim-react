import React from "react";
import { Link } from "react-router-dom";

const Franchises = ({ franchises, alias }) => {
  if (!franchises) return null;
  if (!franchises || franchises.length === 0) return (
    <div className="text-center p-3">
      <p className="text-white text-sm md:text-base">Нет франшиз</p>
    </div>
  );

  return (
    <div>
      {franchises.map((franchise) => {
        const filteredReleases = franchise.franchise_releases.filter(
          (release) => release.release.alias !== alias
        );

        return (
          <div key={franchise.id} className="space-y-3">
            {filteredReleases.map((release) => (
              <Link
                key={release.release.alias}
                to={`/anime/${release.release.alias}`}
                className="group flex items-center gap-3 p-3 bg-gray-900 rounded-lg transition-transform duration-300 hover:scale-105"
              >
                <img
                  className="w-12 h-16 flex-shrink-0 rounded-lg"
                  src={`https://anilibria.top${release.release.poster.src}`}
                  alt={release.release.name.main}
                  loading="lazy"
                />
                <div className="flex flex-col min-w-0">
                  <strong className="font-medium text-white text-sm md:text-base">
                    {release.release.name.main}
                  </strong>
                </div>
              </Link>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default Franchises;
