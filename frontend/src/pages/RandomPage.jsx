import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import axios from 'axios';

import styles from '../styles/RandomPage.module.css';

const RandomPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRandomAnime = async () => {
            try {
                const response = await axios.get('https://anilibria.top/api/v1/anime/releases/random?limit=1');
                // Проверяем что ответ является массивом и содержит хотя бы один элемент
                if (!Array.isArray(response.data) || response.data.length === 0) {
                    throw new Error('Invalid API response format');
                }
                // Извлекаем первый элемент массива и получаем alias
                const animeAlias = response.data[0].alias;
                
                // Перенаправляем на страницу аниме
                navigate(`/anime/${animeAlias}`);
            } catch (error) {
                navigate('/error'); // Перенаправляем на страницу ошибки
            } finally {
                setIsLoading(false);
            }
        };

        fetchRandomAnime();
    }, [navigate]);

    return (
        <div className={styles.loader}>
            <ClipLoader color="#3498db" size={50} />
        </div>
    );
};

export default RandomPage;