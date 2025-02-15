import React, { useState } from 'react';
import axios from 'axios';

const ChangePassword = ({ token, setModalType, userData }) => {
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const handlePasswordChange = e => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };


    const handleSubmitPassword = async e => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            console.error('Пароли не совпадают');
            return;
        }
        try {
            await axios.patch('http://localhost:5020/user/password', {
                login: userData.login,
                old_password: passwords.current,
                new_password: passwords.new
            }, {
                headers: { "x-token": token }
            });
            setModalType(null);
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-white text-center">Изменить пароль</h3>
            <form onSubmit={handleSubmitPassword} className="space-y-4">
                <div className="anime-input-group">
                    <input
                        type="password"
                        name="current"
                        placeholder=" "
                        onChange={handlePasswordChange}
                        className="anime-input"
                    />
                    <label className="anime-label">Пароль</label>
                </div>
                <div className="anime-input-group">
                    <input
                        type="password"
                        name="new"
                        placeholder=" "
                        onChange={handlePasswordChange}
                        className="anime-input"
                    />
                    <label className="anime-label">Новый пароль</label>
                </div>
                <div className="anime-input-group">
                    <input
                        type="password"
                        name="confirm"
                        placeholder=" "
                        onChange={handlePasswordChange}
                        className="anime-input"
                    />
                    <label className="anime-label">Подтверждение пароля</label>
                </div>
                <div className="flex gap-2 justify-end">
                    <button
                        type="button"
                        onClick={() => setModalType(null)}
                        className="w-full anime-button-primary relative overflow-hidden py-3 px-6 rounded-lg font-bold transition-all cursor-pointer"
                    >
                        Отмена
                    </button>
                    <button
                        type="submit"
                        className="w-full anime-button-primary relative overflow-hidden py-3 px-6 rounded-lg font-bold transition-all cursor-pointer"
                    >
                        Сохранить
                    </button>
                </div>
            </form>
        </div>
    )
};

export default ChangePassword;