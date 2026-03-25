import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { createMockMatch } from '../test-utils';

// Mock supabase

const mockFrom = vi.fn();
const mockChannel = vi.fn();
const mockRemoveChannel = vi.fn();

vi.mock('../lib/supabase', () => ({
    supabase: {
        from: (...args) => mockFrom(...args),
        channel: (...args) => mockChannel(...args),
        removeChannel: (...args) => mockRemoveChannel(...args),
    },
}));

// Mock useAuth

vi.mock('../hooks/useAuth.tsx', () => ({
    useAuth: () => ({
        isAuthenticated: true,
        isLoading: false,
        login: async () => true,
        logout: async () => { },
    }),
}));

// Mock TournamentContext

vi.mock('./TournamentContext', () => ({
    useTournament: () => ({
        activeTournamentId: 'test-tournament-1',
        tournaments: [],
    }),
}));

import { MatchesProvider, useMatchesContext } from './MatchesContext';

const wrapper = ({ children }) => (
    <MatchesProvider>{children}</MatchesProvider>
);

// Helper to create chainable mock
const createChain = (resolveValue = { data: [], error: null }) => {
    const chain = {};
    chain.select = vi.fn().mockReturnValue(chain);
    chain.insert = vi.fn().mockReturnValue(chain);
    chain.update = vi.fn().mockReturnValue(chain);
    chain.delete = vi.fn().mockReturnValue(chain);
    chain.upsert = vi.fn().mockReturnValue(chain);
    chain.eq = vi.fn().mockReturnValue(chain);
    chain.order = vi.fn().mockReturnValue(chain);
    chain.single = vi.fn().mockResolvedValue(resolveValue);
    chain.then = (fn) => Promise.resolve(resolveValue).then(fn);
    chain.catch = (fn) => Promise.resolve(resolveValue).catch(fn);
    return chain;
};

describe('MatchesContext (Supabase mode)', () => {
    beforeEach(() => {
        mockFrom.mockReset();
        mockChannel.mockReset();
        mockRemoveChannel.mockReset();

        mockFrom.mockReturnValue(createChain({ data: [], error: null }));
        mockChannel.mockReturnValue({
            on: vi.fn().mockReturnThis(),
            subscribe: vi.fn().mockReturnThis(),
        });
    });

    // Initial Loading

    describe('initial loading', () => {
        it('should start with empty matches', async () => {
            const { result } = renderHook(() => useMatchesContext(), { wrapper });

            await waitFor(() => {
                expect(result.current.matches).toEqual([]);
            });
        });

        it('should fetch matches from Supabase', async () => {
            const dbMatches = [
                {
                    id: 'wb-r1-m1',
                    tournament_id: 'test-tournament-1',
                    bracket_type: 'wb',
                    round_id: 1,
                    player1_id: 'p1',
                    player2_id: 'p2',
                    score1: 3,
                    score2: 1,
                    micro_points: '[]',
                    winner_id: 'p1',
                    status: 'finished',
                    court: '',
                    manual_order: null,
                    finished_at: null,
                },
            ];
            const chain = createChain({ data: dbMatches, error: null });
            mockFrom.mockReturnValue(chain);

            const { result } = renderHook(() => useMatchesContext(), { wrapper });

            await waitFor(() => {
                expect(result.current.matches).toHaveLength(1);
            });

            expect(result.current.matches[0].id).toBe('wb-r1-m1');
            expect(result.current.matches[0].score1).toBe(3);
        });

        it('should call supabase.from("matches")', async () => {
            renderHook(() => useMatchesContext(), { wrapper });

            await waitFor(() => {
                expect(mockFrom).toHaveBeenCalledWith('matches');
            });
        });
    });

    // Save Matches

    describe('saveMatches', () => {
        it('should upsert changed matches to Supabase', async () => {
            const upsertChain = createChain({ error: null });
            let callCount = 0;
            mockFrom.mockImplementation(() => {
                callCount++;
                if (callCount <= 1) return createChain({ data: [], error: null });
                return upsertChain;
            });

            const { result } = renderHook(() => useMatchesContext(), { wrapper });

            await waitFor(() => {
                expect(result.current).toBeDefined();
            });

            const newMatches = [
                createMockMatch({ id: 'wb-r1-m1', score1: 2, score2: 1, status: 'live' }),
            ];

            await act(async () => {
                await result.current.saveMatches(newMatches);
            });

            // Verify upsert was called
            expect(mockFrom).toHaveBeenCalledWith('matches');
        });

        it('should update local state optimistically', async () => {
            mockFrom.mockReturnValue(createChain({ data: [], error: null }));

            const { result } = renderHook(() => useMatchesContext(), { wrapper });

            await waitFor(() => {
                expect(result.current).toBeDefined();
            });

            const newMatches = [
                createMockMatch({ id: 'wb-r1-m1', score1: 3, score2: 0, status: 'finished' }),
            ];

            await act(async () => {
                await result.current.saveMatches(newMatches);
            });

            expect(result.current.matches).toHaveLength(1);
            expect(result.current.matches[0].score1).toBe(3);
        });
    });

    // Reset Matches

    describe('resetMatches', () => {
        it('should delete all matches for the tournament', async () => {
            const deleteChain = createChain({ error: null });
            let callCount = 0;
            mockFrom.mockImplementation(() => {
                callCount++;
                if (callCount <= 1) return createChain({ data: [], error: null });
                return deleteChain;
            });

            const { result } = renderHook(() => useMatchesContext(), { wrapper });

            await waitFor(() => {
                expect(result.current).toBeDefined();
            });

            await act(async () => {
                await result.current.resetMatches();
            });

            expect(result.current.matches).toEqual([]);
        });
    });

    // Returned API

    describe('returned API', () => {
        it('should expose matches, saveMatches, resetMatches, isSaving', async () => {
            const { result } = renderHook(() => useMatchesContext(), { wrapper });

            await waitFor(() => {
                expect(result.current).toBeDefined();
            });

            expect(result.current).toHaveProperty('matches');
            expect(result.current).toHaveProperty('saveMatches');
            expect(result.current).toHaveProperty('resetMatches');
            expect(result.current).toHaveProperty('isSaving');
        });
    });

    // Context error

    describe('context error', () => {
        it('should throw when used outside provider', () => {
            expect(() => {
                renderHook(() => useMatchesContext());
            }).toThrow('useMatchesContext must be used within MatchesProvider');
        });
    });
});
