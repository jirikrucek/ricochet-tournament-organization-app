import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Maximize, Clock, Activity, X, Plus, Minus, Trophy } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react'; // Restored Library Component

import { useMatches } from '../hooks/useMatches';
import { usePlayers } from '../hooks/usePlayers';
import { useAuth } from '../hooks/useAuth.tsx';
import { useTournament } from '../contexts/TournamentContext';
import { getBestOf, compareMatchIds, checkMatchStatus } from '../utils/matchUtils';
import { updateBracketMatch } from '../utils/bracketLogic';
import { getCountryCode } from '../constants/countries';
import './Live.css';

// --- HELPERS ---

// Helper Component for Flag
const PlayerFlag = ({ countryCode }) => {
    if (!countryCode) return null;
    let code = countryCode.length > 2 ? (getCountryCode(countryCode) || countryCode) : countryCode;
    if (!code || code.length !== 2) return null;
    return (
        <img
            src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
            alt={countryCode}
            className="player-flag"
            onError={(e) => { e.target.style.display = 'none'; }}
        />
    );
};

// Full Name formatting as requested
const formatName = (p) => {
    if (!p) return 'TBD';
    // If full_name exists, try to use it, otherwise generic
    if (p.full_name) return p.full_name;
    if (p.firstName && p.lastName) return `${p.firstName} ${p.lastName}`;
    return 'Unknown Player';
};

const splitNameForDisplay = (fullName) => {
    // We want full name, but maybe split for styling if needed.
    // User requested "Wyświetlaj pełne dane: {player.firstName} {player.lastName}"
    // So we will just render the full string in the main view, but keep this helper if we need surname emphasis.
    if (!fullName) return { first: '', last: 'TBD' };
    const parts = fullName.trim().split(/\s+/);
    if (parts.length < 2) return { first: '', last: fullName };
    const last = parts.pop();
    const first = parts.join(' ');
    return { first, last };
};

const Live = () => {
    const { t } = useTranslation();
    const { isAuthenticated } = useAuth();
    const { matches, saveMatches } = useMatches();
    const { players } = usePlayers();
    const { activeTournamentId, isLoading: isTournamentLoading } = useTournament();

    const location = useLocation();
    const navigate = useNavigate();

    // TV Mode
    const isTvMode = new URLSearchParams(location.search).get('mode') === 'tv';
    const toggleTvMode = () => navigate(isTvMode ? '/live' : '/live?mode=tv');

    // Time
    const [currentTime, setCurrentTime] = useState(new Date());
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (date) => date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // --- QUEUE LOGIC (RESTORED) ---
    const { pinkQueue, cyanQueue, finishedMatches } = useMemo(() => {
        if (!matches || !matches.length) return { pinkQueue: [], cyanQueue: [], finishedMatches: [] };

        // 1. Enrich Matches with Player Objects
        const enriched = matches.map(m => ({
            ...m,
            player1: players.find(p => p.id === m.player1Id) || { full_name: 'TBD', id: null },
            player2: players.find(p => p.id === m.player2Id) || { full_name: 'TBD', id: null }
        }));

        // 2. Filter Active & Finished
        const finished = enriched.filter(m => m.winnerId);

        // Active: Live, Pending, Scheduled (excluding finished)
        // Sort Priority: LIVE > PENDING (by ID)
        const active = enriched.filter(m => {
            const s = (m.status || 'pending').toLowerCase();
            return !m.winnerId && ['live', 'pending', 'scheduled'].includes(s);
        }).sort((a, b) => {
            const sA = (a.status || '').toLowerCase();
            const sB = (b.status || '').toLowerCase();
            if (sA === 'live' && sB !== 'live') return -1;
            if (sA !== 'live' && sB === 'live') return 1;
            return compareMatchIds(a.id, b.id);
        });

        // 3. Assign to Courts (Alternating)
        const pink = [];
        const cyan = [];

        active.forEach((m, idx) => {
            // idx 0 -> Pink, idx 1 -> Cyan, idx 2 -> Pink...
            const court = idx % 2 === 0 ? 'courtPink' : 'courtCyan';
            const mWithCourt = { ...m, assignedCourt: court };
            if (court === 'courtPink') pink.push(mWithCourt);
            else cyan.push(mWithCourt);
        });

        // 4. Finished for Recent Results
        const recentFn = finished.map((m, i) => ({
            ...m,
            assignedCourt: i % 2 === 0 ? 'courtPink' : 'courtCyan' // Arbitrary assignment for visual dot
        })).reverse().slice(0, 5);

        return { pinkQueue: pink, cyanQueue: cyan, finishedMatches: recentFn };
    }, [matches, players]);

    // Helper to get Current Live + Upcoming list
    const getCourtState = (queue) => {
        const current = queue.length > 0 ? queue[0] : null; // First in queue is current
        const upcoming = queue.slice(1, 4); // Next 3
        return { current, upcoming };
    };

    const pinkState = getCourtState(pinkQueue);
    const cyanState = getCourtState(cyanQueue);

    // --- SCORE HANDLER ---
    const handleUpdate = (match, type, playerKey, change) => {
        if (!match || !isAuthenticated) return;

        console.log(`[JUDGE] Update Request: Match ${match.id} | ${type} | ${playerKey} | ${change}`);

        // Deep Clone to avoid ref mutation before save
        let score1 = match.score1 ?? 0;
        let score2 = match.score2 ?? 0;
        let microPoints = (match.microPoints || []).map(s => ({ ...s }));

        if (type === 'set') {
            if (playerKey === 'score1') score1 += change;
            if (playerKey === 'score2') score2 += change;
        } else if (type === 'point') {
            // Find active set or create one
            let targetSet;
            if (microPoints.length === 0) {
                targetSet = { set: 1, a: 0, b: 0 };
                microPoints.push(targetSet);
            } else {
                targetSet = microPoints[microPoints.length - 1]; // modify last set
            }

            const currentVal = targetSet[playerKey === 'a' ? 'a' : 'b'] || 0;
            const nextVal = Math.max(0, currentVal + change);

            if (playerKey === 'a') targetSet.a = nextVal;
            if (playerKey === 'b') targetSet.b = nextVal;
        }

        // Safety Clamp
        score1 = Math.max(0, score1);
        score2 = Math.max(0, score2);

        // Check Winner
        const bestOf = getBestOf(match.bracket);
        const winThreshold = Math.ceil(bestOf / 2);
        let status = 'live';
        let winnerId = null;

        if (score1 >= winThreshold) { status = 'finished'; winnerId = match.player1.id; }
        else if (score2 >= winThreshold) { status = 'finished'; winnerId = match.player2.id; }

        // Generate next state object
        const nextState = updateBracketMatch(
            matches,
            match.id,
            score1,
            score2,
            microPoints,
            players,
            winnerId,
            status
        );

        // SAVE via Context (which handles locking)
        saveMatches(nextState, match.id);
    };

    // --- RENDERERS ---

    const btnStyle = (color) => ({
        background: 'rgba(255,255,255,0.1)',
        border: `1px solid ${color || 'white'}`,
        color: color || 'white',
        borderRadius: '4px',
        width: '32px', height: '32px',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 4px',
        pointerEvents: 'auto', zIndex: 99999, position: 'relative' // Force clickable
    });

    const renderEmptyLive = (courtColor) => (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '250px', opacity: 0.5, fontStyle: 'italic', color: courtColor }}>
            {t('live.waitingForMatch') || "Waiting for match..."}
        </div>
    );

    const renderLiveMatch = (match, courtColor) => {
        if (!match) return renderEmptyLive(courtColor);

        const bestOf = getBestOf(match.bracket);
        const isStillPlaying = !match.winnerId;
        const currentSet = (match.microPoints || []).slice(-1)[0] || { a: 0, b: 0 };

        // Name Split
        const p1Name = splitNameForDisplay(formatName(match.player1));
        const p2Name = splitNameForDisplay(formatName(match.player2));

        return (
            <div style={{ position: 'relative', padding: '1rem' }}>
                {isStillPlaying && <div className="live-badge">LIVE</div>}

                <div style={{ textAlign: 'center', marginBottom: '1rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                    {(match.bracket || '').toUpperCase()} R{match.round} • BO{bestOf}
                </div>

                <div className="players-versus" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>

                    {/* LEFT PLAYER */}
                    <div style={{ flex: 1, textAlign: 'left' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: 700, lineHeight: 1.2 }}>
                            <PlayerFlag countryCode={match.player1.country} /> {p1Name.first} {p1Name.last}
                        </div>
                        {isStillPlaying && isAuthenticated && (
                            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '2rem', fontWeight: 800, color: courtColor, minWidth: '40px' }}>{currentSet.a}</span>
                                <button onClick={(e) => { e.stopPropagation(); console.log('P1 Point +'); handleUpdate(match, 'point', 'a', 1); }} style={btnStyle(courtColor)}><Plus size={18} style={{ pointerEvents: 'none' }} /></button>
                                <button onClick={(e) => { e.stopPropagation(); console.log('P1 Point -'); handleUpdate(match, 'point', 'a', -1); }} style={btnStyle(courtColor)}><Minus size={18} style={{ pointerEvents: 'none' }} /></button>
                            </div>
                        )}
                        {!isAuthenticated && isStillPlaying && (
                            <div style={{ marginTop: '0.5rem', fontSize: '2rem', fontWeight: 800, color: courtColor }}>{currentSet.a}</div>
                        )}
                    </div>

                    {/* SCORE CENTER */}
                    <div style={{ padding: '0 1rem', textAlign: 'center', minWidth: '120px' }}>
                        <div style={{ fontSize: '3.5rem', fontWeight: 800, color: courtColor, lineHeight: 1 }}>
                            {match.score1}:{match.score2}
                        </div>
                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.5 }}>SETS</div>

                        {/* Set Controls */}
                        {isAuthenticated && isStillPlaying && (
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '10px' }}>
                                <div style={{ display: 'flex', gap: '2px', flexDirection: 'column', alignItems: 'center' }}>
                                    <button onClick={(e) => { e.stopPropagation(); handleUpdate(match, 'set', 'score1', 1); }} style={{ ...btnStyle(courtColor), width: '24px', height: '24px' }}><Plus size={12} style={{ pointerEvents: 'none' }} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleUpdate(match, 'set', 'score1', -1); }} style={{ ...btnStyle(courtColor), width: '24px', height: '24px' }}><Minus size={12} style={{ pointerEvents: 'none' }} /></button>
                                </div>
                                <div style={{ display: 'flex', gap: '2px', flexDirection: 'column', alignItems: 'center' }}>
                                    <button onClick={(e) => { e.stopPropagation(); handleUpdate(match, 'set', 'score2', 1); }} style={{ ...btnStyle(courtColor), width: '24px', height: '24px' }}><Plus size={12} style={{ pointerEvents: 'none' }} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleUpdate(match, 'set', 'score2', -1); }} style={{ ...btnStyle(courtColor), width: '24px', height: '24px' }}><Minus size={12} style={{ pointerEvents: 'none' }} /></button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT PLAYER */}
                    <div style={{ flex: 1, textAlign: 'right' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: 700, lineHeight: 1.2 }}>
                            {p2Name.first} {p2Name.last} <PlayerFlag countryCode={match.player2.country} />
                        </div>
                        {isStillPlaying && isAuthenticated && (
                            <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                <button onClick={(e) => { e.stopPropagation(); console.log('P2 Point -'); handleUpdate(match, 'point', 'b', -1); }} style={btnStyle(courtColor)}><Minus size={18} style={{ pointerEvents: 'none' }} /></button>
                                <button onClick={(e) => { e.stopPropagation(); console.log('P2 Point +'); handleUpdate(match, 'point', 'b', 1); }} style={btnStyle(courtColor)}><Plus size={18} style={{ pointerEvents: 'none' }} /></button>
                                <span style={{ fontSize: '2rem', fontWeight: 800, color: courtColor, minWidth: '40px' }}>{currentSet.b}</span>
                            </div>
                        )}
                        {!isAuthenticated && isStillPlaying && (
                            <div style={{ marginTop: '0.5rem', fontSize: '2rem', fontWeight: 800, color: courtColor }}>{currentSet.b}</div>
                        )}
                    </div>
                </div>

                {/* SET HISTORY */}
                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {(match.microPoints || []).map((s, idx) => (
                        <div key={idx} style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', opacity: idx === (match.microPoints.length - 1) ? 1 : 0.6 }}>
                            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', opacity: 0.7 }}>SET {s.set}</div>
                            <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{s.a} - {s.b}</div>
                        </div>
                    ))}
                    {/* Add Set Button */}
                    {isAuthenticated && isStillPlaying && (match.microPoints?.length < bestOf) && (
                        <button onClick={(e) => {
                            e.stopPropagation();
                            const newMicro = [...(match.microPoints || [])];
                            newMicro.push({ set: newMicro.length + 1, a: 0, b: 0 });

                            // Save with new set
                            const nextState = updateBracketMatch(matches, match.id, match.score1, match.score2, newMicro, players, match.winnerId, match.status);
                            saveMatches(nextState, match.id);
                        }} style={{ ...btnStyle('rgba(255,255,255,0.3)'), width: 'auto', padding: '0 12px', fontSize: '0.8rem', height: '48px' }}>
                            <Plus size={14} style={{ marginRight: '4px' }} /> NEW SET
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const renderUpcomingList = (queue) => {
        if (!queue || queue.length === 0) return <div className="upcoming-item empty">{t('live.noUpcoming')}</div>;
        return queue.map(m => (
            <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px dashed rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <PlayerFlag countryCode={m.player1.country} /> <span>{formatName(m.player1)}</span>
                    <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>vs</span>
                    <span>{formatName(m.player2)}</span> <PlayerFlag countryCode={m.player2.country} />
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.5, fontFamily: 'monospace' }}>{(m.bracket || '').toUpperCase()} R{m.round}</div>
            </div>
        ));
    };

    return (
        <div className={`live-container ${isTvMode ? 'tv-mode' : ''}`}>

            {/* TV CONTROL */}
            <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 10000 }}>
                <button onClick={toggleTvMode} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', pointerEvents: 'auto' }}>
                    {isTvMode ? <X size={18} /> : <Maximize size={18} />} {isTvMode ? "Exit" : "TV Mode"}
                </button>
            </div>

            <header className="live-header">
                <div>
                    <h1 className="live-title">{t('live.title')}</h1>
                    <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>
                        ID: {activeTournamentId} • Loaded: {matches?.length || 0}
                    </div>
                </div>
                <div className="digital-clock">{formatTime(currentTime)}</div>
            </header>

            <div className="dashboard-grid">
                {/* LEFT: COURTS */}
                <div className="dashboard-column main-column">
                    <div className="courts-container">
                        {/* PINK COURT */}
                        <div className="court-card compact glass-panel" style={{ borderLeft: '4px solid var(--accent-pink)' }}>
                            <div className="court-header-slim">
                                <span style={{ color: 'var(--accent-pink)', fontWeight: 800 }}>PINK COURT</span>
                            </div>
                            {renderLiveMatch(pinkState.current, 'var(--accent-pink)')}
                        </div>

                        {/* CYAN COURT */}
                        <div className="court-card compact glass-panel" style={{ borderLeft: '4px solid var(--accent-cyan)' }}>
                            <div className="court-header-slim">
                                <span style={{ color: 'var(--accent-cyan)', fontWeight: 800 }}>CYAN COURT</span>
                            </div>
                            {renderLiveMatch(cyanState.current, 'var(--accent-cyan)')}
                        </div>
                    </div>

                    {/* RECENT RESULTS */}
                    <div className="glass-panel" style={{ marginTop: '2rem' }}>
                        <div className="panel-header"><Trophy size={16} style={{ marginRight: '8px' }} /> RECENT RESULTS</div>
                        <div style={{ padding: '0 1rem' }}>
                            {finishedMatches.length === 0 && <div className="empty-state">No results yet.</div>}
                            {finishedMatches.map(m => (
                                <div key={m.id} className="recent-item-clean">
                                    <div className="recent-meta" style={{ width: '120px' }}>
                                        <span className={`court-dot ${m.assignedCourt === 'courtPink' ? 'pink' : 'cyan'}`}></span>
                                        <span className="match-id">{(m.bracket || '').toUpperCase()} R{m.round}</span>
                                    </div>
                                    <div className="recent-players">
                                        <span className={m.winnerId === m.player1.id ? 'winner' : ''}>{formatName(m.player1)}</span>
                                        <span className="vs">vs</span>
                                        <span className={m.winnerId === m.player2.id ? 'winner' : ''}>{formatName(m.player2)}</span>
                                    </div>
                                    <div className="recent-score">{m.score1}:{m.score2}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT: SIDEBAR */}
                <div className="dashboard-column side-column">
                    <div className="upcoming-panel glass-panel">
                        <div className="panel-header"><Clock size={16} style={{ marginRight: '8px' }} /> UPCOMING</div>

                        <div className="upcoming-group">
                            <div className="group-label" style={{ color: 'var(--accent-pink)' }}>PINK QUEUE</div>
                            {renderUpcomingList(pinkState.upcoming)}
                        </div>
                        <div className="divider-line"></div>
                        <div className="upcoming-group">
                            <div className="group-label" style={{ color: 'var(--accent-cyan)' }}>CYAN QUEUE</div>
                            {renderUpcomingList(cyanState.upcoming)}
                        </div>
                    </div>
                </div>
            </div>

            {/* QR WIDGET (RESTORED) */}
            <div className="qr-widget">
                <div className="qr-box" style={{ background: 'white', padding: '5px' }}>
                    <QRCodeCanvas
                        value={`${window.location.origin}/live?mode=mobile`}
                        size={80}
                        bgColor={"#ffffff"}
                        fgColor={"#000000"}
                        level={"M"}
                        includeMargin={false}
                    />
                </div>
                <div className="qr-label">{t('live.scanForResults')}</div>
            </div>

        </div>
    );
};

export default Live;
