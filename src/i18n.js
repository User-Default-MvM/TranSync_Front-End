import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import translationES from "./locales/es/translation.json";
import translationEN from "./locales/en/translation.json";

const resources = {
  es: { translation: translationES },
  en: { translation: translationEN }
};

i18n
  .use(LanguageDetector) // Detecta idioma del navegador
  .use(initReactI18next) // Para React
  .init({
    resources,
    fallbackLng: "es", // Por defecto español
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
