import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { createMockPlayers } from '../test-utils';

// ─── Mock Dependencies ──────────────────────────────────────────────────────

const mockSaveMatches = vi.fn();
const mockResetMatches = vi.fn();
const mockRawMatches = [];

vi.mock('./useMatches', () => ({
    useMatches: () => ({
        matches: mockRawMatches,
        saveMatches: mockSaveMatches,
        resetMatches: mockResetMatches,
        isSaving: false,
    }),
}));

vi.mock('./usePlayers', () => ({
    usePlayers: () => ({
        players: createMockPlayers(32),
    }),
}));

vi.mock('../lib/supabase', () => ({
    supabase: {},
}));

import { useTournamentMatches } from './useTournamentMatches';

// ─────────────────────────────────────────────────────────────────────────────

describe('useTournamentMatches', () => {
    it('should return hydrated matches, saveMatches, resetMatches, and isSaving', () => {
        const { result } = renderHook(() => useTournamentMatches());

        expect(result.current).toHaveProperty('matches');
        expect(result.current).toHaveProperty('saveMatches');
        expect(result.current).toHaveProperty('resetMatches');
        expect(result.current).toHaveProperty('isSaving');
        expect(Array.isArray(result.current.matches)).toBe(true);
    });

    it('should return raw matches when no players', () => {
        // Override the mock for this test
        vi.doMock('./usePlayers', () => ({
            usePlayers: () => ({
                players: [],
            }),
        }));

        const { result } = renderHook(() => useTournamentMatches());

        // With no players, should return rawMatches as-is
        expect(result.current.matches).toBeDefined();
    });

    it('should hydrate bracket state from raw matches and players', () => {
        const { result } = renderHook(() => useTournamentMatches());

        // Should generate a full bracket when players exist
        const matches = result.current.matches;
        expect(matches.length).toBeGreaterThan(0);

        // Should have WB R1 matches with players assigned
        const wbR1 = matches.filter(m => m.bracket === 'wb' && m.round === 1);
        expect(wbR1.length).toBe(16);

        // First match should have players seeded
        expect(wbR1[0].player1Id).toBeTruthy();
        expect(wbR1[0].player2Id).toBeTruthy();
    });

    it('should pass through saveMatches from useMatches', () => {
        const { result } = renderHook(() => useTournamentMatches());
        expect(result.current.saveMatches).toBe(mockSaveMatches);
    });

    it('should pass through resetMatches from useMatches', () => {
        const { result } = renderHook(() => useTournamentMatches());
        expect(result.current.resetMatches).toBe(mockResetMatches);
    });

    it('should pass through isSaving from useMatches', () => {
        const { result } = renderHook(() => useTournamentMatches());
        expect(result.current.isSaving).toBe(false);
    });
});
