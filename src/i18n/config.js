import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './en.json';
import cs from './cs.json';
import de from './de.json';
import nl from './nl.json';
import pl from './pl.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            cs: { translation: cs },
            de: { translation: de },
            nl: { translation: nl },
            pl: { translation: pl }
        },
        // Fallback language for missing translation keys
        // All languages fall back to English when a key is not found
        // This ensures international users see English (not Polish) as default
        // IMPORTANT: When adding new features, always add English translations first
        //            Other language translations can be added later—they will show English until translated
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
