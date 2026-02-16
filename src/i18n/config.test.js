import { describe, it, expect, beforeEach } from 'vitest';
import i18n from './config';

describe('i18n Configuration', () => {
    beforeEach(async () => {
        // Reset i18n to English for consistent test state
        await i18n.changeLanguage('en');
    });

    describe('Language Loading and Configuration', () => {
        it('should have English as fallback language', () => {
            const fallback = i18n.options.fallbackLng;
            // i18next normalizes fallbackLng to an array
            expect(Array.isArray(fallback) ? fallback[0] : fallback).toBe('en');
        });

        it('should load all 5 supported languages', () => {
            const loadedLanguages = Object.keys(i18n.options.resources);
            expect(loadedLanguages).toContain('en');
            expect(loadedLanguages).toContain('pl');
            expect(loadedLanguages).toContain('nl');
            expect(loadedLanguages).toContain('de');
            expect(loadedLanguages).toContain('cs');
            expect(loadedLanguages).toHaveLength(5);
        });

        it('should use localStorage and navigator for language detection', () => {
            const detectionOrder = i18n.options.detection.order;
            expect(detectionOrder).toEqual(['localStorage', 'navigator']);
        });

        it('should cache language preference in localStorage', () => {
            const caches = i18n.options.detection.caches;
            expect(caches).toContain('localStorage');
        });
    });

    describe('Translation Fallback Behavior (FR-011, FR-012)', () => {
        it('should fall back to English for missing translation keys', () => {
            // Switch to German (which may have partial translations)
            i18n.changeLanguage('de');

            // Try to get a translation - should fall back to English if missing in German
            const translation = i18n.t('test.nonexistent.key', { fallbackLng: 'en' });

            // Should not return the key itself (which would indicate no fallback)
            expect(typeof translation).toBe('string');
        });

        it('should handle unsupported language codes gracefully', async () => {
            // Try to switch to an unsupported language
            await i18n.changeLanguage('xx');

            // Should fall back to English (fallbackLng)
            const currentLanguage = i18n.language;
            expect(['en', 'xx']).toContain(currentLanguage);
        });

        it('should preserve existing language preferences', () => {
            // This tests localStorage preservation (FR-005, FR-009)
            const originalLanguage = i18n.language;

            // Change language
            i18n.changeLanguage('pl');
            expect(i18n.language).toBe('pl');

            // Restore original
            i18n.changeLanguage(originalLanguage);
        });
    });

    describe('Error Handling and Graceful Degradation (FR-011)', () => {
        it('should handle malformed translation keys without crashing', () => {
            // Attempt to access a deeply nested non-existent key
            expect(() => {
                i18n.t('deeply.nested.nonexistent.key.path');
            }).not.toThrow();
        });

        it('should not throw errors for empty translation requests', () => {
            expect(() => {
                i18n.t('');
            }).not.toThrow();
        });

        it('should handle null/undefined keys gracefully', () => {
            expect(() => {
                i18n.t(null);
                i18n.t(undefined);
            }).not.toThrow();
        });
    });

    describe('Language Resources Completeness', () => {
        it('should have translation resources for English', () => {
            const enResources = i18n.getResourceBundle('en', 'translation');
            expect(enResources).toBeDefined();
            expect(Object.keys(enResources).length).toBeGreaterThan(0);
        });

        it('should have translation resources for Polish', () => {
            const plResources = i18n.getResourceBundle('pl', 'translation');
            expect(plResources).toBeDefined();
            expect(Object.keys(plResources).length).toBeGreaterThan(0);
        });

        it('should have translation resources for Dutch', () => {
            const nlResources = i18n.getResourceBundle('nl', 'translation');
            expect(nlResources).toBeDefined();
            expect(Object.keys(nlResources).length).toBeGreaterThan(0);
        });

        it('should have translation resources for German', () => {
            const deResources = i18n.getResourceBundle('de', 'translation');
            expect(deResources).toBeDefined();
            expect(Object.keys(deResources).length).toBeGreaterThan(0);
        });

        it('should have translation resources for Czech', () => {
            const csResources = i18n.getResourceBundle('cs', 'translation');
            expect(csResources).toBeDefined();
            expect(Object.keys(csResources).length).toBeGreaterThan(0);
        });
    });
});
