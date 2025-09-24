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
    <div className="flex gap-2">
      <button
        onClick={() => handleLanguageChange("es")}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          userPreferences.language === "es"
            ? "bg-blue-600 text-white shadow-md"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        }`}
        title="Español"
      >
        ES
      </button>
      <button
        onClick={() => handleLanguageChange("en")}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          userPreferences.language === "en"
            ? "bg-green-600 text-white shadow-md"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        }`}
        title="English"
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher;
