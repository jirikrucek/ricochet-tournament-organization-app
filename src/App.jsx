import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import { Settings } from './pages/AllPages';
import Organizer from './pages/Organizer';
import Standings from './pages/Standings';
import Live from './pages/Live';
import Players from './pages/Players';
import Brackets from './pages/Brackets';
import Matches from './pages/Matches';

import Login from './pages/Login';

import TournamentSelect from './pages/TournamentSelect';
import { useAuth } from './hooks/useAuth.tsx';
import { useTranslation } from 'react-i18next';
import { checkSupabaseReachability } from './lib/supabase';

// Startup gate — blocks app until Supabase is confirmed reachable
const SupabaseGate = ({ children }) => {
  const [status, setStatus] = useState('checking'); // 'checking' | 'ok' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    checkSupabaseReachability()
      .then(() => setStatus('ok'))
      .catch((err) => {
        console.error('Supabase reachability check failed:', err);
        setErrorMsg(err.message || 'Unable to connect to the database.');
        setStatus('error');
      });
  }, []);

  if (status === 'checking') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
        <p>Connecting to database...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        height: '100vh', fontFamily: 'sans-serif', padding: '2rem', textAlign: 'center'
      }}>
        <h1 style={{ color: '#e74c3c', marginBottom: '1rem' }}>Database Unavailable</h1>
        <p style={{ maxWidth: '480px', lineHeight: 1.6 }}>
          The application requires a connection to Supabase but could not reach the database.
          Please verify your environment configuration and that the Supabase instance is running.
        </p>
        <pre style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#f8f8f8', borderRadius: '6px', fontSize: '0.85rem', color: '#666' }}>
          {errorMsg}
        </pre>
        <button
          onClick={() => window.location.reload()}
          style={{ marginTop: '1.5rem', padding: '0.5rem 1.5rem', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Retry
        </button>
      </div>
    );
  }

  return children;
};

// Protected Route Guard
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation();

  if (isLoading) return <div style={{ padding: '2rem' }}>{t('common.loading')}</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

import { MatchesProvider } from './contexts/MatchesContext';
import { TournamentProvider } from './contexts/TournamentContext';

function App() {
  return (
    <SupabaseGate>
      <TournamentProvider>
        <MatchesProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/live" replace />} />
            <Route path="/tournaments" element={<TournamentSelect />} />

            <Route element={<Layout />}>
              {/* Public View Routes (Read-Only for Guests, Edit for Admin) */}
              <Route path="live" element={<Live />} />
              <Route path="matches" element={<Matches />} />
              <Route path="brackets" element={<Brackets />} />
              <Route path="standings" element={<Standings />} />
              <Route path="players" element={<Players />} />

              {/* Protected Admin Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="organizer" element={<Organizer />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/live" replace />} />
          </Routes>
        </MatchesProvider>
      </TournamentProvider>
    </SupabaseGate>
  );
}

export default App;
