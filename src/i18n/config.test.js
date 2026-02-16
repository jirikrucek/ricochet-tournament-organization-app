import { describe, it, expect } from 'vitest';
import i18n from './config';

describe('i18n configuration', () => {
    describe('fallback language', () => {
        it('should use English (en) as the fallback language', () => {
            expect(i18n.options.fallbackLng).toEqual(['en']);
        });
    });

    describe('supported languages', () => {
        it('should have all 5 languages configured', () => {
            const languages = Object.keys(i18n.options.resources);
            expect(languages).toHaveLength(5);
            expect(languages).toContain('pl');
            expect(languages).toContain('en');
            expect(languages).toContain('nl');
            expect(languages).toContain('de');
            expect(languages).toContain('cs');
        });

        it('should have translation resources for all languages', () => {
            expect(i18n.options.resources.pl).toBeDefined();
            expect(i18n.options.resources.en).toBeDefined();
            expect(i18n.options.resources.nl).toBeDefined();
            expect(i18n.options.resources.de).toBeDefined();
            expect(i18n.options.resources.cs).toBeDefined();
        });
    });

    describe('language detection', () => {
        it('should check localStorage first, then browser language', () => {
            const detectionOrder = i18n.options.detection.order;
            expect(detectionOrder[0]).toBe('localStorage');
            expect(detectionOrder[1]).toBe('navigator');
        });

        it('should cache language preference in localStorage', () => {
            const caches = i18n.options.detection.caches;
            expect(caches).toContain('localStorage');
        });
    });

    describe('interpolation', () => {
        it('should not escape values (React handles XSS)', () => {
            expect(i18n.options.interpolation.escapeValue).toBe(false);
        });
    });
});
