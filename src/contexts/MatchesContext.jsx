import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth.tsx';
import { useTournament } from './TournamentContext';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { collection, onSnapshot, getDocs, doc, query, where, writeBatch } from 'firebase/firestore';

const MatchesContext = createContext(null);

const BASE_KEY = 'brazilian_v14_GLOBAL_STATE';

export const MatchesProvider = ({ children }) => {
    const [matches, setMatches] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const { isAuthenticated } = useAuth();
    const { activeTournamentId } = useTournament();

    const lsKey = activeTournamentId ? `${BASE_KEY}_${activeTournamentId}` : null;

    // --- MAPPERS ---
    const mapToCamel = (m) => {
        let mp = [];
        try {
            mp = typeof m.micro_points === 'string' ? JSON.parse(m.micro_points) : (m.micro_points || []);
        } catch (e) {
            mp = m.micro_points || [];
        }

        return {
            id: m.id,
            tournamentId: m.tournament_id,
            bracket: m.bracket_type,
            round: m.round_id,
            player1Id: m.player1_id,
            player2Id: m.player2_id,
            score1: m.score1,
            score2: m.score2,
            microPoints: mp,
            winnerId: m.winner_id,
            status: m.status,
            court: m.court
        };
    };

    const mapToSnake = (m) => ({
        id: m.id,
        tournament_id: activeTournamentId,
        bracket_type: m.bracket || 'wb',
        round_id: m.round || 1,
        player1_id: m.player1Id || null,
        player2_id: m.player2Id || null,
        score1: m.score1 ?? null,
        score2: m.score2 ?? null,
        micro_points: JSON.stringify(m.microPoints || []),
        winner_id: m.winnerId || null,
        status: m.status || 'pending',
        court: m.court || ""
    });

    // --- DATA LOADING ---
    useEffect(() => {
        if (!activeTournamentId) {
            setMatches([]);
            return;
        }

        let unsubscribe;

        const fetchMatches = async () => {
            if (isFirebaseConfigured) {
                console.log(`[MatchesContext] Subscribing to tournament: ${activeTournamentId}`);
                const q = query(collection(db, "matches"), where("tournament_id", "==", activeTournamentId));

                unsubscribe = onSnapshot(q, (snapshot) => {
                    const loaded = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })).map(mapToCamel);

                    // Simple Diff Check could be here, but for now just set
                    setMatches(loaded);
                    console.log(`[MatchesContext] Loaded ${loaded.length} matches from Firebase`);
                }, (error) => {
                    console.error("[MatchesContext] Firebase Error:", error);
                });
            } else {
                // LS Fallback
                try {
                    const saved = localStorage.getItem(lsKey);
                    if (saved) {
                        setMatches(JSON.parse(saved));
                    }
                } catch (e) {
                    console.error("LS Load Error", e);
                }
            }
        };

        fetchMatches();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [activeTournamentId, lsKey]);

    // --- ACTIONS ---
    const resetMatches = async () => {
        if (!isAuthenticated || !activeTournamentId || !isFirebaseConfigured) return;
        try {
            setIsSaving(true);
            const q = query(collection(db, "matches"), where("tournament_id", "==", activeTournamentId));
            const snapshot = await getDocs(q);
            const batch = writeBatch(db);
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            setMatches([]); // Clear local immediately
        } catch (e) {
            console.error("Error resetting matches:", e);
        } finally {
            setIsSaving(false);
        }
    };

    const saveMatches = useCallback(async (newMatches) => {
        if (!activeTournamentId) {
            console.error("No active tournament ID, cannot save!");
            return;
        }

        // 1. OPTIMISTIC UPDATE
        // This makes the UI instant across all components using this context
        setMatches(newMatches);

        // 2. PERSISTENCE
        if (isFirebaseConfigured && isAuthenticated) {

            try {
                // Optimization: Only save changes? 
                // For now, we aggressive save all provided matches to ensure consistency
                // Note: Ideally we should only update changed docs, but bulk set is safe for < 100 docs

                const { setDoc } = await import('firebase/firestore');
                const payload = newMatches.map(m => mapToSnake(m));

                // Optimization: Parallel Write
                const promises = payload.map(match => {
                    if (!match.id) return Promise.resolve();

                    // DIRECT BYPASS LOGGING
                    console.log("DEBUG: Sending to Firestore:", match.id, match);

                    const docRef = doc(db, "matches", match.id);
                    // Force using setDoc directly without conditions
                    return setDoc(docRef, match);
                });

                // Fire and forget? or await?
                // Awaiting ensures we catch errors, but UI is already updated.
                Promise.all(promises).catch(err => console.error("Async Save Error:", err));

            } catch (e) {
                console.error("Error initiating save:", e);
            }
        } else {
            // LS
            localStorage.setItem(lsKey, JSON.stringify(newMatches));
        }
    }, [isAuthenticated, activeTournamentId, lsKey]);

    return (
        <MatchesContext.Provider value={{ matches, saveMatches, resetMatches, isSaving }}>
            {children}
        </MatchesContext.Provider>
    );
};

export const useMatchesContext = () => {
    const context = useContext(MatchesContext);
    if (!context) {
        throw new Error("useMatchesContext must be used within MatchesProvider");
    }
    return context;
};
