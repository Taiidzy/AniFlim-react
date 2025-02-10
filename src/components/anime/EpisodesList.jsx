import React from "react";
import Episode from "./episodeslist.components/Episode";

const EpisodesList = ({ episodes }) => {
    return (
        <div className="mb-6 lg:mb-8">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-gray-50">
                Эпизоды
            </h2>
            <Episode episodes={episodes} />
        </div>
    );
};

export default EpisodesList;