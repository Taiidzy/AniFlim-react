import React, { useState } from 'react';

const DeleteAccount = ({ setModalType, setConfirmDelete, setDeleteData, deleteData }) => {
  
    const handleDeleteChange = (e) => {
      setDeleteData({ ...deleteData, [e.target.name]: e.target.value });
    };
  
    return (
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-white text-center">Удаление аккаунта</h3>
            <div className="space-y-4">
                <div className="anime-input-group">
                    <input
                        type="text"
                        name="login"
                        placeholder=" "
                        onChange={handleDeleteChange}
                        className="anime-input"
                    />
                    <label className="anime-label">Логин</label>
                </div>
                <div className="anime-input-group">
                    <input
                        type="password"
                        name="password"
                        placeholder=" "
                        onChange={handleDeleteChange}
                        className="anime-input"
                    />
                    <label className="anime-label">Пароль</label>
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
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        className="w-full anime-button-delete relative overflow-hidden py-3 px-6 rounded-lg font-bold transition-all cursor-pointer"
                    >
                        Удалить
                    </button>
                </div>
            </div>
        </div>
    );
};
  
export default DeleteAccount;
  