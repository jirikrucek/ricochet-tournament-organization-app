import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { createMockTournament } from '../test-utils';

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

import { TournamentProvider, useTournament } from './TournamentContext';

const wrapper = ({ children }) => (
    <TournamentProvider>{children}</TournamentProvider>
);

// Helper to create chainable mock
const createChain = (resolveValue = { data: [], error: null }) => {
    const chain = {};
    chain.select = vi.fn().mockReturnValue(chain);
    chain.insert = vi.fn().mockReturnValue(chain);
    chain.update = vi.fn().mockReturnValue(chain);
    chain.delete = vi.fn().mockReturnValue(chain);
    chain.eq = vi.fn().mockReturnValue(chain);
    chain.order = vi.fn().mockReturnValue(chain);
    chain.single = vi.fn().mockResolvedValue(resolveValue);
    chain.then = (fn) => Promise.resolve(resolveValue).then(fn);
    chain.catch = (fn) => Promise.resolve(resolveValue).catch(fn);
    return chain;
};

describe('TournamentContext (Supabase mode)', () => {
    let defaultChain;

    beforeEach(() => {
        localStorage.clear();
        mockFrom.mockReset();
        mockChannel.mockReset();
        mockRemoveChannel.mockReset();

        defaultChain = createChain({ data: [], error: null });
        mockFrom.mockReturnValue(defaultChain);
        mockChannel.mockReturnValue({
            on: vi.fn().mockReturnThis(),
            subscribe: vi.fn().mockReturnThis(),
        });
    });

    // Initial Loading

    describe('initial loading', () => {
        it('should start in loading state', () => {
            const { result } = renderHook(() => useTournament(), { wrapper });
            expect(result.current.isLoading).toBe(true);
        });

        it('should load tournaments from Supabase', async () => {
            const tournaments = [
                createMockTournament({ id: 't1', name: 'Tournament 1' }),
                createMockTournament({ id: 't2', name: 'Tournament 2' }),
            ];
            const chain = createChain({ data: tournaments, error: null });
            mockFrom.mockReturnValue(chain);

            const { result } = renderHook(() => useTournament(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.tournaments).toHaveLength(2);
            expect(mockFrom).toHaveBeenCalledWith('tournaments');
        });

        it('should handle Supabase fetch error gracefully', async () => {
            const chain = createChain({ data: null, error: { message: 'Network error' } });
            // Override the chain to throw when awaited
            const errorChain = {
                ...chain,
                select: vi.fn().mockReturnValue({
                    order: vi.fn().mockResolvedValue({ data: null, error: { message: 'Network error' } }),
                }),
            };
            mockFrom.mockReturnValue(errorChain);

            const { result } = renderHook(() => useTournament(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.tournaments).toEqual([]);
        });
    });

    // Select Tournament

    describe('selectTournament', () => {
        it('should update activeTournamentId', async () => {
            const tournaments = [
                createMockTournament({ id: 't1' }),
                createMockTournament({ id: 't2' }),
            ];
            const chain = createChain({ data: tournaments, error: null });
            mockFrom.mockReturnValue(chain);

            const { result } = renderHook(() => useTournament(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.selectTournament('t2');
            });

            expect(result.current.activeTournamentId).toBe('t2');
        });

        it('should persist active ID to localStorage', async () => {
            const tournaments = [createMockTournament({ id: 't1' })];
            const chain = createChain({ data: tournaments, error: null });
            mockFrom.mockReturnValue(chain);

            const { result } = renderHook(() => useTournament(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.selectTournament('t1');
            });

            expect(localStorage.getItem('ricochet_active_id')).toBe('t1');
        });

        it('should restore active ID from localStorage on load', async () => {
            localStorage.setItem('ricochet_active_id', 't2');

            const tournaments = [
                createMockTournament({ id: 't1' }),
                createMockTournament({ id: 't2' }),
            ];
            const chain = createChain({ data: tournaments, error: null });
            mockFrom.mockReturnValue(chain);

            const { result } = renderHook(() => useTournament(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.activeTournamentId).toBe('t2');
        });
    });

    // Create Tournament

    describe('createTournament', () => {
        it('should insert via Supabase and add to state', async () => {
            const newTournament = createMockTournament({ id: 'new-1', name: 'New Tournament' });

            // Let initial load use the default chain from beforeEach
            const { result } = renderHook(() => useTournament(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Override mockFrom for the insert operation
            const insertChain = createChain({ data: newTournament, error: null });
            mockFrom.mockReturnValue(insertChain);

            let createdId;
            await act(async () => {
                createdId = await result.current.createTournament('New Tournament');
            });

            expect(createdId).toBe('new-1');
            expect(result.current.tournaments).toContainEqual(
                expect.objectContaining({ id: 'new-1' })
            );
        });

        it('should return null on Supabase error', async () => {
            // Let initial load use the default chain from beforeEach
            const { result } = renderHook(() => useTournament(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Override mockFrom for the error insert operation
            const errorChain = createChain({ data: null, error: { message: 'Insert failed' } });
            mockFrom.mockReturnValue(errorChain);

            let createdId;
            await act(async () => {
                createdId = await result.current.createTournament('Fail Tournament');
            });

            expect(createdId).toBeNull();
        });
    });

    // Update Tournament

    describe('updateTournament', () => {
        it('should update via Supabase and update state', async () => {
            const tournaments = [createMockTournament({ id: 't1', name: 'Old Name' })];
            let callCount = 0;
            mockFrom.mockImplementation(() => {
                callCount++;
                if (callCount <= 1) return createChain({ data: tournaments, error: null });
                return createChain({ error: null });
            });

            const { result } = renderHook(() => useTournament(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            await act(async () => {
                await result.current.updateTournament('t1', { name: 'New Name' });
            });

            expect(result.current.tournaments[0].name).toBe('New Name');
        });
    });

    // Delete Tournament

    describe('deleteTournament', () => {
        it('should delete via Supabase and remove from state', async () => {
            const tournaments = [
                createMockTournament({ id: 't1' }),
                createMockTournament({ id: 't2' }),
            ];
            let callCount = 0;
            mockFrom.mockImplementation(() => {
                callCount++;
                if (callCount <= 1) return createChain({ data: tournaments, error: null });
                return createChain({ error: null });
            });

            const { result } = renderHook(() => useTournament(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            await act(async () => {
                await result.current.deleteTournament('t2');
            });

            expect(result.current.tournaments).toHaveLength(1);
            expect(result.current.tournaments[0].id).toBe('t1');
        });
    });

    // Context error

    describe('context error', () => {
        it('should throw when used outside provider', () => {
            expect(() => {
                renderHook(() => useTournament());
            }).toThrow('useTournament must be used within TournamentProvider');
        });
    });
});
