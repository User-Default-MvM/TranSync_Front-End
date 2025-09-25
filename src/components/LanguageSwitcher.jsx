import React from "react";
import { useUser } from "../context/UserContext";

const LanguageSwitcher = () => {
  const { changeLanguage, userPreferences } = useUser();

  const handleLanguageChange = async (lng) => {
    try {
      await changeLanguage(lng);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  return (
    <div className="flex gap-1 sm:gap-2">
      <button
        onClick={() => handleLanguageChange("es")}
        className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center ${
          userPreferences.language === "es"
            ? "bg-blue-600 text-white shadow-md"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        }`}
        title="Español"
        aria-label="Cambiar a español"
      >
        ES
      </button>
      <button
        onClick={() => handleLanguageChange("en")}
        className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center ${
          userPreferences.language === "en"
            ? "bg-green-600 text-white shadow-md"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        }`}
        title="English"
        aria-label="Switch to English"
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher;
