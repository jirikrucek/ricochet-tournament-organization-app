import React, { useMemo, useState } from 'react';
import { Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
// We assume parent imports Brackets.css or we import it here
import '../pages/Brackets.css';
import RacketBadge from './RacketBadge';
import { getRacketPathConfig, getZoneConfig } from '../utils/racketPathUtils';
import { getBracketBlueprint } from '../utils/bracketLogic';

const BracketCanvas = ({ matches, players, onMatchClick, readonly = false, visibleSections = ['wb', 'mid', 'lb'] }) => {
    const { t } = useTranslation();
    const [selectedMatchId, setSelectedMatchId] = useState(null);

    // Enrich matches for display
    const enrichedMatches = useMemo(() => {
        // If matches are not provided or empty, fallback to blueprint to show structure
        const baseMatches = (matches && matches.length > 0) ? matches : getBracketBlueprint();

        // Ensure linking logic is present (if missing from DB/props)
        // We rely on getBracketBlueprint() to have correct linking logic now.
        // However, if match objects come from DB, they might lack nextMatchId/consolationMatchId fields if those aren't stored.
        // We can re-apply the linking logic blueprint provides to the live objects.
        const blueprint = getBracketBlueprint();
        const blueprintMap = new Map();
        blueprint.forEach(m => blueprintMap.set(m.id, m));

        return baseMatches.map(m => {
            const p1 = players.find(p => p.id === m.player1Id);
            const p2 = players.find(p => p.id === m.player2Id);

            // Re-hydrate linking from blueprint if missing
            const bp = blueprintMap.get(m.id);
            const nextMatchId = m.nextMatchId || (bp ? bp.nextMatchId : null);
            const consolationMatchId = m.consolationMatchId || (bp ? bp.consolationMatchId : null);
            const sourceMatchId1 = m.sourceMatchId1 || (bp ? bp.sourceMatchId1 : null);
            const sourceType1 = m.sourceType1 || (bp ? bp.sourceType1 : null);
            const sourceMatchId2 = m.sourceMatchId2 || (bp ? bp.sourceMatchId2 : null);
            const sourceType2 = m.sourceType2 || (bp ? bp.sourceType2 : null);

            return {
                ...m,
                player1: p1 || null,
                player2: p2 || null,
                nextMatchId,
                consolationMatchId,
                sourceMatchId1, sourceType1,
                sourceMatchId2, sourceType2
            };
        });
    }, [matches, players]);

    // Path Highlighting Logic
    const highlightSet = useMemo(() => {
        if (!selectedMatchId) return null;
        const set = new Set();
        const queue = [selectedMatchId];

        // Dictionary for fast lookup
        const mDict = {};
        enrichedMatches.forEach(m => mDict[m.id] = m);

        while (queue.length > 0) {
            const currentId = queue.pop();
            if (set.has(currentId)) continue;
            set.add(currentId);

            const m = mDict[currentId];
            if (m) {
                if (m.nextMatchId) queue.push(m.nextMatchId);
                if (m.consolationMatchId) queue.push(m.consolationMatchId);
            }
        }
        return set;
    }, [selectedMatchId, enrichedMatches]);

    // Helper to extract match number for sorting
    const getMatchNumber = (id) => {
        const parts = id.split('-m');
        return parts.length > 1 ? parseInt(parts[1], 10) : 0;
    };
    const byMatchId = (a, b) => getMatchNumber(a.id) - getMatchNumber(b.id);

    // Filter Matches
    const wbMatches = enrichedMatches.filter(m => m.bracket === 'wb');
    const lbMatches = enrichedMatches.filter(m => m.bracket === 'lb');
    const gfMatches = enrichedMatches.filter(m => m.bracket === 'gf').sort(byMatchId);

    const wbRounds = [1, 2, 3, 4, 5].map(r => wbMatches.filter(m => m.round === r).sort(byMatchId));
    const lbRounds = [1, 2, 3, 4, 5, 6, 7, 8].map(r => lbMatches.filter(m => m.round === r).sort(byMatchId));

    const renderMatch = (match) => {
        const p1 = match.player1;
        const p2 = match.player2;
        const isWinner1 = match.winnerId && match.winnerId === p1?.id;
        const isWinner2 = match.winnerId && match.winnerId === p2?.id;

        const isClickable = !readonly && onMatchClick && !match.player1?.isBye && !match.player2?.isBye;
        const style = isClickable ? { cursor: 'pointer' } : { cursor: 'default' };

        // Toggle Highlight or Edit
        const handleMatchInteraction = (e) => {
            e.stopPropagation();
            if (isClickable) {
                // If clickable (admin edit), prioritize edit. 
                // But user wants "Click to highlight". Maybe highlight on hover?
                // Or: Admin -> Click to edit. Viewer -> Click to highlight.
                // Request says: "Po kliknięciu w mecz... system ma podświetlić".
                // If I am admin, I might want to see path too.
                // Let's do: Highlight always happens. If isClickable, we ALSO trigger onMatchClick.
                setSelectedMatchId(prev => (prev === match.id ? null : match.id));
                onMatchClick(match);
            } else {
                setSelectedMatchId(prev => (prev === match.id ? null : match.id));
            }
        };

        const isHighlighted = highlightSet ? highlightSet.has(match.id) : true;

        const wrapperStyle = {
            ...style,
            opacity: isHighlighted ? 1 : 0.3,
            transition: 'opacity 0.2s ease',
            boxShadow: (selectedMatchId === match.id) ? '0 0 0 2px var(--primary)' : 'none',
            // enhance visibility if highlighted
            filter: isHighlighted && highlightSet ? 'brightness(1.05)' : 'none'
        };

        // Zone Info
        const zone = getZoneConfig(match.bracket, match.round);
        let pathContext = '';
        if (match.nextMatchId) pathContext += `\nWin -> ${match.nextMatchId}`;
        if (match.consolationMatchId) pathContext += `\nLoss -> ${match.consolationMatchId}`;
        const zoneTooltip = zone ? `\n[${zone.label}]\n🏆 Win: Advances\n💀 Loss: ${zone.places} Place` : '';
        const title = (match.id + " " + (isClickable ? t('brackets.clickToEdit') : '')) + zoneTooltip + pathContext;

        const totalScore = (match.score1 || 0) + (match.score2 || 0);
        const showScore = match.status === 'finished' || (match.status === 'live' && totalScore > 0);

        // Source Labels for TBD
        const getSourceLabel = (srcId, type) => {
            if (!srcId) return null; // No label if no source
            // Shorten: wb-r1-m1 -> W-M1
            const parts = srcId.split('-');
            if (parts.length < 3) return type === 'winner' ? '(W)' : '(L)';
            const matchNum = parts[2].replace('m', '');
            // Maybe include Round? r1? No space.
            // Just W-M1 is good enough as per request.
            const prefix = type === 'winner' ? 'W' : 'L';
            return <span className="source-label" style={{ fontSize: '0.65em', color: 'var(--text-tertiary)', marginLeft: '6px', fontWeight: 'normal', opacity: 0.8 }}>[{prefix}-{matchNum}]</span>;
        };

        // --- Racket Path Logic ---
        const renderRacketPath = (m) => {
            const mNum = getMatchNumber(m.id);
            const config = getRacketPathConfig(m.id, m.bracket, m.round, mNum);
            if (!config) return null;

            if (config.type === 'source') {
                return <RacketBadge colorKey={config.colorKey} text={config.text} isDual={config.isDual} />;
            }
            if (config.type === 'destination') {
                const hasBothPlayers = m.player1 && m.player2;
                if (!hasBothPlayers) {
                    return (
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px', width: '100%' }}>
                            <RacketBadge colorKey={config.colorKey} text={config.text} isDual={config.isDual} />
                        </div>
                    );
                }
            }
            return null;
        };

        const racketBadgeSource = getRacketPathConfig(match.id, match.bracket, match.round, getMatchNumber(match.id))?.type === 'source' ? renderRacketPath(match) : null;
        const racketBadgeDest = getRacketPathConfig(match.id, match.bracket, match.round, getMatchNumber(match.id))?.type === 'destination' ? renderRacketPath(match) : null;

        return (
            <div
                key={match.id}
                className="match-block"
                onClick={handleMatchInteraction}
                title={title}
                style={wrapperStyle}
            >
                <div className="match-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{match.id.toUpperCase().replace('WB-', '').replace('LB-', '').replace('GF-', t('brackets.finalBadge') + ' ')}</span>
                    {racketBadgeSource}
                </div>

                {racketBadgeDest}

                <div className={`match-player ${isWinner1 ? 'winner' : ''}`}>
                    <span className={`player-name ${!p1 ? 'placeholder' : ''}`}>
                        {p1 ? p1.full_name : (<span>TBD {getSourceLabel(match.sourceMatchId1, match.sourceType1)}</span>)}
                    </span>
                    <span className="player-score">{showScore ? (match.score1 ?? 0) : '-'}</span>
                </div>
                <div className={`match-player ${isWinner2 ? 'winner' : ''}`}>
                    <span className={`player-name ${!p2 ? 'placeholder' : ''}`}>
                        {p2 ? p2.full_name : (<span>TBD {getSourceLabel(match.sourceMatchId2, match.sourceType2)}</span>)}
                    </span>
                    <span className="player-score">{showScore ? (match.score2 ?? 0) : '-'}</span>
                </div>
            </div>
        );
    };

    // Monrad Groups Configuration (using new prefixes to capture sub-brackets)
    const monradGroups = [
        {
            id: 'p25_group',
            prefixes: ['p25', 'p27', 'p29', 'p31'],
            title: 'Places 25-32',
            headers: ['QF 25-32', 'SF 25-28 / 29-32', 'Finals (25-32)']
        },
        {
            id: 'p17_group',
            prefixes: ['p17', 'p19', 'p21', 'p23'],
            title: 'Places 17-24',
            headers: ['QF 17-24', 'SF 17-20 / 21-24', 'Finals (17-24)']
        },
        {
            id: 'p13_group',
            prefixes: ['p13', 'p15'],
            title: 'Places 13-16',
            headers: ['SF 13-16', 'Finals (13-16)']
        },
        {
            id: 'p9_group',
            prefixes: ['p9', 'p11'],
            title: 'Places 9-12',
            headers: ['SF 9-12', 'Finals (9-12)']
        }
    ];

    return (
        <div className="bracket-canvas" onClick={() => setSelectedMatchId(null)}>
            {/* Section A: Winners Bracket */}
            {visibleSections.includes('wb') && (
                <div className="bracket-section section-wb">
                    <div className="section-title wb-title">{t('brackets.wb')}</div>
                    <div className="bracket-rounds-container">
                        {wbRounds.map((roundMatches, i) => (
                            <div key={`wb-r${i}`} className="round-column">
                                <div className="round-header">{t('brackets.round')} {i + 1}</div>
                                {roundMatches.map(renderMatch)}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Section B: Finals / Mid */}
            {visibleSections.includes('mid') && (
                <div className="bracket-section section-mid">
                    <div className="section-title mid-title">{t('brackets.finals')}</div>
                    <div className="round-column" style={{ justifyContent: 'center' }}>
                        {gfMatches.map(renderMatch)}
                        <div style={{ textAlign: 'center', marginTop: '2rem', opacity: 0.5 }}>
                            <Trophy size={48} color="gold" />
                        </div>
                    </div>
                </div>
            )}

            {/* Section C: Losers Bracket */}
            {visibleSections.includes('lb') && (
                <div className="bracket-section section-lb">
                    <div className="section-title lb-title">{t('brackets.lb')}</div>
                    <div className="bracket-rounds-container">
                        {lbRounds.map((roundMatches, i) => {
                            const zone = getZoneConfig('lb', i + 1);
                            const wrapperStyle = zone ? {
                                border: `1px dashed ${zone.color}60`,
                                background: `linear-gradient(to bottom, ${zone.color}08, transparent)`,
                                borderRadius: '12px',
                                padding: '10px',
                                position: 'relative',
                                margin: '0 4px',
                                minWidth: '220px'
                            } : {};

                            return (
                                <div key={`lb-r${i}`} className="round-column" style={wrapperStyle}>
                                    {zone && (
                                        <div style={{
                                            position: 'absolute', top: '-12px', right: '10px',
                                            fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase',
                                            color: zone.color, background: 'var(--bg-card)',
                                            padding: '2px 8px', border: `1px solid ${zone.color}`, borderRadius: '20px',
                                            zIndex: 5, whiteSpace: 'nowrap',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }}>
                                            {zone.label}
                                        </div>
                                    )}
                                    <div className="round-header" style={{ marginBottom: zone ? '1rem' : '0.5rem' }}>
                                        LB {t('brackets.round')} {i + 1}
                                    </div>
                                    {roundMatches.map(renderMatch)}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Section D: Placement (Monrad) */}
            {(visibleSections.includes('lb') || visibleSections.includes('all')) && (
                <div className="bracket-section section-placement" style={{ borderLeft: '1px dashed var(--border-color)', background: 'rgba(0,0,0,0.02)' }}>
                    <div className="section-title mid-title">PLACEMENT (MONRAD)</div>
                    <div className="bracket-rounds-container" style={{ gap: '3rem' }}>

                        {/* Dynamic Monrad Groups */}
                        {monradGroups.map(group => {
                            // Filter matches matching ANY prefix
                            let groupMatches = enrichedMatches.filter(m => group.prefixes.some(pre => m.bracket.startsWith(pre)));

                            // Fallback to blueprint if empty
                            if (groupMatches.length === 0) {
                                groupMatches = getBracketBlueprint()
                                    .filter(m => group.prefixes.some(pre => m.bracket.startsWith(pre)))
                                    .map(m => ({
                                        ...m,
                                        player1: null,
                                        player2: null,
                                        nextMatchId: m.nextMatchId, // Ensure blueprint linking is preserved
                                        consolationMatchId: m.consolationMatchId,
                                        sourceMatchId1: m.sourceMatchId1, sourceType1: m.sourceType1,
                                        sourceMatchId2: m.sourceMatchId2, sourceType2: m.sourceType2,
                                        status: 'scheduled'
                                    }));
                            }
                            groupMatches.sort((a, b) => a.round - b.round || byMatchId(a, b));

                            // Group by round
                            const rounds = [];
                            groupMatches.forEach(m => {
                                if (!rounds[m.round]) rounds[m.round] = [];
                                rounds[m.round].push(m);
                            });

                            return (
                                <div key={group.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: '8px' }}>
                                    <div style={{ fontWeight: 800, textAlign: 'center', color: 'var(--text-secondary)' }}>{group.title}</div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        {rounds.map((rMatches, idx) => rMatches && (
                                            <div key={idx} className="round-column" style={{ minWidth: '180px', gap: '1rem' }}>
                                                <div className="round-header">{group.headers[idx - 1] || `Round ${idx}`}</div>
                                                {rMatches.map(renderMatch)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Singles (5-6, 7-8) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', justifyContent: 'center' }}>
                            {['p7', 'p5'].map(bid => {
                                let m = enrichedMatches.find(x => x.bracket === bid);
                                if (!m) {
                                    // Fallback
                                    const bp = getBracketBlueprint().find(x => x.bracket === bid);
                                    if (bp) m = {
                                        ...bp,
                                        player1: null,
                                        player2: null,
                                        nextMatchId: bp.nextMatchId,
                                        consolationMatchId: bp.consolationMatchId,
                                        sourceMatchId1: bp.sourceMatchId1, sourceType1: bp.sourceType1,
                                        sourceMatchId2: bp.sourceMatchId2, sourceType2: bp.sourceType2,
                                        status: 'scheduled'
                                    };
                                }

                                return m ? (
                                    <div key={bid} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div className="round-header">{bid === 'p5' ? '5th Place' : '7th Place'}</div>
                                        {renderMatch(m)}
                                    </div>
                                ) : null;
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BracketCanvas;
