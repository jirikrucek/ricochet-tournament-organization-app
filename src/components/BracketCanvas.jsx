import React, { useMemo, useRef, useLayoutEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '../pages/Brackets.css';
import RacketBadge from './RacketBadge';
import { getRacketPathConfig } from '../utils/racketPathUtils';
import { getBracketBlueprint } from '../utils/bracketLogic';

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
        { id: '25-32', brackets: ['p25', 'p27', 'p29', 'p31'], title: 'Places 25-32' },
        { id: '17-24', brackets: ['p17', 'p19', 'p21', 'p23'], title: 'Places 17-24' },
        { id: '13-16', brackets: ['p13', 'p15'], title: 'Places 13-16' },
        { id: '9-12', brackets: ['p9', 'p11'], title: 'Places 9-12' }
    ];

    // --- 2. Path Calculation (Classic Lines) ---
    useLayoutEffect(() => {
        if (!containerRef.current) return;
        const newPaths = [];
        const containerRect = containerRef.current.getBoundingClientRect();
        const scrollLeft = containerRef.current.scrollLeft;
        const scrollTop = containerRef.current.scrollTop;

        // Force slight delay to ensure layout matches render
        // Actually useLayoutEffect should be fine

        enrichedMatches.forEach(m => {
            const srcEl = matchRefs.current[m.id];
            if (!srcEl) return;
            const srcRect = srcEl.getBoundingClientRect();

            // Start Point: Right Middle
            const startX = srcRect.right - containerRect.left + scrollLeft;
            const startY = srcRect.top - containerRect.top + scrollTop + (srcRect.height / 2);

            // Winner Line (Solid)
            if (m.nextMatchId) {
                const destEl = matchRefs.current[m.nextMatchId];
                if (destEl) {
                    const destRect = destEl.getBoundingClientRect();
                    const endX = destRect.left - containerRect.left + scrollLeft;
                    const endY = destRect.top - containerRect.top + scrollTop + (destRect.height / 2);

                    // Classic Bracket Shape: Horizontal -> Vertical -> Horizontal
                    const midX = (startX + endX) / 2;
                    newPaths.push({
                        id: `${m.id}-win`,
                        d: `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`,
                        type: 'solid'
                    });
                }
            }
            // Loser Line (Optional/Dashed - simple connection to next section)
            // For cluttered views, sometimes better to omit consolation lines or make them very subtle.
            // User asked for "Connect matches".
            if (m.consolationMatchId) {
                const destEl = matchRefs.current[m.consolationMatchId];
                if (destEl) {
                    const destRect = destEl.getBoundingClientRect();
                    const endX = destRect.left - containerRect.left + scrollLeft;
                    const endY = destRect.top - containerRect.top + scrollTop + (destRect.height / 2);

                    // Simple Direct or Bent Line
                    // Usually drops from bottom of card in trees, but we use Right Middle
                    // Let's use same logic but dotted
                    const midX = (startX + endX) / 2;
                    newPaths.push({
                        id: `${m.id}-loss`,
                        d: `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`,
                        type: 'dashed'
                    });
                }
            }
        });
        setPaths(newPaths);
    }, [enrichedMatches, matches, visibleSections]);


    // --- 3. Render Match Card ---
    const renderMatch = (match, customHeader = null) => {
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

        const displayHeader = customHeader || getMatchNumber(match.id); // Simple Number

        return (
            <div
                ref={el => matchRefs.current[match.id] = el}
                key={match.id}
                onClick={isClickable ? () => onMatchClick(match) : undefined}
                style={{
                    width: '180px', // Compact
                    flexShrink: 0,
                    background: 'rgba(20, 20, 30, 0.6)',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '4px', // Boxier
                    boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                    cursor: isClickable ? 'pointer' : 'default',
                    display: 'flex', flexDirection: 'column',
                    position: 'relative',
                    zIndex: 10,
                    fontSize: '0.8rem'
                }}
            >
                {/* Header: Just ID and Racket */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'bold' }}>#{displayHeader}</span>
                    {racketSource}
                </div>
                {/* Players */}
                <div style={{ padding: '0' }}>
                    {[
                        { p: p1, s: match.score1, w: isWinner1 },
                        { p: p2, s: match.score2, w: isWinner2 }
                    ].map((row, idx) => (
                        <div key={idx} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '4px 8px',
                            background: row.w ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                            borderBottom: idx === 0 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                        }}>
                            <span style={{
                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '130px',
                                color: row.p ? (row.w ? '#fff' : '#aaa') : '#555'
                            }}>
                                {row.p ? row.p.full_name : 'TBD'}
                            </span>
                            <span style={{ fontWeight: 700, color: row.w ? '#fff' : '#888', fontSize: '0.75rem' }}>
                                {showScore ? (row.s ?? 0) : ''}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="bracket-scroll-container" style={{ width: '100%', height: '100%', overflowX: 'auto', background: '#000', position: 'relative' }}>

            {/* SVG Layer for Lines */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '10000px', height: '10000px', pointerEvents: 'none', zIndex: 0 }}>
                {paths.map(p => (
                    <path
                        key={p.id}
                        d={p.d}
                        stroke="rgba(255,255,255,0.15)" // Subtle white lines
                        strokeWidth="1.5"
                        fill="none"
                        strokeDasharray={p.type === 'dashed' ? '4 4' : 'none'}
                    />
                ))}
            </svg>

            <div
                ref={containerRef}
                className="bracket-layout"
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    minWidth: 'max-content',
                    minHeight: '100vh'
                }}
            >
                {/* Section: Winners Bracket - Dark Purple/Pink */}
                {visibleSections.includes('wb') && (
                    <div className="section-wb" style={{
                        display: 'flex', flexDirection: 'column',
                        background: 'linear-gradient(to bottom, #2e1065, #4c0519)', // Deep Purple to Pinkish
                        padding: '40px',
                        borderRight: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <h2 style={{ color: 'rgba(255,255,255,0.3)', fontSize: '1.2rem', fontWeight: 900, marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '2px' }}>Winners Bracket</h2>
                        <div style={{ display: 'flex', gap: '40px' }}>
                            {wbRounds.map((roundMatches, i) => (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', gap: '20px' }}>
                                    {roundMatches.map(m => renderMatch(m))}
                                </div>
                            ))}
                            {visibleSections.includes('mid') && gfMatches.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px', marginLeft: '20px' }}>
                                    {gfMatches.map(m => renderMatch(m, "GF"))}
                                    <div style={{ alignSelf: 'center', opacity: 0.3 }}><Trophy size={32} color="#fff" /></div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Section: Losers Bracket - Dark Blue */}
                {visibleSections.includes('lb') && (
                    <div className="section-lb" style={{
                        display: 'flex', flexDirection: 'column',
                        background: 'linear-gradient(to bottom, #0f172a, #172554)', // Slate to Deep Blue
                        padding: '40px',
                        borderRight: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <h2 style={{ color: 'rgba(255,255,255,0.3)', fontSize: '1.2rem', fontWeight: 900, marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '2px' }}>Losers Bracket</h2>
                        <div style={{ display: 'flex', gap: '40px' }}>
                            {lbRounds.map((roundMatches, i) => (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', gap: '20px' }}>
                                    {roundMatches.map(m => renderMatch(m))}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Section: Monrad - Dark Earth/Orange */}
                {(visibleSections.includes('lb') || visibleSections.includes('all')) && (
                    <div className="section-monrad" style={{
                        display: 'flex', flexDirection: 'column',
                        background: 'linear-gradient(to bottom, #431407, #78350f)', // Deep Brown/Orange
                        padding: '40px'
                    }}>
                        <h2 style={{ color: 'rgba(255,255,255,0.3)', fontSize: '1.2rem', fontWeight: 900, marginBottom: '30px', textTransform: 'uppercase', letterSpacing: '2px' }}>Placement</h2>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', maxWidth: '1000px' }}>
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
                                    <div key={group.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: '0.8rem' }}>{group.title.toUpperCase()}</div>
                                        <div style={{ display: 'flex', gap: '20px' }}>
                                            {rounds.map((rMatches, i) => rMatches && (
                                                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                    {rMatches.map(m => renderMatch(m, null))}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                            {/* Singles */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: '0.8rem' }}>FINAL PLACEMENT</div>
                                {['p7', 'p5'].map(bid => {
                                    let m = enrichedMatches.find(x => x.bracket === bid);
                                    if (!m) m = { ...getBracketBlueprint().find(x => x.bracket === bid), player1: null, player2: null, score1: null, score2: null };
                                    return m ? renderMatch(m, bid === 'p5' ? '5TH' : '7TH') : null;
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
