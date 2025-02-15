import React, { useState } from 'react';
import AnimeCard from './AnimeCard';

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
      <AnimeCard animeList={animeList} />
    </div>
  );
};

export default Schedule;