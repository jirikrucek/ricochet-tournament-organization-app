import React, { useMemo } from 'react';
import { Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
// Dependencies
import '../pages/Brackets.css';
import RacketBadge from './RacketBadge';
import { getRacketPathConfig, getZoneConfig } from '../utils/racketPathUtils';
import { getBracketBlueprint } from '../utils/bracketLogic';

const BracketCanvas = ({ matches, players, onMatchClick, readonly = false, visibleSections = ['wb', 'mid', 'lb'] }) => {
    const { t } = useTranslation();

    // --- 1. Data Preparation ---
    const enrichedMatches = useMemo(() => {
        const baseMatches = (matches && matches.length > 0) ? matches : getBracketBlueprint();
        // Fallback or real data
        return baseMatches.map(m => {
            const p1 = players.find(p => p.id === m.player1Id);
            const p2 = players.find(p => p.id === m.player2Id);
            return { ...m, player1: p1 || null, player2: p2 || null };
        });
    }, [matches, players]);

    const getMatchNumber = (id) => {
        const parts = id.split('-m');
        return parts.length > 1 ? parseInt(parts[1], 10) : 0;
    };
    const byMatchId = (a, b) => getMatchNumber(a.id) - getMatchNumber(b.id);

    // Filter Sections
    const wbMatches = enrichedMatches.filter(m => m.bracket === 'wb');
    const lbMatches = enrichedMatches.filter(m => m.bracket === 'lb');
    const gfMatches = enrichedMatches.filter(m => m.bracket === 'gf').sort(byMatchId);

    // Group by Rounds
    const wbRounds = [1, 2, 3, 4, 5].map(r => wbMatches.filter(m => m.round === r).sort(byMatchId));
    const lbRounds = [1, 2, 3, 4, 5, 6, 7, 8].map(r => lbMatches.filter(m => m.round === r).sort(byMatchId));

    // --- 2. Render Match Card (Glassmorphism) ---
    const renderMatch = (match, customHeader = null) => {
        const p1 = match.player1;
        const p2 = match.player2;
        const isWinner1 = match.winnerId && match.winnerId === p1?.id;
        const isWinner2 = match.winnerId && match.winnerId === p2?.id;
        const isClickable = !readonly && onMatchClick && !match.player1?.isBye && !match.player2?.isBye;

        const totalScore = (match.score1 || 0) + (match.score2 || 0);
        const showScore = match.status === 'finished' || (match.status === 'live' && totalScore > 0);

        // Racket Path Logic
        const mNum = getMatchNumber(match.id);
        const pathCfg = getRacketPathConfig(match.id, match.bracket, match.round, mNum);

        let racketSource = null;
        let racketDest = null;

        if (pathCfg) {
            if (pathCfg.type === 'source') {
                racketSource = <RacketBadge colorKey={pathCfg.colorKey} text={pathCfg.text} isDual={pathCfg.isDual} />;
            } else if (pathCfg.type === 'destination' && (!p1 || !p2)) {
                racketDest = (
                    <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                        <RacketBadge colorKey={pathCfg.colorKey} text={pathCfg.text} isDual={pathCfg.isDual} />
                    </div>
                );
            }
        }

        const matchIdLabel = match.id.toUpperCase()
            .replace('WB-', 'WB ')
            .replace('LB-', 'LB ')
            .replace('GF-', 'FINAL ')
            .replace('-M', '#');

        return (
            <div
                key={match.id}
                onClick={isClickable ? () => onMatchClick(match) : undefined}
                style={{
                    position: 'relative',
                    width: '240px',
                    background: 'rgba(30, 32, 44, 0.85)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                    cursor: isClickable ? 'pointer' : 'default',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'visible',
                    transition: 'all 0.2s ease',
                    color: 'white'
                }}
                className="glass-match-card"
                title={customHeader || match.bracket}
            >
                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 12px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontWeight: 700,
                    letterSpacing: '0.05em'
                }}>
                    <span>{customHeader || matchIdLabel}</span>
                    {racketSource}
                </div>

                {racketDest}

                {/* Players */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {/* Player 1 */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '8px 12px',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        background: isWinner1 ? 'rgba(34, 197, 94, 0.2)' : 'transparent'
                    }}>
                        <span style={{
                            fontSize: '0.9rem',
                            fontWeight: isWinner1 ? 700 : 500,
                            color: p1 ? (isWinner1 ? '#4ade80' : '#e5e7eb') : 'rgba(255,255,255,0.3)',
                            fontStyle: p1 ? 'normal' : 'italic'
                        }}>
                            {p1 ? p1.full_name : 'TBD'}
                        </span>
                        <span style={{ fontWeight: 700, color: isWinner1 ? '#4ade80' : 'white' }}>
                            {showScore ? (match.score1 ?? 0) : '-'}
                        </span>
                    </div>

                    {/* Player 2 */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '8px 12px',
                        background: isWinner2 ? 'rgba(34, 197, 94, 0.2)' : 'transparent'
                    }}>
                        <span style={{
                            fontSize: '0.9rem',
                            fontWeight: isWinner2 ? 700 : 500,
                            color: p2 ? (isWinner2 ? '#4ade80' : '#e5e7eb') : 'rgba(255,255,255,0.3)',
                            fontStyle: p2 ? 'normal' : 'italic'
                        }}>
                            {p2 ? p2.full_name : 'TBD'}
                        </span>
                        <span style={{ fontWeight: 700, color: isWinner2 ? '#4ade80' : 'white' }}>
                            {showScore ? (match.score2 ?? 0) : '-'}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    // --- 3. Layout Rendering ---

    return (
        <div className="bracket-canvas" style={{
            display: 'flex', flexDirection: 'column', gap: '80px',
            padding: '40px', minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #172554 100%)' // Deep Blue Background
        }}>

            {/* UPPER SECTION: MAIN BRACKETS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>

                {/* WB & Finals */}
                {visibleSections.includes('wb') && (
                    <div style={{ position: 'relative' }}>
                        <div className="section-title" style={{ color: '#f472b6', textAlign: 'left', marginLeft: '20px' }}>
                            WINNERS BRACKET
                        </div>
                        <div style={{ display: 'flex', gap: '60px', alignItems: 'center', overflowX: 'auto', paddingBottom: '20px' }}>
                            {wbRounds.map((roundMatches, i) => (
                                <div key={`wb-r${i}`} style={{ display: 'flex', flexDirection: 'column', gap: '30px', justifyContent: 'space-around' }}>
                                    {roundMatches.map(m => renderMatch(m))}
                                </div>
                            ))}

                            {/* Finals Attached to WB end */}
                            {visibleSections.includes('mid') && gfMatches.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', justifyContent: 'center', marginLeft: '40px' }}>
                                    <div className="section-title" style={{ color: '#fbbf24', fontSize: '1rem', marginBottom: '10px' }}>GRAND FINAL</div>
                                    {gfMatches.map(m => renderMatch(m, "CHAMPIONSHIP MATCH"))}
                                    <div style={{ alignSelf: 'center', opacity: 0.8 }}><Trophy size={64} color="#fbbf24" /></div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Losers Bracket */}
                {visibleSections.includes('lb') && (
                    <div style={{ position: 'relative' }}>
                        <div className="section-title" style={{ color: '#fb923c', textAlign: 'left', marginLeft: '20px' }}>
                            LOSERS BRACKET
                        </div>
                        <div style={{ display: 'flex', gap: '60px', alignItems: 'center', overflowX: 'auto', paddingBottom: '20px' }}>
                            {lbRounds.map((roundMatches, i) => (
                                <div key={`lb-r${i}`} style={{ display: 'flex', flexDirection: 'column', gap: '30px', justifyContent: 'space-around' }}>
                                    {roundMatches.map(m => renderMatch(m))}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* LOWER SECTION: MONRAD (PLACEMENT) */}
            {(visibleSections.includes('lb') || visibleSections.includes('all')) && (
                <div style={{
                    marginTop: '40px',
                    padding: '40px',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '24px',
                    border: '1px dashed rgba(255,255,255,0.1)'
                }}>
                    <div className="section-title" style={{ color: '#94a3b8', marginBottom: '40px' }}>
                        PLACEMENT MATCHES (MONRAD)
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'center' }}>

                        {/* Config for Monrad Columns */}
                        {[
                            { title: 'PLACES 25-32', id: '25-32', brackets: ['p25', 'p27', 'p29', 'p31'], color: '#ef4444' },
                            { title: 'PLACES 17-24', id: '17-24', brackets: ['p17', 'p19', 'p21', 'p23'], color: '#f97316' },
                            { title: 'PLACES 13-16', id: '13-16', brackets: ['p13', 'p15'], color: '#eab308' },
                            { title: 'PLACES 9-12', id: '9-12', brackets: ['p9', 'p11'], color: '#84cc16' }
                        ].map(group => {
                            // Collect matches
                            let groupMatches = enrichedMatches.filter(m => group.brackets.some(b => m.bracket.startsWith(b)));
                            // Fallback to blueprint
                            if (groupMatches.length === 0) {
                                groupMatches = getBracketBlueprint()
                                    .filter(m => group.brackets.some(b => m.bracket.startsWith(b)))
                                    .map(m => ({ ...m, player1: null, player2: null, status: 'scheduled' }));
                            }

                            if (groupMatches.length === 0) return null;

                            return (
                                <div key={group.id} style={{
                                    display: 'flex', flexDirection: 'column', gap: '20px',
                                    borderTop: `4px solid ${group.color}`,
                                    paddingTop: '20px',
                                    minWidth: '250px'
                                }}>
                                    <div style={{ color: group.color, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>{group.title}</div>
                                    {groupMatches.sort((a, b) => a.round - b.round || byMatchId(a, b)).map(m => renderMatch(m))}
                                </div>
                            );
                        })}

                        {/* Singular Places */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderTop: '4px solid #22c55e', paddingTop: '20px', minWidth: '250px' }}>
                            <div style={{ color: '#22c55e', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>7TH & 5TH PLACE</div>
                            {['p7', 'p5'].map(bid => {
                                let m = enrichedMatches.find(x => x.bracket === bid);
                                if (!m) {
                                    m = getBracketBlueprint().find(x => x.bracket === bid);
                                    if (m) m = { ...m, player1: null, player2: null };
                                }
                                return m ? renderMatch(m, bid === 'p5' ? '5TH PLACE' : '7TH PLACE') : null;
                            })}
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default BracketCanvas;
