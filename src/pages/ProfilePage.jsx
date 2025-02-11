import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const ProfilePage = ({
  title = "Ой! Что-то пошло не так",
  description = "На данный момент на сайте не реализована система регистрации и авторизации. Пожалуйста, попробуйте повторить попытку позже.",
  buttonText = "На главную",
}) => {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        margin: 0,
        fontFamily: "'Arial', sans-serif",
        color: '#e0e0e0'
      }}
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full text-center"
      >
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-900 rounded-full opacity-80 animate-ping"></div>
            <div 
              className="relative p-6 rounded-full"
              style={{
                backgroundColor: '#7a1d5b',
                padding: '1rem'
              }}
            >
              <ExclamationTriangleIcon className="w-20 h-20 text-purple-200" />
            </div>
          </div>
        </div>

        <h1 
          className="text-4xl md:text-5xl font-bold mb-4"
          style={{
            color: '#ffffff',
            textAlign: 'center'
          }}
        >
          {title}
        </h1>
        
        <p 
          className="text-lg md:text-xl mb-8 max-w-xl mx-auto"
          style={{
            color: '#b0b0b0'
          }}
        >
          {description}
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          style={{
            backgroundColor: '#7a1d5b',
            color: '#ffffff'
          }}
          className="font-semibold px-8 py-3 rounded-lg transition-colors duration-200 transform shadow-lg hover:shadow-purple-900/30 cursor-pointer"
        >
          {buttonText}
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-12 text-sm text-center"
        style={{
          color: '#7a7a7a'
        }}
      >
        <p>Код ошибки: 404</p>
        <p className="mt-2">Если ошибка повторяется, свяжитесь с поддержкой</p>
      </motion.div>
    </div>
  );
};

export default ProfilePage;