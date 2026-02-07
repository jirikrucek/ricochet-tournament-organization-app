// Helper to get BO format based on bracket type
export const getBestOf = (bracketType) => {
    if (bracketType === 'wb' || bracketType === 'gf') return 5; // BO5
    return 3; // BO3
};

// Check if match is finished based on scores and BO format
export const isMatchFinished = (score1, score2, bestOf) => {
    const s1 = parseInt(score1) || 0;
    const s2 = parseInt(score2) || 0;
    const winThreshold = Math.ceil(bestOf / 2);
    return s1 >= winThreshold || s2 >= winThreshold;
};

// Returns TRUE if match is still running (Live), FALSE if finished
export const checkMatchStatus = (currentScore, format) => {
    const bestOf = format === 'BO5' ? 5 : 3;
    return !isMatchFinished(currentScore.score1, currentScore.score2, bestOf);
};

// Helper to determine status
export const getMatchStatus = (match) => {
    if (match.winner_id) return 'finished';
    const bestOf = getBestOf(match.bracket || (match.bracket_type === 'wb' ? 'wb' : 'lb'));
    if (isMatchFinished(match.score1, match.score2, bestOf)) return 'finished';

    if (match.score1 > 0 || match.score2 > 0) return 'live';
    if (match.player1 && match.player2) return 'pending';
    return 'scheduled';
};

export const canEditMatch = (match) => {
    return match.player1 && match.player2 && !match.player1.isBye && !match.player2.isBye;
};

// --- SAFE INTERLEAVED SORTING ---
export const compareMatchIds = (idA, idB) => {
    // 1. Parse IDs
    const parseId = (id) => {
        if (id === 'grand-final') return { bracket: 'gf', round: 100, number: 1 };
        if (id === 'consolation-final') return { bracket: 'cf', round: 100, number: 1 };
        if (id === 'lb-final') return { bracket: 'lb', round: 99, number: 1 };

        const matchStd = id.match(/^([a-z0-9]+)-r(\d+)-m(\d+)$/);
        if (matchStd) {
            return {
                bracket: matchStd[1],
                round: parseInt(matchStd[2], 10),
                number: parseInt(matchStd[3], 10)
            };
        }
        const matchFin = id.match(/^([a-z0-9]+)-f$/);
        if (matchFin) return { bracket: matchFin[1], round: 99, number: 1 };
        
        return { bracket: id, round: 999, number: 999 };
    };

    const A = parseId(idA);
    const B = parseId(idB);

    // 2. Bracket Priority
    const getBracketScore = (b) => {
        if (b === 'wb') return 10;
        if (b === 'lb') return 20;
        if (b === 'gf') return 100;
        if (b === 'cf') return 90;
        if (b.startsWith('p')) {
             const num = parseInt(b.slice(1), 10) || 50;
             return 30 + num; 
        }
        return 50; 
    };

    // 3. Virtual Phase (Map LB R1 to same level as WB R2 to mix them)
    let phaseA = A.round;
    let phaseB = B.round;
    
    // TRICK: Move LB R1 to "Round 2" so it sorts WITH WB R2
    if (A.bracket === 'lb' && A.round === 1) phaseA = 2;
    if (B.bracket === 'lb' && B.round === 1) phaseB = 2;
    // Same for later rounds if needed, e.g. WB R3 vs LB R3?
    
    if (phaseA !== phaseB) return phaseA - phaseB;

    // 4. Same Phase -> Sort by Match Number
    if (A.number !== B.number) return A.number - B.number;

    // 5. Same Number -> WB First
    return getBracketScore(A.bracket) - getBracketScore(B.bracket);
};
