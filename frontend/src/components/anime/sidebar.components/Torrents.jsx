import React from 'react';
import TorrentButton from '../../buttons/TorrentButton';
import MagnetButton from '../../buttons/MagnetButton';

const Torrents = ({ torrents }) => {
    return (
        <div className="space-y-3">
            {torrents?.map((torrent) => (
                <div key={torrent.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-gray-900 rounded-lg">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-white text-sm md:text-base truncate">
                            Эпизоды: {torrent.description}
                        </h2>
                        <span className="text-gray-400 text-[11px] mt-1 block">
                            {(torrent.size / 1024 / 1024 / 1024).toFixed(2)} GB | {torrent.type?.value} | {torrent.quality?.value} | {torrent.codec?.value}
                        </span>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        {/* <TorrentButton torrent={torrent.id} className="flex-1" /> */}
                        <MagnetButton magnet={torrent.magnet} className="flex-1" />
                    </div>
                </div>
            ))}       
        </div>
    );
};

export default Torrents;