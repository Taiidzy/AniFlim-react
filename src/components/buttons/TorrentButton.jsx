import React from 'react';
import { downloadTorrent } from '../../core/TorrentDownload.jsx';

function TorrentButton({ torrent }) {
  const handleDownload = () => {
    downloadTorrent(torrent); // Передаем id торрента
  };

  return (
    <button id={torrent} onClick={handleDownload}>
      <i className="mdi-download mdi text-gray-400 text-sm"></i>
    </button>
  );
}

export default TorrentButton;
