import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.tsx';
import { Lock, Mail } from 'lucide-react';

const Login = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    if (isAuthenticated) {
        return <Navigate to="/organizer" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const success = await login(email, password);

            if (success) {
                navigate('/organizer', { replace: true });
            } else {
                setError(t('login.error'));
            }
        } catch {
            setError(t('login.error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex-center" style={{ minHeight: '80vh', flexDirection: 'column' }}>
            <div className="card" style={{ padding: '2rem', width: '100%', maxWidth: '400px', borderTop: '4px solid var(--accent-pink)' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ marginBottom: '0.5rem' }}>{t('login.title')}</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>{t('login.subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {error && (
                        <div style={{ padding: '0.75rem', background: '#fee2e2', color: '#dc2626', borderRadius: '6px', fontSize: '0.9rem', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>{t('login.email')}</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-secondary)' }} />
                            <input
                                type="email"
                                className="form-input"
                                style={{ width: '100%', paddingLeft: '36px' }}
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder={t('login.emailPlaceholder')}
                                autoComplete="email"
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 500 }}>{t('login.password')}</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-secondary)' }} />
                            <input
                                type="password"
                                className="form-input"
                                style={{ width: '100%', paddingLeft: '36px' }}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder={t('login.passwordPlaceholder')}
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" style={{ marginTop: '1rem', width: '100%', padding: '0.75rem' }} disabled={isSubmitting}>
                        {isSubmitting ? t('common.loading') : t('login.signIn')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
