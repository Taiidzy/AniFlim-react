import { FiUser, FiAlertTriangle } from "react-icons/fi";

const AgeRatingBadge = ({ label, description }) => {
    // Определяем цвет в зависимости от рейтинга
    const getRatingColor = () => {
      const age = parseInt(label) || 0;
      if (age >= 18) return "bg-red-600 border-red-700";
      if (age >= 16) return "bg-orange-500 border-orange-600";
      if (age >= 12) return "bg-yellow-500 border-yellow-600";
      return "bg-green-500 border-green-600";
    };
  
    return (
      <div className={`${getRatingColor()} inline-flex items-center px-4 py-2 rounded-full border-2 backdrop-blur-sm transition-all hover:scale-105`}>
        <FiAlertTriangle className="mr-2 text-white shrink-0" />
        <div className="text-white font-semibold tracking-wide">
            <span className="block text-sm leading-tight drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                {label}
            </span>
            <span className="block text-xs font-normal opacity-90">{description}</span>
        </div>
      </div>
    );
};

export default AgeRatingBadge;