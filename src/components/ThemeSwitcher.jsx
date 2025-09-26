import React from "react";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, Monitor } from "lucide-react";

const ThemeSwitcher = () => {
  const { theme, setThemeMode, isSystemTheme } = useTheme();

  const handleThemeChange = (newTheme) => {
    try {
      setThemeMode(newTheme);
    } catch (error) {
      console.error('Error changing theme:', error);
    }
  };

  const getThemeIcon = (themeType) => {
    switch (themeType) {
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'dark':
        return <Moon className="w-4 h-4" />;
      case 'system':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Sun className="w-4 h-4" />;
    }
  };

  const getThemeLabel = (themeType) => {
    switch (themeType) {
      case 'light':
        return 'Claro';
      case 'dark':
        return 'Oscuro';
      case 'system':
        return 'Sistema';
      default:
        return 'Claro';
    }
  };

  return (
    <div className="flex gap-1 sm:gap-2 bg-surface-light dark:bg-surface-dark rounded-lg p-1 border border-border-light dark:border-border-dark">
      <button
        onClick={() => handleThemeChange("light")}
        className={`px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center gap-2 ${
          theme === "light" && !isSystemTheme
            ? "bg-primary-600 dark:bg-primary-700 text-white shadow-md"
            : "text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-background-dark"
        }`}
        title="Tema claro"
        aria-label="Cambiar a tema claro"
      >
        {getThemeIcon('light')}
        <span className="hidden sm:inline">{getThemeLabel('light')}</span>
      </button>

      <button
        onClick={() => handleThemeChange("dark")}
        className={`px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center gap-2 ${
          theme === "dark" && !isSystemTheme
            ? "bg-primary-600 dark:bg-primary-700 text-white shadow-md"
            : "text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-background-dark"
        }`}
        title="Tema oscuro"
        aria-label="Cambiar a tema oscuro"
      >
        {getThemeIcon('dark')}
        <span className="hidden sm:inline">{getThemeLabel('dark')}</span>
      </button>

      <button
        onClick={() => handleThemeChange("system")}
        className={`px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 min-h-[36px] min-w-[36px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center gap-2 ${
          isSystemTheme
            ? "bg-primary-600 dark:bg-primary-700 text-white shadow-md"
            : "text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-background-dark"
        }`}
        title="Tema del sistema"
        aria-label="Usar tema del sistema"
      >
        {getThemeIcon('system')}
        <span className="hidden sm:inline">{getThemeLabel('system')}</span>
      </button>
    </div>
  );
};

export default ThemeSwitcher;