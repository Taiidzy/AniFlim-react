import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const daysOfWeek = [
  { value: 1, label: 'Пн' },
  { value: 2, label: 'Вт' },
  { value: 3, label: 'Ср' },
  { value: 4, label: 'Чт' },
  { value: 5, label: 'Пт' },
  { value: 6, label: 'Сб' },
  { value: 7, label: 'Вс' },
];

const Schedule = ({ scheduleItems }) => {
  const grouped = scheduleItems.reduce((acc, item) => {
    const dayValue = item.release.publish_day.value;
    if (!acc[dayValue]) acc[dayValue] = [];
    acc[dayValue].push(item);
    return acc;
  }, {});

  let today = new Date().getDay();
  if (today === 0) today = 7;
  const [selectedDay, setSelectedDay] = useState(today);

  const animeList = grouped[selectedDay] || [];

  return (
    <div className="space-y-6">
      {/* Days Navigation */}
      <div className="flex overflow-x-auto pb-2 md:justify-center">
        {daysOfWeek.map((day) => (
          <button
            key={day.value}
            className={`px-4 py-2 mx-1 min-w-[70px] text-sm md:text-base rounded-lg transition-colors cursor-pointer ${
              day.value === selectedDay 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
            onClick={() => setSelectedDay(day.value)}
          >
            {day.label}
          </button>
        ))}
      </div>

      {/* Anime Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {animeList.length > 0 ? (
          animeList.map((item) => (
            <Link 
              key={item.release.id} 
              to={`/anime/${item.release.alias}`}
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
    </div>
  );
};

export default Schedule;