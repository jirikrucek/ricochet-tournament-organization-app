import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import pl from './pl.json';
import en from './en.json';
import nl from './nl.json';
import de from './de.json';
import cs from './cs.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            pl: { translation: pl },
            en: { translation: en },
            nl: { translation: nl },
            de: { translation: de },
            cs: { translation: cs }
        },
        fallbackLng: 'en',
        debug: false,
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        }
    });

export default i18n;
