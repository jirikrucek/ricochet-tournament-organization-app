import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';

// Mock supabase

const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignOut = vi.fn();
const mockUnsubscribe = vi.fn();

vi.mock('../lib/supabase', () => ({
    supabase: {
        auth: {
            getSession: (...args: unknown[]) => mockGetSession(...args),
            onAuthStateChange: (...args: unknown[]) => mockOnAuthStateChange(...args),
            signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
            signOut: (...args: unknown[]) => mockSignOut(...args),
        },
    },
}));

import { AuthProvider, useAuth } from './useAuth.tsx';

// Setup

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
);

describe('useAuth', () => {
    beforeEach(() => {
        mockGetSession.mockReset();
        mockOnAuthStateChange.mockReset();
        mockSignInWithPassword.mockReset();
        mockSignOut.mockReset();
        mockUnsubscribe.mockReset();

        // Default: no active session
        mockGetSession.mockResolvedValue({ data: { session: null } });
        mockOnAuthStateChange.mockReturnValue({
            data: { subscription: { unsubscribe: mockUnsubscribe } },
        });
        mockSignOut.mockResolvedValue({});
    });

    // Initial State

    describe('initial state', () => {
        it('should start as loading then resolve to not authenticated', async () => {
            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.isAuthenticated).toBe(false);
        });

        it('should restore auth state from existing Supabase session', async () => {
            mockGetSession.mockResolvedValue({
                data: { session: { user: { id: 'u1' } } },
            });

            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.isAuthenticated).toBe(true);
        });

        it('should subscribe to auth state changes', async () => {
            renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(mockOnAuthStateChange).toHaveBeenCalledTimes(1);
            });
        });

        it('should unsubscribe on unmount', async () => {
            const { unmount } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(mockOnAuthStateChange).toHaveBeenCalled();
            });

            unmount();
            expect(mockUnsubscribe).toHaveBeenCalled();
        });

        it('should update isAuthenticated when auth state changes', async () => {
            let authChangeCallback: (event: string, session: unknown) => void;
            mockOnAuthStateChange.mockImplementation((cb: (event: string, session: unknown) => void) => {
                authChangeCallback = cb;
                return {
                    data: { subscription: { unsubscribe: mockUnsubscribe } },
                };
            });

            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.isAuthenticated).toBe(false);

            // Simulate a sign-in event
            act(() => {
                authChangeCallback('SIGNED_IN', { user: { id: 'u1' } });
            });

            expect(result.current.isAuthenticated).toBe(true);

            // Simulate a sign-out event
            act(() => {
                authChangeCallback('SIGNED_OUT', null);
            });

            expect(result.current.isAuthenticated).toBe(false);
        });
    });

    // Login

    describe('login', () => {
        it('should return true on successful login', async () => {
            mockSignInWithPassword.mockResolvedValue({ error: null });

            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            let loginResult: boolean;
            await act(async () => {
                loginResult = await result.current.login('admin@test.com', 'password123');
            });

            expect(loginResult!).toBe(true);
            expect(mockSignInWithPassword).toHaveBeenCalledWith({
                email: 'admin@test.com',
                password: 'password123',
            });
        });

        it('should return false on failed login', async () => {
            mockSignInWithPassword.mockResolvedValue({
                error: { message: 'Invalid credentials' },
            });

            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            let loginResult: boolean;
            await act(async () => {
                loginResult = await result.current.login('wrong@test.com', 'wrongpass');
            });

            expect(loginResult!).toBe(false);
        });
    });

    // Logout

    describe('logout', () => {
        it('should call supabase signOut', async () => {
            mockGetSession.mockResolvedValue({
                data: { session: { user: { id: 'u1' } } },
            });

            const { result } = renderHook(() => useAuth(), { wrapper });

            await waitFor(() => {
                expect(result.current.isAuthenticated).toBe(true);
            });

            await act(async () => {
                await result.current.logout();
            });

            expect(mockSignOut).toHaveBeenCalled();
        });
    });

    // Outside Provider

    describe('outside provider', () => {
        it('should return a default guest state when used outside AuthProvider', async () => {
            const { result } = renderHook(() => useAuth());

            expect(result.current.isAuthenticated).toBe(false);
            expect(result.current.isLoading).toBe(false);

            const loginResult = await result.current.login('test@test.com', 'pass');
            expect(loginResult).toBe(false);
            await expect(result.current.logout()).resolves.not.toThrow();
        });
    });
});
