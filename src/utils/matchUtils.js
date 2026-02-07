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

// --- NEW SORTING LOGIC ---
// Helper to assign a "Phase ID" to group comparable rounds from WB and LB together
const getPhaseId = (bracket, round) => {
    if (bracket === 'wb') {
        if (round === 1) return 10;
        if (round === 2) return 20; // Concurrent with LB R1
        if (round === 3) return 40; // Concurrent with LB R3
        if (round === 4) return 60; // Concurrent with LB R5
        if (round === 5) return 80; // WB Final
    }
    if (bracket === 'lb') {
        if (round === 1) return 20; // Phase 1: Matches dropped from WB R1 + WB R2 logic
        if (round === 2) return 30; // Between WB R2 and R3
        if (round === 3) return 40; // Concurrent with WB R3
        if (round === 4) return 50;
        if (round === 5) return 60; // Concurrent with WB R4
        if (round === 6) return 70;
        if (round >= 90) return 80; // LB Final (Phase 80 matches WB Final)
    }
    if (bracket === 'cf') return 90;  // Consolation
    if (bracket === 'gf') return 100; // Grand Final
    
    // Placement matches (push to end or specific slots if needed)
    return 200; 
};

// Helper to sort matches by ID (Interleaved: Phase > MatchNum > Bracket)
export const compareMatchIds = (idA, idB) => {
    // 1. Parse IDs
    const parseId = (id) => {
        // Special Finals
        if (id === 'grand-final') return { bracket: 'gf', round: 100, number: 1 };
        if (id === 'consolation-final') return { bracket: 'cf', round: 100, number: 1 };
        if (id === 'lb-final') return { bracket: 'lb', round: 99, number: 1 };

        // Standard & Placement
        const matchStd = id.match(/^([a-z0-9]+)-r(\d+)-m(\d+)$/);
        if (matchStd) {
            return {
                bracket: matchStd[1],
                round: parseInt(matchStd[2], 10),
                number: parseInt(matchStd[3], 10)
            };
        }
        // Placement Final
        const matchFin = id.match(/^([a-z0-9]+)-f$/);
        if (matchFin) {
            return { bracket: matchFin[1], round: 99, number: 1 };
        }
        return { bracket: id, round: 999, number: 999 };
    };

    const A = parseId(idA);
    const B = parseId(idB);

    // 2. Compare Phase (This groups WB R2 with LB R1)
    const phaseA = getPhaseId(A.bracket, A.round);
    const phaseB = getPhaseId(B.bracket, B.round);
    if (phaseA !== phaseB) return phaseA - phaseB;

    // 3. Compare Match Number (Interleaves them! M1(WB), M1(LB), M2(WB)...)
    if (A.number !== B.number) return A.number - B.number;

    // 4. Tie-breaker: Bracket Priority (WB before LB if same match number)
    const getBracketWeight = (b) => (b === 'wb' ? 1 : 2);
    return getBracketWeight(A.bracket) - getBracketWeight(B.bracket);
};
