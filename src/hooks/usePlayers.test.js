import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';

// Mock supabase BEFORE importing usePlayers

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

// Mock useAuth with mutable isAuthenticated
let mockIsAuthenticated = true;

vi.mock('../hooks/useAuth.tsx', () => ({
    useAuth: () => ({
        get isAuthenticated() { return mockIsAuthenticated; },
        isLoading: false,
        login: async () => true,
        logout: async () => { },
    }),
}));

// Mock TournamentContext

vi.mock('../contexts/TournamentContext', () => ({
    useTournament: () => ({
        activeTournamentId: 'test-tournament-1',
        tournaments: [],
    }),
}));

import { usePlayers } from './usePlayers';
import { createMockPlayer } from '../test-utils';

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

describe('usePlayers (Supabase mode)', () => {
    beforeEach(() => {
        mockFrom.mockReset();
        mockChannel.mockReset();
        mockRemoveChannel.mockReset();
        mockIsAuthenticated = true;

        mockFrom.mockReturnValue(createChain({ data: [], error: null }));
        mockChannel.mockReturnValue({
            on: vi.fn().mockReturnThis(),
            subscribe: vi.fn().mockReturnThis(),
        });
    });

    // Initial Loading

    describe('initial loading', () => {
        it('should start with empty players', async () => {
            const { result } = renderHook(() => usePlayers());

            await waitFor(() => {
                expect(result.current.players).toEqual([]);
            });
        });

        it('should fetch players from Supabase', async () => {
            const players = [
                createMockPlayer({ id: 'p1', full_name: 'Player 1' }),
                createMockPlayer({ id: 'p2', full_name: 'Player 2' }),
            ];
            const chain = createChain({ data: players, error: null });
            mockFrom.mockReturnValue(chain);

            const { result } = renderHook(() => usePlayers());

            await waitFor(() => {
                expect(result.current.players).toHaveLength(2);
            });

            expect(result.current.players[0].full_name).toBe('Player 1');
        });
    });

    // Add Player

    describe('addPlayer', () => {
        it('should insert via Supabase and add to state', async () => {
            const newPlayer = createMockPlayer({ id: 'new-1', full_name: 'New Player' });

            let callCount = 0;
            mockFrom.mockImplementation(() => {
                callCount++;
                if (callCount <= 1) return createChain({ data: [], error: null });
                // insert chain returns single player
                const insertChain = createChain({ data: newPlayer, error: null });
                return insertChain;
            });

            const { result } = renderHook(() => usePlayers());

            await waitFor(() => {
                expect(result.current.players).toEqual([]);
            });

            let addedPlayer;
            await act(async () => {
                addedPlayer = await result.current.addPlayer({
                    full_name: 'New Player',
                    country: 'pl',
                    elo: 1500,
                });
            });

            expect(addedPlayer).toBeDefined();
            expect(result.current.players).toContainEqual(
                expect.objectContaining({ full_name: 'New Player' })
            );
        });

        it('should return null on Supabase error', async () => {
            let callCount = 0;
            mockFrom.mockImplementation(() => {
                callCount++;
                if (callCount <= 1) return createChain({ data: [], error: null });
                const errorChain = createChain({ data: null, error: { message: 'Insert failed' } });
                errorChain.single = vi.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } });
                return errorChain;
            });

            const { result } = renderHook(() => usePlayers());

            await waitFor(() => {
                expect(result.current.players).toEqual([]);
            });

            let addedPlayer;
            await act(async () => {
                addedPlayer = await result.current.addPlayer({ full_name: 'Fail' });
            });

            expect(addedPlayer).toBeNull();
        });

        it('should not add when not authenticated', async () => {
            mockIsAuthenticated = false;

            const { result } = renderHook(() => usePlayers());

            await waitFor(() => {
                expect(result.current).toBeDefined();
            });

            let added;
            await act(async () => {
                added = await result.current.addPlayer({ full_name: 'Test' });
            });

            expect(added).toBeNull();
        });
    });

    // Update Player

    describe('updatePlayer', () => {
        it('should update via Supabase and update state', async () => {
            const players = [createMockPlayer({ id: 'p1', full_name: 'Old Name' })];

            let callCount = 0;
            mockFrom.mockImplementation(() => {
                callCount++;
                if (callCount <= 1) return createChain({ data: players, error: null });
                return createChain({ error: null });
            });

            const { result } = renderHook(() => usePlayers());

            await waitFor(() => {
                expect(result.current.players).toHaveLength(1);
            });

            await act(async () => {
                await result.current.updatePlayer('p1', { full_name: 'New Name' });
            });

            expect(result.current.players[0].full_name).toBe('New Name');
        });
    });

    // Delete Player

    describe('deletePlayer', () => {
        it('should delete via Supabase and remove from state', async () => {
            const players = [
                createMockPlayer({ id: 'p1' }),
                createMockPlayer({ id: 'p2' }),
            ];

            let callCount = 0;
            mockFrom.mockImplementation(() => {
                callCount++;
                if (callCount <= 1) return createChain({ data: players, error: null });
                return createChain({ error: null });
            });

            const { result } = renderHook(() => usePlayers());

            await waitFor(() => {
                expect(result.current.players).toHaveLength(2);
            });

            await act(async () => {
                await result.current.deletePlayer('p2');
            });

            expect(result.current.players).toHaveLength(1);
            expect(result.current.players[0].id).toBe('p1');
        });
    });

    // Bulk Upsert

    describe('bulkUpsertPlayers', () => {
        it('should upsert via Supabase and return success', async () => {
            const upsertedPlayers = [
                createMockPlayer({ id: 'b1', full_name: 'Bulk 1' }),
                createMockPlayer({ id: 'b2', full_name: 'Bulk 2' }),
            ];

            let callCount = 0;
            mockFrom.mockImplementation(() => {
                callCount++;
                if (callCount <= 1) return createChain({ data: [], error: null });
                return createChain({ data: upsertedPlayers, error: null });
            });

            const { result } = renderHook(() => usePlayers());

            await waitFor(() => {
                expect(result.current).toBeDefined();
            });

            let bulkResult;
            await act(async () => {
                bulkResult = await result.current.bulkUpsertPlayers([
                    { full_name: 'Bulk 1', country: 'pl', elo: 1000 },
                    { full_name: 'Bulk 2', country: 'de', elo: 1200 },
                ]);
            });

            expect(bulkResult.success).toBe(true);
            expect(bulkResult.count).toBe(2);
        });

        it('should return error when not authenticated', async () => {
            mockIsAuthenticated = false;

            const { result } = renderHook(() => usePlayers());

            await waitFor(() => {
                expect(result.current).toBeDefined();
            });

            let bulkResult;
            await act(async () => {
                bulkResult = await result.current.bulkUpsertPlayers([{ full_name: 'Test' }]);
            });

            expect(bulkResult.success).toBe(false);
        });
    });

    // Returned API

    describe('returned API', () => {
        it('should expose all expected functions', async () => {
            const { result } = renderHook(() => usePlayers());

            await waitFor(() => {
                expect(result.current).toBeDefined();
            });

            expect(result.current).toHaveProperty('players');
            expect(result.current).toHaveProperty('addPlayer');
            expect(result.current).toHaveProperty('updatePlayer');
            expect(result.current).toHaveProperty('deletePlayer');
            expect(result.current).toHaveProperty('bulkUpsertPlayers');
        });
    });
});
