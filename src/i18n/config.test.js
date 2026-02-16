import { describe, it, expect } from 'vitest';
import i18n from './config';

describe('i18n configuration', () => {
    it('should have English as fallback language', () => {
        const fallback = i18n.options.fallbackLng;
        const fallbackArray = Array.isArray(fallback) ? fallback : [fallback];
        expect(fallbackArray).toEqual(['en']);
    });

    it('should support required languages', () => {
        const supportedLanguages = Object.keys(i18n.options.resources);
        expect(supportedLanguages).toContain('en');
        expect(supportedLanguages).toContain('pl');
        expect(supportedLanguages).toContain('nl');
    });

    it('should have language detector configured', () => {
        expect(i18n.options.detection).toBeDefined();
        expect(i18n.options.detection.order).toContain('localStorage');
        expect(i18n.options.detection.order).toContain('navigator');
    });
});
