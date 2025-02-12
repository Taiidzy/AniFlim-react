import React from "react";

const Members = ({ members }) => {
  return (
    <div className="space-y-3">
      {members?.map((member) => {
        const avatarUrl = member.user?.avatar?.optimized?.thumbnail || member.user?.avatar?.thumbnail;
        return (
          <div key={member.id} className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg">
            {avatarUrl ? (
              <img 
                className="w-10 h-10 md:w-12 md:h-12 rounded-full flex-shrink-0"
                src={`https://anilibria.top${avatarUrl}`} 
                alt={member.nickname}
                loading="lazy"
              />
            ) : (
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-700 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 209 193">
                  <path fill="currentColor" d="M0 15.2c8.6-5 17.1-10 25.9-15.2C41.2 24.5 56.5 48.8 72 73.6c4.3-11.2 8.4-21.7 12.4-32.2 5-12.9 9.9-25.8 14.8-38.7.7-1.9 1.5-2.6 3.8-2.5 6.6.1 13.2.1 20.2.1 11.2 34.3 22.2 68.5 33.5 103.3 10.3-6.1 20.4-12 30.8-18.1 3.4 9.5 6.8 18.7 10.2 27.8.7 1.8-.5 2.4-1.7 3.1-8.9 5.3-17.8 10.7-26.7 15.9-2.1 1.2-2.6 2.3-1.8 4.5 1.5 3.8 2.6 7.7 4 12 10.8-6.4 21.4-12.8 32.3-19.2 1.8 4.5 3.5 8.7 5.3 13.1-4.3 2.1-8.3 4.2-12.5 6.3-6.4 3.2-12.8 6.4-19.2 9.5-1.8.9-2.2 1.7-1.6 3.6 3.2 9.2 6 18.5 9.1 27.8.3 1 .5 1.9.9 3.1h-35.2c-1.8-5.9-3.6-11.9-5.5-18.3-12.4 6.1-24.4 12.1-36.8 18.2-.9-1.4-1.7-2.7-2.8-4.3 1.5-.9 2.9-1.9 4.4-2.7 10-6 20-12 30.2-18 1.9-1.1 2.6-2.1 1.8-4.2-1.4-3.9-2.4-7.9-3.8-12.4-13.5 8.1-26.7 16-40.4 24.1-7-11.4-13.8-22.6-21-34.4-.5 1.2-.8 1.9-1 2.6-4.4 15.4-9 30.8-13.3 46.2-.7 2.5-1.7 3.4-4.7 3.3-10.3-.2-20.6-.1-31.3-.1 1.4-3.8 2.8-7.4 4.1-11 8.8-22.9 17.6-45.7 26.5-68.6.9-2.3.5-4-.7-6.1C38 77.7 20 48 1.9 18.3c-.7-.9-1.2-1.9-1.9-3.1zM128.8 120c-7.7-26.1-15.4-52.1-23.2-78.4-.7.7-.9.8-.9.9C99.3 60.8 94 79.3 88.8 97.7c-.3 1.2.2 2.9.9 4 5.8 9.4 11.7 18.8 17.5 28.1.4.7 1 1.3 1.5 2 6.8-3.9 13.3-7.8 20.1-11.8z" />
                </svg>
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <strong className="font-medium text-white text-sm md:text-base truncate">
                {member.nickname}
              </strong>
              <span className="text-gray-400 text-xs md:text-sm truncate">
                {member.role.description}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  )
}

export default Members