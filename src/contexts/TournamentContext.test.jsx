import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { createMockTournament } from '../test-utils';

// ─── Mock supabase ──────────────────────────────────────────────────────────

vi.mock('../lib/supabase', () => ({
    isSupabaseConfigured: false,
    supabase: {
        from: vi.fn(),
        channel: vi.fn(() => ({
            on: vi.fn().mockReturnThis(),
            subscribe: vi.fn().mockReturnThis(),
        })),
        removeChannel: vi.fn(),
    },
}));

import { TournamentProvider, useTournament } from './TournamentContext';

const LOCAL_META_KEY = 'ricochet_tournaments_meta';

const wrapper = ({ children }) => (
    <TournamentProvider>{children}</TournamentProvider>
);

// ─────────────────────────────────────────────────────────────────────────────

describe('TournamentContext (localStorage mode)', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    // ─── Initial Loading ────────────────────────────────────────────────

    describe('initial loading', () => {
        it('should seed a default tournament when no data in localStorage', async () => {
            const { result } = renderHook(() => useTournament(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.tournaments).toHaveLength(1);
            expect(result.current.tournaments[0].name).toBe('RICOCHET DUTCH OPEN 2026');
            expect(result.current.tournaments[0].id).toBe('default-rpo-2026');
        });

        it('should load existing tournaments from localStorage', async () => {
            const existing = [
                createMockTournament({ id: 't1', name: 'Tournament 1' }),
                createMockTournament({ id: 't2', name: 'Tournament 2' }),
            ];
            localStorage.setItem(LOCAL_META_KEY, JSON.stringify(existing));

            const { result } = renderHook(() => useTournament(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.tournaments).toHaveLength(2);
            expect(result.current.tournaments[0].name).toBe('Tournament 1');
        });

        it('should seed default when stored array is empty', async () => {
            localStorage.setItem(LOCAL_META_KEY, JSON.stringify([]));

            const { result } = renderHook(() => useTournament(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.tournaments).toHaveLength(1);
            expect(result.current.tournaments[0].name).toBe('RICOCHET DUTCH OPEN 2026');
        });

        it('should handle corrupt localStorage data gracefully', async () => {
            localStorage.setItem(LOCAL_META_KEY, 'not-json!!!');

            const { result } = renderHook(() => useTournament(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Should fail gracefully with empty tournaments
            expect(result.current.tournaments).toEqual([]);
        });
    });

    // ─── selectTournament ───────────────────────────────────────────────

    describe('selectTournament', () => {
        it('should set the active tournament and persist to localStorage', async () => {
            const existing = [
                createMockTournament({ id: 't1', name: 'Tournament 1' }),
                createMockTournament({ id: 't2', name: 'Tournament 2' }),
            ];
            localStorage.setItem(LOCAL_META_KEY, JSON.stringify(existing));

            const { result } = renderHook(() => useTournament(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            act(() => {
                result.current.selectTournament('t2');
            });

            expect(result.current.activeTournamentId).toBe('t2');
            expect(localStorage.getItem('ricochet_active_id')).toBe('t2');
        });

        it('should auto-select first tournament on load', async () => {
            const existing = [
                createMockTournament({ id: 't1', name: 'Tournament 1' }),
            ];
            localStorage.setItem(LOCAL_META_KEY, JSON.stringify(existing));

            const { result } = renderHook(() => useTournament(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            await waitFor(() => {
                expect(result.current.activeTournamentId).toBe('t1');
            });
        });

        it('should restore previously selected tournament from localStorage', async () => {
            const existing = [
                createMockTournament({ id: 't1' }),
                createMockTournament({ id: 't2' }),
            ];
            localStorage.setItem(LOCAL_META_KEY, JSON.stringify(existing));
            localStorage.setItem('ricochet_active_id', 't2');

            const { result } = renderHook(() => useTournament(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            await waitFor(() => {
                expect(result.current.activeTournamentId).toBe('t2');
            });
        });
    });

    // ─── createTournament ───────────────────────────────────────────────

    describe('createTournament', () => {
        it('should create a new tournament in localStorage', async () => {
            const { result } = renderHook(() => useTournament(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            let newId;
            await act(async () => {
                newId = await result.current.createTournament('New Tournament');
            });

            expect(newId).toBeTruthy();
            expect(result.current.tournaments).toHaveLength(2); // default + new
            expect(result.current.tournaments[0].name).toBe('New Tournament');

            // Should auto-select the new tournament
            expect(result.current.activeTournamentId).toBe(newId);

            // Verify persistence
            const stored = JSON.parse(localStorage.getItem(LOCAL_META_KEY));
            expect(stored).toHaveLength(2);
        });

        it('should create tournament with correct defaults', async () => {
            const { result } = renderHook(() => useTournament(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            await act(async () => {
                await result.current.createTournament('Test');
            });

            const created = result.current.tournaments[0];
            expect(created.status).toBe('setup');
            expect(created.address).toBe('');
            expect(created.date).toBeTruthy();
        });
    });

    // ─── updateTournament ───────────────────────────────────────────────

    describe('updateTournament', () => {
        it('should update tournament fields in localStorage', async () => {
            const existing = [createMockTournament({ id: 't1', name: 'Original' })];
            localStorage.setItem(LOCAL_META_KEY, JSON.stringify(existing));

            const { result } = renderHook(() => useTournament(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            await act(async () => {
                await result.current.updateTournament('t1', { name: 'Updated Name', status: 'active' });
            });

            expect(result.current.tournaments[0].name).toBe('Updated Name');
            expect(result.current.tournaments[0].status).toBe('active');

            const stored = JSON.parse(localStorage.getItem(LOCAL_META_KEY));
            expect(stored[0].name).toBe('Updated Name');
        });
    });

    // ─── deleteTournament ───────────────────────────────────────────────

    describe('deleteTournament', () => {
        it('should remove a tournament from localStorage', async () => {
            const existing = [
                createMockTournament({ id: 't1', name: 'Tournament 1' }),
                createMockTournament({ id: 't2', name: 'Tournament 2' }),
            ];
            localStorage.setItem(LOCAL_META_KEY, JSON.stringify(existing));

            const { result } = renderHook(() => useTournament(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            await act(async () => {
                await result.current.deleteTournament('t1');
            });

            expect(result.current.tournaments).toHaveLength(1);
            expect(result.current.tournaments[0].id).toBe('t2');
        });

        it('should clean up related localStorage keys on delete', async () => {
            const existing = [createMockTournament({ id: 't1' })];
            localStorage.setItem(LOCAL_META_KEY, JSON.stringify(existing));
            localStorage.setItem('ricochet_players_db_t1', JSON.stringify([]));
            localStorage.setItem('ricochet_bracket_data_t1', JSON.stringify([]));

            const { result } = renderHook(() => useTournament(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            await act(async () => {
                await result.current.deleteTournament('t1');
            });

            expect(localStorage.getItem('ricochet_players_db_t1')).toBeNull();
            expect(localStorage.getItem('ricochet_bracket_data_t1')).toBeNull();
        });

        it('should switch active tournament when currently active one is deleted', async () => {
            const existing = [
                createMockTournament({ id: 't1' }),
                createMockTournament({ id: 't2' }),
            ];
            localStorage.setItem(LOCAL_META_KEY, JSON.stringify(existing));
            localStorage.setItem('ricochet_active_id', 't1');

            const { result } = renderHook(() => useTournament(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            // Wait for active ID to be restored
            await waitFor(() => {
                expect(result.current.activeTournamentId).toBe('t1');
            });

            await act(async () => {
                await result.current.deleteTournament('t1');
            });

            // Should switch to remaining tournament
            expect(result.current.activeTournamentId).toBe('t2');
        });

        it('should set activeTournamentId to null when last tournament is deleted', async () => {
            const existing = [createMockTournament({ id: 't-only' })];
            localStorage.setItem(LOCAL_META_KEY, JSON.stringify(existing));

            const { result } = renderHook(() => useTournament(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            await act(async () => {
                await result.current.deleteTournament('t-only');
            });

            expect(result.current.activeTournamentId).toBeNull();
        });
    });

    // ─── Context Error ──────────────────────────────────────────────────

    describe('useTournament outside provider', () => {
        it('should throw an error when used outside TournamentProvider', () => {
            expect(() => {
                renderHook(() => useTournament());
            }).toThrow('useTournament must be used within TournamentProvider');
        });
    });
});
