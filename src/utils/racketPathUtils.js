export const RACKET_COLORS = [
    '#fbbf24', // amber (Gold)
    '#a3e635', // lime
    '#06b6d4', // cyan
    '#f472b6', // pink
    '#f97316', // orange
    '#8b5cf6', // violet
    '#ef4444', // red
    '#10b981', // emerald
    '#ec4899', // pink-600
    '#84cc16', // lime-600
    '#3b82f6', // blue
    '#6366f1', // indigo
    '#14b8a6', // teal
    '#d946ef', // fuchsia
    '#facc15', // yellow
    '#f87171'  // red-400
];

/**
 * Deterministically generates a color for any match ID.
 */
export const getMatchColor = (matchId) => {
    if (!matchId) return '#6b7280';
    if (matchId.startsWith('wb')) return '#ec4899'; // Pink
    if (matchId.startsWith('lb')) return '#3b82f6'; // Blue
    if (matchId.startsWith('gf')) return '#fbbf24'; // Gold
    if (matchId.startsWith('p')) return '#a8a29e'; // Gray/Stone for placement

    // Fallback hash
    let hash = 0;
    for (let i = 0; i < matchId.length; i++) {
        hash = matchId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % RACKET_COLORS.length;
    return RACKET_COLORS[index];
};

/**
 * Returns the "Racket Path" configuration for a given match ID.
 * Use this for the Match Header Racket.
 */
export const getRacketPathConfig = (matchId) => {
    if (!matchId || typeof matchId !== 'string') return { showBadge: false, color: '#666', text: '?' };
    return {
        showBadge: true,
        color: getMatchColor(matchId),
        text: matchId.split('-m')[1] || '?',
    };
};

/**
 * Returns configuration for a TBD slot based on its source.
 */
export const getSourceRacketConfig = (sourceMatchId, type) => {
    if (!sourceMatchId) return null;
    return {
        color: getMatchColor(sourceMatchId),
        iconType: type // 'winner' or 'loser' (could use different icons if needed)
    };
};
