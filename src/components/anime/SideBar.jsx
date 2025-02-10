import React from "react";
import { FiX } from "react-icons/fi";
import Members from "./sidebar.components/Members";
import Torrents from "./sidebar.components/Torrents";

const SideBar = ({ members, torrents, onClose }) => {
    return (
      <div className="h-full p-4 lg:p-6 overflow-y-auto rounded-lg shadow-lg">
        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-2 right-2 p-2 text-gray-400 hover:text-white transition-colors"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Sidebar Content */}
        <h1 className="text-lg lg:text-xl font-bold text-white mb-4 text-center">
          Дополнительная информация
        </h1>
        
        <hr className="border-t border-gray-600 my-4" />
        
        <h2 className="text-base lg:text-lg font-semibold text-white mb-3">
          Участники
        </h2>
        <Members members={members} />
        
        <hr className="border-t border-gray-600 my-4" />
        
        <h2 className="text-base lg:text-lg font-semibold text-white mb-3">
          Торренты
        </h2>
        <Torrents torrents={torrents} />
      </div>
    );
};

export default SideBar;