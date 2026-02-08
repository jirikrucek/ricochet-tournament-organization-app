import { useMemo } from 'react';
import { useMatches } from './useMatches';
import { usePlayers } from './usePlayers';
import { rebuildBracketState } from '../utils/bracketLogic';

/**
 * Returns matches that are fully hydrated with tournament logic.
 * This ensures that even if the database is missing "derived" state (like next match players),
 * the client recalculates it based on the confirmed scores.
 */
export const useTournamentMatches = () => {
    const { matches: rawMatches, saveMatches, resetMatches, isSaving } = useMatches();
    const { players } = usePlayers();

    const matches = useMemo(() => {
        if (!players || players.length === 0) return rawMatches;

        // Convert raw matches list to a map of results for the rebuilder
        const resultsMap = {};
        rawMatches.forEach(m => {
            // Only map relevant state that drives logic
            if (m.score1 !== null || m.score2 !== null || m.winnerId) {
                resultsMap[m.id] = {
                    score1: m.score1,
                    score2: m.score2,
                    micro_points: m.microPoints, // Ensure this property name matches what rebuild expects (camelCase vs snake_case check?)
                    // In matchesContext mapToCamel, it's microPoints. 
                    // rebuildBracketState expects 'microPoints' in the object it builds, 
                    // but 'resultsMap' usually comes from updateBracketMatch which uses 'micro_points'.
                    // Let's check rebuildBracketState usage of existingMatchesMap.
                    // Line 483: newState.microPoints = saved.micro_points || [];
                    // So we must pass snake_case 'micro_points' here if we want it to persist.
                    micro_points: m.microPoints,
                    winnerId: m.winnerId,
                    status: m.status
                };
            }
        });

        // Re-run the tournament engine to derive the correct current state
        return rebuildBracketState(players, resultsMap);
    }, [rawMatches, players]);

    return {
        matches,
        saveMatches,
        resetMatches,
        isSaving
    };
};
