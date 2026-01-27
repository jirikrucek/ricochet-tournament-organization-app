import React, { useMemo, useRef, useLayoutEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../pages/Brackets.css';
import RacketBadge from './RacketBadge';
import { getRacketPathConfig } from '../utils/racketPathUtils';
import { getBracketBlueprint } from '../utils/bracketLogic';

// Helper for colors
const PATH_COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
const getMatchColor = (id, bracket, round, mNum) => {
    // Try to get from racket config first
    const cfg = getRacketPathConfig(id, bracket, round, mNum);
    if (cfg && cfg.colorKey) {
        // Map key to approx hex if needed, or use CSS var. 
        // For distinct lines, let's use fixed hexes mapped to COLOR_KEYS order
        const keys = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan'];
        const idx = keys.indexOf(cfg.colorKey);
        if (idx >= 0) return PATH_COLORS[idx];
    }
    // Fallback: cycle based on seed/hash
    const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return PATH_COLORS[hash % PATH_COLORS.length];
};

const BracketCanvas = ({ matches, players, onMatchClick, readonly = false, visibleSections = ['wb', 'mid', 'lb'] }) => {
    const { t } = useTranslation();
    const containerRef = useRef(null);
    const matchRefs = useRef({});
    const [paths, setPaths] = useState([]);

    // --- 1. Data Preparation ---
    const enrichedMatches = useMemo(() => {
        const baseMatches = (matches && matches.length > 0) ? matches : getBracketBlueprint();
        const blueprint = getBracketBlueprint();
        const blueprintMap = new Map();
        blueprint.forEach(m => blueprintMap.set(m.id, m));

        return baseMatches.map(m => {
            const bp = blueprintMap.get(m.id);
            return {
                ...m,
                player1: players.find(p => p.id === m.player1Id) || null,
                player2: players.find(p => p.id === m.player2Id) || null,
                nextMatchId: m.nextMatchId || (bp ? bp.nextMatchId : null),
                consolationMatchId: m.consolationMatchId || (bp ? bp.consolationMatchId : null)
            };
        });
    }, [matches, players]);

    const getMatchNumber = (id) => {
        const parts = id.split('-m');
        return parts.length > 1 ? parseInt(parts[1], 10) : 0;
    };
    const byMatchId = (a, b) => getMatchNumber(a.id) - getMatchNumber(b.id);

    // Grouping
    const wbMatches = enrichedMatches.filter(m => m.bracket === 'wb');
    const lbMatches = enrichedMatches.filter(m => m.bracket === 'lb');
    const gfMatches = enrichedMatches.filter(m => m.bracket === 'gf').sort(byMatchId);

    // Rounds
    const wbRounds = [1, 2, 3, 4, 5].map(r => wbMatches.filter(m => m.round === r).sort(byMatchId));
    const lbRounds = [1, 2, 3, 4, 5, 6, 7, 8].map(r => lbMatches.filter(m => m.round === r).sort(byMatchId));

    // Monrad Groups
    const monradConfig = [
        { id: '25-32', brackets: ['p25', 'p27', 'p29', 'p31'], title: 'Places 25-32', color: '#ef4444' },
        { id: '17-24', brackets: ['p17', 'p19', 'p21', 'p23'], title: 'Places 17-24', color: '#f97316' },
        { id: '13-16', brackets: ['p13', 'p15'], title: 'Places 13-16', color: '#eab308' },
        { id: '9-12', brackets: ['p9', 'p11'], title: 'Places 9-12', color: '#84cc16' }
    ];

    // --- 2. Path Calculation ---
    useLayoutEffect(() => {
        if (!containerRef.current) return;
        const newPaths = [];
        const containerRect = containerRef.current.getBoundingClientRect();
        const scrollLeft = containerRef.current.scrollLeft;
        const scrollTop = containerRef.current.scrollTop;

        enrichedMatches.forEach(m => {
            const srcEl = matchRefs.current[m.id];
            if (!srcEl) return;
            const srcRect = srcEl.getBoundingClientRect();

            // Start Point: Right Middle
            // Coordinates relative to container (accounting for scroll)
            const startX = srcRect.right - containerRect.left + scrollLeft;
            const startY = srcRect.top - containerRect.top + scrollTop + (srcRect.height / 2);

            const color = getMatchColor(m.id, m.bracket, m.round, getMatchNumber(m.id));

            // Winner Path
            if (m.nextMatchId) {
                const destEl = matchRefs.current[m.nextMatchId];
                if (destEl) {
                    const destRect = destEl.getBoundingClientRect();
                    const endX = destRect.left - containerRect.left + scrollLeft;
                    const endY = destRect.top - containerRect.top + scrollTop + (destRect.height / 2);

                    // Sigmoid Curve
                    const dist = endX - startX;
                    const cp1x = startX + dist * 0.5;
                    const cp2x = endX - dist * 0.5;

                    newPaths.push({
                        id: `${m.id}-win`,
                        d: `M ${startX} ${startY} C ${cp1x} ${startY}, ${cp2x} ${endY}, ${endX} ${endY}`,
                        color,
                        type: 'winner'
                    });
                }
            }

            // Loser Path (Consolation)
            if (m.consolationMatchId) {
                const destEl = matchRefs.current[m.consolationMatchId];
                if (destEl) {
                    const destRect = destEl.getBoundingClientRect();
                    const endX = destRect.left - containerRect.left + scrollLeft;
                    const endY = destRect.top - containerRect.top + scrollTop + (destRect.height / 2);

                    // Logic: Down then Right, or Dive
                    // Start from right, curve down/up significantly
                    const midX = (startX + endX) / 2;
                    // If going backwards (LB is left of current?), handle gracefully
                    // But assume horizontal flow -> destination is likely to the right or below-right.

                    // Simple Curve
                    const cp1x = startX + 20;
                    const cp1y = startY + (endY - startY) * 0.5;
                    const cp2x = endX - 20;

                    // If destination is purely below (vertical spacing mainly), adjust CP
                    // Let's use standard sigmoid with vertical bias
                    newPaths.push({
                        id: `${m.id}-loss`,
                        d: `M ${startX} ${startY} C ${startX + 50} ${startY}, ${endX - 50} ${endY}, ${endX} ${endY}`,
                        color,
                        type: 'loser',
                        dash: '4 4' // Dashed for loser? Or just solid as requested
                    });
                }
            }
        });
        setPaths(newPaths);
    }, [enrichedMatches, matches]); // Re-calc on data change or resize (resize not observed here but usually ok)


    // --- 3. Render Match Card ---
    const renderMatch = (match, customHeader = null, width = '240px') => {
        const p1 = match.player1;
        const p2 = match.player2;
        const isWinner1 = match.winnerId && match.winnerId === p1?.id;
        const isWinner2 = match.winnerId && match.winnerId === p2?.id;
        const isClickable = !readonly && onMatchClick && !match.player1?.isBye && !match.player2?.isBye;
        const showScore = match.status === 'finished' || (match.status === 'live' && (match.score1 > 0 || match.score2 > 0));

        // Racket Logic
        const mNum = getMatchNumber(match.id);
        const pathCfg = getRacketPathConfig(match.id, match.bracket, match.round, mNum);
        const racketSource = pathCfg?.type === 'source' ? <RacketBadge colorKey={pathCfg.colorKey} text={pathCfg.text} isDual={pathCfg.isDual} /> : null;

        const displayHeader = customHeader || match.bracket.toUpperCase() + ' ' + match.round + '-' + getMatchNumber(match.id);

        return (
            <div
                ref={el => matchRefs.current[match.id] = el}
                key={match.id}
                onClick={isClickable ? () => onMatchClick(match) : undefined}
                style={{
                    width,
                    flexShrink: 0,
                    background: 'rgba(30, 32, 44, 0.75)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                    cursor: isClickable ? 'pointer' : 'default',
                    display: 'flex', flexDirection: 'column',
                    position: 'relative',
                    zIndex: 10
                }}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>{displayHeader}</span>
                    {racketSource}
                </div>
                {/* Players */}
                <div style={{ padding: '8px 0' }}>
                    {[
                        { p: p1, s: match.score1, w: isWinner1 },
                        { p: p2, s: match.score2, w: isWinner2 }
                    ].map((row, idx) => (
                        <div key={idx} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '6px 12px',
                            background: row.w ? 'rgba(34, 197, 94, 0.15)' : 'transparent'
                        }}>
                            <span style={{ fontSize: '0.9rem', color: row.p ? (row.w ? '#86efac' : '#e5e7eb') : 'rgba(255,255,255,0.3)' }}>
                                {row.p ? row.p.full_name : 'TBD'}
                            </span>
                            <span style={{ fontWeight: 700, color: row.w ? '#86efac' : '#fff' }}>
                                {showScore ? (row.s ?? 0) : '-'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="bracket-scroll-container" style={{ width: '100%', height: '100%', overflowX: 'auto', background: '#0f172a', position: 'relative' }}>
            <div
                ref={containerRef}
                className="bracket-layout"
                style={{
                    display: 'flex',
                    flexDirection: 'row', // Horizontal Orientation
                    padding: '40px',
                    gap: '80px', // Spacing between Sections
                    minWidth: 'max-content',
                    position: 'relative'
                }}
            >
                {/* SVG Layer */}
                <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    {paths.map(p => (
                        <path
                            key={p.id}
                            d={p.d}
                            stroke={p.color}
                            strokeWidth="2"
                            fill="none"
                            opacity="0.5"
                            strokeDasharray={p.dash || 'none'}
                            filter="url(#glow)"
                        />
                    ))}
                </svg>

                {/* Section: Winners Bracket */}
                {visibleSections.includes('wb') && (
                    <div className="section-wb" style={{ display: 'flex', flexDirection: 'column' }}>
                        <h2 style={{ color: '#ec4899', fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem', textTransform: 'uppercase' }}>Winners Bracket</h2>
                        <div style={{ display: 'flex', gap: '60px' }}>
                            {wbRounds.map((roundMatches, i) => (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', gap: '30px' }}>
                                    {roundMatches.map(m => renderMatch(m))}
                                </div>
                            ))}
                            {visibleSections.includes('mid') && gfMatches.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '40px', marginLeft: '20px' }}>
                                    {gfMatches.map(m => renderMatch(m, "FINAL"))}
                                    <div style={{ alignSelf: 'center' }}><Trophy size={48} color="#fbbf24" /></div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Section: Losers Bracket */}
                {visibleSections.includes('lb') && (
                    <div className="section-lb" style={{ display: 'flex', flexDirection: 'column' }}>
                        <h2 style={{ color: '#f97316', fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem', textTransform: 'uppercase' }}>Losers Bracket</h2>
                        <div style={{ display: 'flex', gap: '60px' }}>
                            {lbRounds.map((roundMatches, i) => (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', gap: '30px' }}>
                                    {roundMatches.map(m => renderMatch(m))}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Section: Monrad */}
                {(visibleSections.includes('lb') || visibleSections.includes('all')) && (
                    <div className="section-monrad" style={{ display: 'flex', flexDirection: 'column' }}>
                        <h2 style={{ color: '#94a3b8', fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem', textTransform: 'uppercase' }}>Placement Matches</h2>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', maxWidth: '1200px' }}>
                            {monradConfig.map(group => {
                                let groupMatches = enrichedMatches.filter(m => group.brackets.some(b => m.bracket.startsWith(b)));
                                if (!groupMatches.length) {
                                    groupMatches = getBracketBlueprint()
                                        .filter(m => group.brackets.some(b => m.bracket.startsWith(b)))
                                        .map(m => ({ ...m, player1: null, player2: null }));
                                }
                                if (!groupMatches.length) return null;

                                const rounds = [];
                                groupMatches.forEach(m => { if (!rounds[m.round]) rounds[m.round] = []; rounds[m.round].push(m); });

                                return (
                                    <div key={group.id} style={{ display: 'flex', flexDirection: 'column', borderLeft: `4px solid ${group.color}`, paddingLeft: '20px', gap: '20px' }}>
                                        <div style={{ color: group.color, fontWeight: 700 }}>{group.title}</div>
                                        <div style={{ display: 'flex', gap: '30px' }}>
                                            {rounds.map((rMatches, i) => rMatches && (
                                                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                                    {rMatches.map(m => renderMatch(m, null, '200px'))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                            {/* Singles */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderLeft: '4px solid #22c55e', paddingLeft: '20px' }}>
                                <div style={{ color: '#22c55e', fontWeight: 700 }}>FINAL PLACEMENT</div>
                                {['p7', 'p5'].map(bid => {
                                    let m = enrichedMatches.find(x => x.bracket === bid);
                                    if (!m) m = { ...getBracketBlueprint().find(x => x.bracket === bid), player1: null, player2: null };
                                    return m ? renderMatch(m, bid === 'p5' ? '5TH' : '7TH', '200px') : null;
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BracketCanvas;
