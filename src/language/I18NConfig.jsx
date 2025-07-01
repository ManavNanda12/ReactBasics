import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './English.Translation.json';
import hi from './Hindi.Translation.json';
import gu from './Gujarati.Translation.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    gu: { translation: gu },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
