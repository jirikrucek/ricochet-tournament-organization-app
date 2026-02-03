
// --------------------------------------------------------------------------
// CONFIGURATION & BLUEPRINT
// --------------------------------------------------------------------------

// 1. Seeding Order (Standard 32-player snake/standard spread)
const SEEDING_PAIRS = [
    [1, 32],   // wb-r1-m1
    [16, 17],  // wb-r1-m2
    [9, 24],   // wb-r1-m3
    [8, 25],   // wb-r1-m4
    [5, 28],   // wb-r1-m5
    [12, 21],  // wb-r1-m6
    [13, 20],  // wb-r1-m7
    [4, 29],   // wb-r1-m8
    [3, 30],   // wb-r1-m9
    [14, 19],  // wb-r1-m10
    [11, 22],  // wb-r1-m11
    [6, 27],   // wb-r1-m12
    [7, 26],   // wb-r1-m13
    [10, 23],  // wb-r1-m14
    [15, 18],  // wb-r1-m15
    [2, 31]    // wb-r1-m16
];

// Helper to generate match structure
const mkMatch = (id, bracket, round, extras = {}) => ({
    id, bracket, round,
    player1Id: null, player2Id: null,
    score1: null, score2: null,
    winnerId: null,
    status: 'scheduled',
    microPoints: [],
    ...extras
});

// STRICT BRAZILIAN MAPPING LOGIC (v15)
// Definitive source of truth for drops
const getTargetDropId = (sourceId) => {
    // Parse ID: e.g. wb-r1-m1
    const parts = sourceId.split('-');
    if (parts.length < 3 || parts[0] !== 'wb') return null;

    const r = parseInt(parts[1].replace('r', ''), 10);
    const m = parseInt(parts[2].replace('m', ''), 10);

    // MAPPING RULES

    // 1. WB R1 -> LB R1 (Neighbor)
    // m1, m2 -> lb-r1-m1 ... m15, m16 -> lb-r1-m8
    if (r === 1) {
        return `lb-r1-m${Math.ceil(m / 2)}`;
    }

    // 2. WB R2 -> LB R2 (DIAGONAL DROP - KLUCZOWE)
    // Formula: 9 - m
    if (r === 2) {
        return `lb-r2-m${9 - m}`;
    }

    // 3. WB R3 -> LB R4 (CROSS)
    // Pairs: 1<->2, 3<->4
    if (r === 3) {
        if (m === 1) return 'lb-r4-m2';
        if (m === 2) return 'lb-r4-m1';
        if (m === 3) return 'lb-r4-m4';
        if (m === 4) return 'lb-r4-m3';
    }

    // 4. WB R4 -> LB R6 (CROSS)
    // Pairs: 1<->2
    if (r === 4) {
        if (m === 1) return 'lb-r6-m2';
        if (m === 2) return 'lb-r6-m1';
    }

    // WB R5 (Final) -> Usually drops to LB Final, but User requested strict connection to Grand Final directly.
    return null;
};

export const getBracketBlueprint = () => {
    const matches = [];

    // --- WINNERS BRACKET (WB) ---
    // R1 (16 matches)
    for (let i = 1; i <= 16; i++) {
        const id = `wb-r1-m${i}`;
        matches.push(mkMatch(id, 'wb', 1, {
            nextMatchId: `wb-r2-m${Math.ceil(i / 2)}`,
            loserMatchId: getTargetDropId(id)
        }));
    }
    // R2 (8 matches)
    for (let i = 1; i <= 8; i++) {
        const id = `wb-r2-m${i}`;
        matches.push(mkMatch(id, 'wb', 2, {
            sourceMatchId1: `wb-r1-m${i * 2 - 1}`, sourceType1: 'winner',
            sourceMatchId2: `wb-r1-m${i * 2}`, sourceType2: 'winner',
            nextMatchId: `wb-r3-m${Math.ceil(i / 2)}`,
            loserMatchId: getTargetDropId(id)
        }));
    }
    // R3 (4 matches) - Quarterfinals
    for (let i = 1; i <= 4; i++) {
        const id = `wb-r3-m${i}`;
        matches.push(mkMatch(id, 'wb', 3, {
            sourceMatchId1: `wb-r2-m${i * 2 - 1}`, sourceType1: 'winner',
            sourceMatchId2: `wb-r2-m${i * 2}`, sourceType2: 'winner',
            nextMatchId: `wb-r4-m${Math.ceil(i / 2)}`,
            loserMatchId: getTargetDropId(id)
        }));
    }
    // R4 (2 matches) - Semifinals
    for (let i = 1; i <= 2; i++) {
        const id = `wb-r4-m${i}`;
        matches.push(mkMatch(id, 'wb', 4, {
            sourceMatchId1: `wb-r3-m${i * 2 - 1}`, sourceType1: 'winner',
            sourceMatchId2: `wb-r3-m${i * 2}`, sourceType2: 'winner',
            nextMatchId: `wb-r5-m1`,
            loserMatchId: getTargetDropId(id)
        }));
    }
    // R5 (1 match) - WB Final
    matches.push(mkMatch(`wb-r5-m1`, 'wb', 5, {
        sourceMatchId1: `wb-r4-m1`, sourceType1: 'winner',
        sourceMatchId2: `wb-r4-m2`, sourceType2: 'winner',
        nextMatchId: `grand-final` // USER REQUEST: Winner goes to Grand Final
    }));

    // --- LOSERS BRACKET (LB) ---

    // LB R1 (8 matches): Fed by WB R1 Losers
    for (let i = 1; i <= 8; i++) {
        matches.push(mkMatch(`lb-r1-m${i}`, 'lb', 1, {
            sourceMatchId1: `wb-r1-m${i * 2 - 1}`, sourceType1: 'loser',
            sourceMatchId2: `wb-r1-m${i * 2}`, sourceType2: 'loser',
            nextMatchId: `lb-r2-m${i}`
        }));
    }

    // LB R2 (8 matches): Fed by LB R1 Winners AND WB R2 Losers (Diagonal)
    for (let i = 1; i <= 8; i++) {
        const wbSourceIndex = 9 - i;
        matches.push(mkMatch(`lb-r2-m${i}`, 'lb', 2, {
            sourceMatchId1: `lb-r1-m${i}`, sourceType1: 'winner',
            sourceMatchId2: `wb-r2-m${wbSourceIndex}`, sourceType2: 'loser',
            nextMatchId: `lb-r3-m${Math.ceil(i / 2)}`
        }));
    }

    // LB R3 (4 matches): Fed by LB R2 Winners
    for (let i = 1; i <= 4; i++) {
        matches.push(mkMatch(`lb-r3-m${i}`, 'lb', 3, {
            sourceMatchId1: `lb-r2-m${i * 2 - 1}`, sourceType1: 'winner',
            sourceMatchId2: `lb-r2-m${i * 2}`, sourceType2: 'winner',
            nextMatchId: `lb-r4-m${i}`
        }));
    }

    // LB R4 (4 matches): Fed by LB R3 Winners AND WB R3 Losers (Cross)
    const getWbSourceR3 = (lbIdx) => {
        if (lbIdx === 1) return 2;
        if (lbIdx === 2) return 1;
        if (lbIdx === 3) return 4;
        if (lbIdx === 4) return 3;
        return 0;
    };
    for (let i = 1; i <= 4; i++) {
        matches.push(mkMatch(`lb-r4-m${i}`, 'lb', 4, {
            sourceMatchId1: `lb-r3-m${i}`, sourceType1: 'winner',
            sourceMatchId2: `wb-r3-m${getWbSourceR3(i)}`, sourceType2: 'loser',
            nextMatchId: `lb-r5-m${Math.ceil(i / 2)}`
        }));
    }

    // LB R5 (2 matches): Fed by LB R4 Winners
    for (let i = 1; i <= 2; i++) {
        matches.push(mkMatch(`lb-r5-m${i}`, 'lb', 5, {
            sourceMatchId1: `lb-r4-m${i * 2 - 1}`, sourceType1: 'winner',
            sourceMatchId2: `lb-r4-m${i * 2}`, sourceType2: 'winner',
            nextMatchId: `lb-r6-m${i}`
        }));
    }

    // LB R6 (2 matches) - Semifinals of Losers
    // Fed by LB R5 Winners AND WB R4 Losers (Cross)
    const getWbSourceR4 = (lbIdx) => {
        if (lbIdx === 1) return 2;
        if (lbIdx === 2) return 1;
        return 0;
    };
    for (let i = 1; i <= 2; i++) {
        matches.push(mkMatch(`lb-r6-m${i}`, 'lb', 6, {
            sourceMatchId1: `lb-r5-m${i}`, sourceType1: 'winner',
            sourceMatchId2: `wb-r4-m${getWbSourceR4(i)}`, sourceType2: 'loser',
            // USER REQUEST: Winners to lb-final, Losers to p3-f
            nextMatchId: `lb-final`,
            loserMatchId: `p3-f`
        }));
    }

    // LB Final (1 match) - The "Losers Final"
    matches.push(mkMatch(`lb-final`, 'lb', 7, {
        sourceMatchId1: `lb-r6-m1`, sourceType1: 'winner',
        sourceMatchId2: `lb-r6-m2`, sourceType2: 'winner',
        nextMatchId: `grand-final` // USER REQUEST: Winner to Grand Final
    }));

    // Grand Final
    matches.push(mkMatch(`grand-final`, 'gf', 1, {
        sourceMatchId1: `wb-r5-m1`, sourceType1: 'winner',
        sourceMatchId2: `lb-final`, sourceType2: 'winner'
    }));

    // 3rd Place Match (p3-f)
    // USER REQUEST: Fed by losers of LB R6
    matches.push(mkMatch(`p3-f`, 'p3', 1, {
        sourceMatchId1: `lb-r6-m1`, sourceType1: 'loser',
        sourceMatchId2: `lb-r6-m2`, sourceType2: 'loser'
    }));

    return matches;
};


// --------------------------------------------------------------------------
// LOGIC: HYDRATION & UPDATES
// --------------------------------------------------------------------------

export const rebuildBracketState = (players, existingMatchesMap = {}) => {
    // 1. Prepare Seeds
    const seeds = [...players].sort((a, b) => {
        const eloA = parseInt(a.elo || 0);
        const eloB = parseInt(b.elo || 0);
        if (eloA !== eloB) return eloB - eloA;
        return (a.full_name || "").localeCompare(b.full_name || "");
    });
    // Fill to 32
    while (seeds.length < 32) seeds.push({ id: `bye-${seeds.length}`, full_name: "BYE", isBye: true });

    const playerMap = new Map();
    seeds.forEach(p => playerMap.set(p.id, p));

    // 2. Load Blueprint
    const allMatches = getBracketBlueprint().map(m => ({ ...m }));
    const matchMap = new Map();
    allMatches.forEach(m => matchMap.set(m.id, m));

    // 3. Initial Seeding (WB R1)
    const wbR1 = allMatches.filter(m => m.bracket === 'wb' && m.round === 1);
    wbR1.forEach((m, i) => {
        const [seed1Idx, seed2Idx] = SEEDING_PAIRS[i];
        if (seeds[seed1Idx - 1]) m.player1Id = seeds[seed1Idx - 1].id;
        if (seeds[seed2Idx - 1]) m.player2Id = seeds[seed2Idx - 1].id;
    });

    // 4. Processing Order
    // WB Matches first, then LB, then GF/P3
    const sortedMatches = [...allMatches].sort((a, b) => {
        if (a.bracket === 'wb' && b.bracket !== 'wb') return -1;
        if (a.bracket !== 'wb' && b.bracket === 'wb') return 1;
        return a.round - b.round;
    });

    // 5. RESOLVE LOOP
    const resolve = () => {
        let changed = false;
        sortedMatches.forEach(match => {
            // A. STANDARD SOURCE PULL (Parent -> Child)
            // Pull Winner/Loser based on sourceMatchId attributes
            if (match.sourceMatchId1 && !match.player1Id) {
                const src = matchMap.get(match.sourceMatchId1);
                if (src && src.winnerId && src.status === 'finished') {
                    const p = match.sourceType1 === 'winner' ? src.winnerId : (src.winnerId === src.player1Id ? src.player2Id : src.player1Id);
                    if (p && match.player1Id !== p) { match.player1Id = p; changed = true; }
                }
            }
            if (match.sourceMatchId2 && !match.player2Id) {
                const src = matchMap.get(match.sourceMatchId2);
                if (src && src.winnerId && src.status === 'finished') {
                    const p = match.sourceType2 === 'winner' ? src.winnerId : (src.winnerId === src.player1Id ? src.player2Id : src.player1Id);
                    if (p && match.player2Id !== p) { match.player2Id = p; changed = true; }
                }
            }

            // B. STRICT MAPPING ENFORCEMENT (Push Logic Overrides)
            // Check if this match is a WB match that just finished, and PUSH the loser to the specific target
            if (match.bracket === 'wb' && match.status === 'finished' && match.winnerId) {
                const loserId = match.winnerId === match.player1Id ? match.player2Id : match.player1Id;
                const targetId = getTargetDropId(match.id);

                if (loserId && targetId) {
                    const targetMatch = matchMap.get(targetId);
                    if (targetMatch) {
                        // Priority Check
                        let slot = 0;
                        if (targetMatch.sourceMatchId1 === match.id) slot = 1;
                        else if (targetMatch.sourceMatchId2 === match.id) slot = 2;

                        // Force update
                        if (slot === 1 && targetMatch.player1Id !== loserId) {
                            targetMatch.player1Id = loserId;
                            changed = true;
                        }
                        if (slot === 2 && targetMatch.player2Id !== loserId) {
                            targetMatch.player2Id = loserId;
                            changed = true;
                        }
                    }
                }
            }

            // C. Apply Scores / Auto-Win
            const p1 = playerMap.get(match.player1Id);
            const p2 = playerMap.get(match.player2Id);
            const saved = existingMatchesMap[match.id];

            // BYE Logic
            let autoWinner = null;
            if (match.player1Id && match.player2Id) {
                if (p1?.isBye) autoWinner = match.player2Id;
                else if (p2?.isBye) autoWinner = match.player1Id;
            }

            let newState = { ...match };

            if (autoWinner) {
                newState.winnerId = autoWinner;
                newState.score1 = (autoWinner === match.player1Id) ? 1 : 0;
                newState.score2 = (autoWinner === match.player2Id) ? 1 : 0;
                newState.status = 'finished';
            } else if (saved && (saved.score1 !== null || saved.score2 !== null)) {
                newState.score1 = saved.score1;
                newState.score2 = saved.score2;
                newState.microPoints = saved.micro_points || [];
                newState.winnerId = saved.winnerId;

                if (!newState.winnerId && (newState.score1 !== null && newState.score2 !== null)) {
                    // BO5 for WB, GF, LB Final
                    const isBo5 = match.bracket === 'wb' || match.bracket === 'gf' || match.id === 'lb-final';
                    const bestOf = isBo5 ? 5 : 3;
                    const thresh = Math.ceil(bestOf / 2);
                    if (newState.score1 >= thresh) newState.winnerId = match.player1Id;
                    else if (newState.score2 >= thresh) newState.winnerId = match.player2Id;
                }
                newState.status = newState.winnerId ? 'finished' : 'live';
            } else {
                newState.status = (match.player1Id && match.player2Id) ? 'pending' : 'scheduled';
                newState.winnerId = null;
            }

            if (newState.winnerId !== match.winnerId || newState.player1Id !== match.player1Id || newState.player2Id !== match.player2Id) {
                Object.assign(match, newState);
                changed = true;
            }
        });
        return changed;
    };

    for (let i = 0; i < 15; i++) {
        if (!resolve()) break;
    }

    return sortedMatches;
};

// Wrapper for compatibility
export const generateDoubleEliminationBracket = (players) => rebuildBracketState(players, {});

export const updateBracketMatch = (matches, matchId, score1, score2, microPoints = [], playersSource, winnerId = null, status = 'live') => {
    const resultsMap = {};
    matches.forEach(m => {
        if (m.score1 !== null || m.score2 !== null || m.winnerId) {
            resultsMap[m.id] = {
                score1: m.score1,
                score2: m.score2,
                micro_points: m.microPoints,
                winnerId: m.winnerId,
                status: m.status
            };
        }
    });

    resultsMap[matchId] = {
        score1: Number(score1),
        score2: Number(score2),
        micro_points: microPoints,
        winnerId,
        status
    };

    return rebuildBracketState(playersSource, resultsMap);
};

export const clearBracketMatch = (matches, matchId, playersSource) => {
    const resultsMap = {};
    matches.forEach(m => {
        if (m.id !== matchId && (m.score1 !== null || m.score2 !== null)) {
            resultsMap[m.id] = {
                score1: m.score1,
                score2: m.score2,
                micro_points: m.microPoints,
                winnerId: m.winnerId,
                status: m.status
            };
        }
    });
    return rebuildBracketState(playersSource, resultsMap);
};