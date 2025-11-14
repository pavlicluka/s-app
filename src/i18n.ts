import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Initialize i18n with HTTP backend to load translation files dynamically
i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'sl',
    debug: false,
    ns: ['translation'],
    defaultNS: 'translation',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      addPath: '/locales/add/{{lng}}/{{ns}}'
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false
    },
    load: 'languageOnly',
    react: {
      useSuspense: false
    }
  });

// Listen for language changes to reload translations
i18n.on('languageChanged', (lng) => {
  console.log('🌍 i18n: Language changed to:', lng);
});

console.log('✅ i18n: Initialized with dynamic translation loading from files');

export default i18n;
