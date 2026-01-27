import { RACKET_COLORS } from '../components/RacketBadge';

const COLOR_KEYS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan'];

/**
 * Returns the "Racket Path" configuration for a given match ID.
 * 
 * Rules:
 * WB Round 1 Matches (1-16):
 *  - Assigned a color based on their pair index.
 *  - Show a Single Racket with their Match Number.
 * 
 * LB Round 1 Matches (1-8):
 *  - These are the destination for WB R1 Losers.
 *  - Show Dual Rackets with logic "X + Y" (e.g. 1 + 2).
 *  - Same color as the source pair.
 */
export const getRacketPathConfig = (matchId, bracketType, round, matchNumber) => {
    // 1. WB Round 1 Sources
    if (bracketType === 'wb' && round === 1) {
        // Pairs: (1,2), (3,4), etc.
        // Index within pairs: Math.ceil(matchNumber / 2) - 1
        const pairIndex = Math.ceil(matchNumber / 2) - 1;
        const colorKey = COLOR_KEYS[pairIndex % COLOR_KEYS.length];

        return {
            showBadge: true,
            colorKey,
            text: `${matchNumber}`,
            isDual: false,
            type: 'source'
        };
    }

    // 2. LB Round 1 Destinations (where WB R1 losers go)
    if (bracketType === 'lb' && round === 1) {
        // Match 1 in LB R1 corresponds to WB Pair 1 (Matches 1 & 2)
        // Match m corresponds to WB Pair m
        const pairIndex = matchNumber - 1;
        const colorKey = COLOR_KEYS[pairIndex % COLOR_KEYS.length];

        const source1 = pairIndex * 2 + 1;
        const source2 = pairIndex * 2 + 2;

        return {
            showBadge: true,
            colorKey,
            text: `${source1} + ${source2}`,
            isDual: true,
            type: 'destination'
        };
    }

    // 3. WB Round 2 Sources (drop to LB Round 2)
    // Matches 1-8 in WB R2
    // They drop to LB R2 Matches 1-8 (Slot 2)
    /* 
       Optimally, we could color code these too, maybe recycling colors or simplified gray.
       Let's add them as 'Single Racket' indicators if they lose.
    */
    if (bracketType === 'wb' && round > 1) {
        // Future expansion: visual cues for other rounds? 
        // For now, adhering strictly to the "Pair" system request for the "Flow".
        // The user specifically mentioned "Mecze 1 i 2".
        return null;
    }

    // 4. LB Round 2+ Destinations
    // These matches wait for WB losers. 
    // E.g. LB R2 M1 waits for Loser of WB R2 M1.
    // We could mark that slot specifically.

    return null;
};
