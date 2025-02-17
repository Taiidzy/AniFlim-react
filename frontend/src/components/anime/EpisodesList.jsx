import React from "react";
import Episode from "./episodeslist.components/Episode";

const EpisodesList = ({ episodes, currentEpisode }) => {
    return (
        <div className="mb-6 lg:mb-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-gray-50">
                Эпизоды
            </h2>
            <Episode episodes={episodes} currentEpisode={currentEpisode} />
        </div>
    );
};

export default EpisodesList;