import { useNavigate } from "react-router-dom";
import axios from 'axios';

const ConfirmDelete = ({ token, setModalType, setToken, deleteData }) => {
    const navigate = useNavigate();

    const handleSubmitDelete = async e => {
        e.preventDefault();
        try {
            await axios.delete('http://localhost:5020/user/delete', {
                data: deleteData,
                headers: { "x-token": token }
            });
            localStorage.removeItem('token');
            setToken(null);
            navigate('/');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-white text-center">Подтвердите удаление</h3>
            <p className="mb-6 text-white">Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить!</p>
            <div className="flex gap-2 justify-end">
                <button
                    onClick={() => setConfirmDelete(false)}
                    className="w-full anime-button-primary relative overflow-hidden py-3 px-6 rounded-lg font-bold transition-all cursor-pointer"
                >
                    Отмена
                </button>
                <button
                    className="w-full anime-button-delete relative overflow-hidden py-3 px-6 rounded-lg font-bold transition-all cursor-pointer"
                    onClick={handleSubmitDelete}
                >
                    Удалить
                </button>
            </div>
        </div>
    )
};

export default ConfirmDelete;