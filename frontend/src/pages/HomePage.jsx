import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import Schedule from '../components/Schedule';
import { ClipLoader } from 'react-spinners';

const HomePage = () => {
  const [scheduleItems, setScheduleItems] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await axios.get('https://anilibria.top/api/v1/anime/schedule/week');
        console.log(response.data);
        setScheduleItems(response.data);
      } catch (error) {
        navigate('/error');
      }
    };

    fetchSchedule();
  }, [navigate]);

  return (
    <div className="px-4 py-6 md:px-8 md:py-10 max-w-7xl mx-auto">
      <div className="mb-8">
        
      </div>
      {scheduleItems ? (
        <Schedule scheduleItems={scheduleItems} />
      ) : (
        <div className="flex justify-center items-center min-h-[300px]">
          <ClipLoader color="#3498db" size={50} />
        </div>
      )}
    </div>
  );
};

export default HomePage;