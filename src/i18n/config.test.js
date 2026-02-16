import { describe, it, expect } from 'vitest';
import i18n from './config';

describe('i18n configuration', () => {
    it('should have English as fallback language', () => {
        expect(i18n.options.fallbackLng).toEqual(['en']);
    });

    it('should support all required languages', () => {
        const supportedLanguages = Object.keys(i18n.options.resources);
        expect(supportedLanguages).toContain('en');
        expect(supportedLanguages).toContain('pl');
        expect(supportedLanguages).toContain('nl');
        expect(supportedLanguages).toContain('de');
        expect(supportedLanguages).toContain('cs');
    });

    it('should have language detector configured', () => {
        expect(i18n.options.detection).toBeDefined();
        expect(i18n.options.detection.order).toContain('localStorage');
        expect(i18n.options.detection.order).toContain('navigator');
    });
});
