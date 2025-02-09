import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchBar from '../components/SearchBar';
import Schedule from '../components/Schedule';
import styles from '../styles/HomePage.module.css';
import { ClipLoader } from 'react-spinners';

const HomePage = () => {
  const [scheduleItems, setScheduleItems] = useState(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await axios.get('https://anilibria.top/api/v1/anime/schedule/week');
        setScheduleItems(response.data);
      } catch (error) {
        console.error('Ошибка получения расписания:', error);
      }
    };

    fetchSchedule();
  }, []);

  return (
    <div className={styles.homepage}>
      <SearchBar />
      {scheduleItems ? (
        <Schedule scheduleItems={scheduleItems} />
      ) : (
        <div className={styles.loader}>
          <ClipLoader color="#3498db" size={50} />
        </div>
      )}
    </div>
  );
};

export default HomePage;
