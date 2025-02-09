import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/Schedule.module.css';

const daysOfWeek = [
  { value: 1, label: 'Понедельник' },
  { value: 2, label: 'Вторник' },
  { value: 3, label: 'Среда' },
  { value: 4, label: 'Четверг' },
  { value: 5, label: 'Пятница' },
  { value: 6, label: 'Суббота' },
  { value: 7, label: 'Воскресение' },
];

const Schedule = ({ scheduleItems }) => {
  // Группируем элементы по дню недели
  const grouped = scheduleItems.reduce((acc, item) => {
    const dayValue = item.release.publish_day.value;
    if (!acc[dayValue]) acc[dayValue] = [];
    acc[dayValue].push(item);
    return acc;
  }, {});

  // Определяем текущий день
  let today = new Date().getDay();
  if (today === 0) today = 7;
  const [selectedDay, setSelectedDay] = useState(today);

  // Список аниме для выбранного дня
  const animeList = grouped[selectedDay] || [];

  return (
    <div className={styles.schedule}>
      <div className={styles.scheduleDays}>
        {daysOfWeek.map((day) => (
          <button
            key={day.value}
            className={day.value === selectedDay ? styles.active : ''}
            onClick={() => setSelectedDay(day.value)}
          >
            {day.label}
          </button>
        ))}
      </div>
      <div className={styles.scheduleList}>
        {animeList.length > 0 ? (
          animeList.map((item) => (
            <div key={item.release.id} className={styles.animeCard}>
              <Link to={`/anime/${item.release.alias}`}>
                <div className={styles.imageWrapper}>
                  <img
                    src={`https://anilibria.top${item.release.poster.optimized.src}`}
                    alt={item.release.name.main}
                  />
                  <div className={styles.animeTitle}>
                    {item.release.name.main}
                  </div>
                </div>
              </Link>
            </div>
          ))
        ) : (
          <p className={styles.noAnime}>Нет аниме на этот день</p>
        )}
      </div>
    </div>
  );
};

export default Schedule;
