import { describe, it, expect } from 'vitest';
import en from './en.json';
import pl from './pl.json';
import nl from './nl.json';
import de from './de.json';
import cs from './cs.json';

/**
 * Translation Completeness Tests
 * 
 * These tests ensure all 5 language files have identical key structures.
 * Per FR-013 requirement: All translation files must have complete key sets.
 */

// Helper function to get all keys from a nested object
function getAllKeys(obj, prefix = '') {
    const keys = [];
    for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            keys.push(...getAllKeys(obj[key], fullKey));
        } else {
            keys.push(fullKey);
        }
    }
    return keys.sort();
}

// Helper function to find missing keys
function findMissingKeys(sourceKeys, targetKeys) {
    return sourceKeys.filter(key => !targetKeys.includes(key));
}

// Helper function to find extra keys
function findExtraKeys(sourceKeys, targetKeys) {
    return targetKeys.filter(key => !sourceKeys.includes(key));
}

describe('Translation File Completeness (FR-013)', () => {
    const enKeys = getAllKeys(en);
    const plKeys = getAllKeys(pl);
    const nlKeys = getAllKeys(nl);
    const deKeys = getAllKeys(de);
    const csKeys = getAllKeys(cs);

    describe('Key Count Verification', () => {
        it('should have approximately 170-180 keys per language file', () => {
            // Actual key count is ~174 based on English reference
            const expectedMinKeys = 170;
            const expectedMaxKeys = 180;

            expect(enKeys.length).toBeGreaterThanOrEqual(expectedMinKeys);
            expect(enKeys.length).toBeLessThanOrEqual(expectedMaxKeys);

            expect(plKeys.length).toBeGreaterThanOrEqual(expectedMinKeys);
            expect(plKeys.length).toBeLessThanOrEqual(expectedMaxKeys);

            expect(nlKeys.length).toBeGreaterThanOrEqual(expectedMinKeys);
            expect(nlKeys.length).toBeLessThanOrEqual(expectedMaxKeys);

            expect(deKeys.length).toBeGreaterThanOrEqual(expectedMinKeys);
            expect(deKeys.length).toBeLessThanOrEqual(expectedMaxKeys);

            expect(csKeys.length).toBeGreaterThanOrEqual(expectedMinKeys);
            expect(csKeys.length).toBeLessThanOrEqual(expectedMaxKeys);
        });

        it('should have similar key counts across all languages (within 5 keys)', () => {
            const counts = {
                en: enKeys.length,
                pl: plKeys.length,
                nl: nlKeys.length,
                de: deKeys.length,
                cs: csKeys.length
            };

            const min = Math.min(...Object.values(counts));
            const max = Math.max(...Object.values(counts));
            const difference = max - min;

            expect(difference).toBeLessThanOrEqual(5);
        });
    });

    describe('German (de.json) Completeness (T020a)', () => {
        it('should have all keys present in English translation', () => {
            const missingKeys = findMissingKeys(enKeys, deKeys);

            if (missingKeys.length > 0) {
                console.error('Missing German translations:', missingKeys);
            }

            expect(missingKeys).toHaveLength(0);
        });

        it('should not have extra keys not in English', () => {
            const extraKeys = findExtraKeys(enKeys, deKeys);

            if (extraKeys.length > 0) {
                console.warn('Extra keys in German:', extraKeys);
            }

            expect(extraKeys).toHaveLength(0);
        });

        it('should have identical key structure to English', () => {
            expect(deKeys).toEqual(enKeys);
        });

        it('should have all top-level sections', () => {
            const requiredSections = ['navigation', 'common', 'players', 'profile', 'pages',
                'live', 'organizer', 'matches', 'brackets', 'standings',
                'select', 'welcome', 'login', 'settings'];

            for (const section of requiredSections) {
                expect(de).toHaveProperty(section);
                expect(de[section]).toBeDefined();
            }
        });
    });

    describe('Czech (cs.json) Completeness (T020b)', () => {
        it('should have all keys present in English translation', () => {
            const missingKeys = findMissingKeys(enKeys, csKeys);

            if (missingKeys.length > 0) {
                console.error('Missing Czech translations:', missingKeys);
            }

            expect(missingKeys).toHaveLength(0);
        });

        it('should not have extra keys not in English', () => {
            const extraKeys = findExtraKeys(enKeys, csKeys);

            if (extraKeys.length > 0) {
                console.warn('Extra keys in Czech:', extraKeys);
            }

            expect(extraKeys).toHaveLength(0);
        });

        it('should have identical key structure to English', () => {
            expect(csKeys).toEqual(enKeys);
        });

        it('should have all top-level sections', () => {
            const requiredSections = ['navigation', 'common', 'players', 'profile', 'pages',
                'live', 'organizer', 'matches', 'brackets', 'standings',
                'select', 'welcome', 'login', 'settings'];

            for (const section of requiredSections) {
                expect(cs).toHaveProperty(section);
                expect(cs[section]).toBeDefined();
            }
        });
    });

    describe('Cross-Language Key Structure Consistency', () => {
        it('Polish should match English key structure', () => {
            expect(plKeys).toEqual(enKeys);
        });

        it('Dutch should match English key structure', () => {
            expect(nlKeys).toEqual(enKeys);
        });

        it('all languages should have identical key structures', () => {
            expect(plKeys).toEqual(enKeys);
            expect(nlKeys).toEqual(enKeys);
            expect(deKeys).toEqual(enKeys);
            expect(csKeys).toEqual(enKeys);
        });
    });

    describe('Translation Value Quality', () => {
        it('should not have empty string values in any language', () => {
            const checkEmptyValues = (obj, lang, prefix = '') => {
                const emptyKeys = [];
                for (const key in obj) {
                    const fullKey = prefix ? `${prefix}.${key}` : key;
                    if (typeof obj[key] === 'object' && obj[key] !== null) {
                        emptyKeys.push(...checkEmptyValues(obj[key], lang, fullKey));
                    } else if (obj[key] === '') {
                        emptyKeys.push(fullKey);
                    }
                }
                return emptyKeys;
            };

            const emptyEn = checkEmptyValues(en, 'en');
            const emptyPl = checkEmptyValues(pl, 'pl');
            const emptyNl = checkEmptyValues(nl, 'nl');
            const emptyDe = checkEmptyValues(de, 'de');
            const emptyCs = checkEmptyValues(cs, 'cs');

            expect(emptyEn).toHaveLength(0);
            expect(emptyPl).toHaveLength(0);
            expect(emptyNl).toHaveLength(0);
            expect(emptyDe).toHaveLength(0);
            expect(emptyCs).toHaveLength(0);
        });

        it('should have string values for all translation keys', () => {
            const checkValueTypes = (obj, prefix = '') => {
                const nonStringKeys = [];
                for (const key in obj) {
                    const fullKey = prefix ? `${prefix}.${key}` : key;
                    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                        nonStringKeys.push(...checkValueTypes(obj[key], fullKey));
                    } else if (typeof obj[key] !== 'string' && typeof obj[key] !== 'object') {
                        nonStringKeys.push({ key: fullKey, type: typeof obj[key] });
                    }
                }
                return nonStringKeys;
            };

            const invalidDe = checkValueTypes(de);
            const invalidCs = checkValueTypes(cs);

            expect(invalidDe).toHaveLength(0);
            expect(invalidCs).toHaveLength(0);
        });
    });
});
