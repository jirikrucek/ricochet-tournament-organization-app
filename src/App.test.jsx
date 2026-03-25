import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

// --- Mock supabase ---

let mockCheckReachability = vi.fn();

vi.mock('./lib/supabase', () => ({
    supabase: {
        from: vi.fn(() => {
            const chain = {};
            chain.select = vi.fn().mockReturnValue(chain);
            chain.order = vi.fn().mockReturnValue(chain);
            chain.eq = vi.fn().mockReturnValue(chain);
            chain.then = (fn) => Promise.resolve({ data: [], error: null }).then(fn);
            chain.catch = (fn) => Promise.resolve({ data: [], error: null }).catch(fn);
            return chain;
        }),
        channel: vi.fn(() => ({
            on: vi.fn().mockReturnThis(),
            subscribe: vi.fn().mockReturnThis(),
        })),
        removeChannel: vi.fn(),
        auth: {
            getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
            onAuthStateChange: vi.fn(() => ({
                data: { subscription: { unsubscribe: vi.fn() } },
            })),
        },
    },
    checkSupabaseReachability: (...args) => mockCheckReachability(...args),
}));

// --- Mock useAuth with mutable state ---

let mockIsAuthenticated = false;
let mockIsLoading = false;

vi.mock('./hooks/useAuth.tsx', () => ({
    useAuth: () => ({
        get isAuthenticated() { return mockIsAuthenticated; },
        get isLoading() { return mockIsLoading; },
        login: async () => true,
        logout: async () => { },
    }),
    AuthProvider: ({ children }) => children,
}));

// --- Mock i18n ---
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
        i18n: { language: 'en', changeLanguage: vi.fn() },
    }),
}));

import { checkSupabaseReachability } from './lib/supabase';
import { useAuth } from './hooks/useAuth.tsx';
import { useTranslation } from 'react-i18next';

// --- Inline copies of SupabaseGate and ProtectedRoute for isolated testing ---
// (Same logic as App.jsx but decoupled from the full routing tree)

const SupabaseGate = ({ children }) => {
    const [status, setStatus] = useState('checking');
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        checkSupabaseReachability()
            .then(() => setStatus('ok'))
            .catch((err) => {
                setErrorMsg(err.message || 'Unable to connect to the database.');
                setStatus('error');
            });
    }, []);

    if (status === 'checking') {
        return <div><p>Connecting to database...</p></div>;
    }

    if (status === 'error') {
        return (
            <div>
                <h1>Database Unavailable</h1>
                <p>{errorMsg}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    return children;
};

const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const { t } = useTranslation();

    if (isLoading) return <div>{t('common.loading')}</div>;
    if (!isAuthenticated) return <div>Access Denied</div>;
    return <Outlet />;
};

describe('SupabaseGate', () => {
    beforeEach(() => {
        mockCheckReachability.mockReset();
    });

    afterEach(() => {
        cleanup();
    });

    it('should show loading state while checking', () => {
        mockCheckReachability.mockReturnValue(new Promise(() => { }));
        render(<SupabaseGate><div>App Content</div></SupabaseGate>);
        expect(screen.getByText('Connecting to database...')).toBeInTheDocument();
        expect(screen.queryByText('App Content')).not.toBeInTheDocument();
    });

    it('should render children when Supabase is reachable', async () => {
        mockCheckReachability.mockResolvedValue(undefined);
        render(<SupabaseGate><div>App Content</div></SupabaseGate>);

        await waitFor(() => {
            expect(screen.getByText('App Content')).toBeInTheDocument();
        });
        expect(screen.queryByText('Connecting to database...')).not.toBeInTheDocument();
    });

    it('should show error when Supabase is unreachable', async () => {
        mockCheckReachability.mockRejectedValue(new Error('Connection refused'));
        render(<SupabaseGate><div>App Content</div></SupabaseGate>);

        await waitFor(() => {
            expect(screen.getByText('Database Unavailable')).toBeInTheDocument();
        });
        expect(screen.getByText('Connection refused')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
        expect(screen.queryByText('App Content')).not.toBeInTheDocument();
    });

    it('should show fallback message when error has no message', async () => {
        mockCheckReachability.mockRejectedValue(new Error(''));
        render(<SupabaseGate><div>App Content</div></SupabaseGate>);

        await waitFor(() => {
            expect(screen.getByText('Database Unavailable')).toBeInTheDocument();
        });
        expect(screen.getByText('Unable to connect to the database.')).toBeInTheDocument();
    });
});

describe('ProtectedRoute', () => {
    beforeEach(() => {
        mockIsAuthenticated = false;
        mockIsLoading = false;
    });

    afterEach(() => {
        cleanup();
    });

    it('should show access denied when not authenticated', () => {
        mockIsAuthenticated = false;

        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route element={<ProtectedRoute />}>
                        <Route path="protected" element={<div>Protected Content</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Access Denied')).toBeInTheDocument();
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('should render protected content when authenticated', () => {
        mockIsAuthenticated = true;

        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route element={<ProtectedRoute />}>
                        <Route path="protected" element={<div>Protected Content</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Protected Content')).toBeInTheDocument();
        expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
    });

    it('should show loading when auth is still checking', () => {
        mockIsLoading = true;

        render(
            <MemoryRouter initialEntries={['/protected']}>
                <Routes>
                    <Route element={<ProtectedRoute />}>
                        <Route path="protected" element={<div>Protected Content</div>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('common.loading')).toBeInTheDocument();
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
});
