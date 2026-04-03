import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "../hooks/useAuth.tsx";
import { useTournament } from "./TournamentContext";
import { supabase } from "../lib/supabase";

const MatchesContext = createContext(null);

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const toUuidOrNull = (value) => {
  if (typeof value !== "string") return null;
  return UUID_REGEX.test(value) ? value : null;
};

export const MatchesProvider = ({ children }) => {
  const [matches, setMatches] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const { isAuthenticated } = useAuth();
  const { activeTournamentId } = useTournament();

  // --- MAPPERS (Kept for consistency, simplified where possible) ---
  const mapToCamel = (m) => {
    let mp = m.micro_points || [];
    if (typeof mp === "string") {
      try {
        mp = JSON.parse(mp);
      } catch {
        mp = [];
      }
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
      court: m.court,
      manualOrder: m.manual_order,
      finishedAt: m.finished_at,
    };
  };

  const mapToSnake = (m) => ({
    id: m.id,
    tournament_id: activeTournamentId,
    bracket_type: m.bracket || "wb",
    round_id: m.round || 1,
    // Do not persist synthetic BYE IDs (e.g. "bye-12") into UUID columns.
    player1_id: toUuidOrNull(m.player1Id),
    player2_id: toUuidOrNull(m.player2Id),
    score1: m.score1 ?? null,
    score2: m.score2 ?? null,
    micro_points: m.microPoints || [],
    winner_id: toUuidOrNull(m.winnerId),
    status: m.status || "pending",
    court: m.court || "",
    manual_order: m.manualOrder !== undefined ? m.manualOrder : null,
    finished_at: m.finishedAt || null,
  });

  // Ref to track saving state to prevent snapshot racing/echoes
  const isSavingRef = useRef(false);

  // --- DATA LOADING ---
  useEffect(() => {
    if (!activeTournamentId) {
      setMatches([]);
      return;
    }

    const fetchMatches = async () => {
      try {
        const { data, error } = await supabase
          .from("matches")
          .select("*")
          .eq("tournament_id", activeTournamentId);

        if (error) throw error;

        const loaded = (data || []).filter((m) => m.id).map(mapToCamel);

        const uniqueMap = new Map();
        loaded.forEach((m) => uniqueMap.set(m.id, m));

        setMatches(Array.from(uniqueMap.values()));
      } catch (error) {
        console.error("[MatchesContext] Supabase Error:", error);
      }
    };

    fetchMatches();

    const channel = supabase
      .channel(`matches:${activeTournamentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
          filter: `tournament_id=eq.${activeTournamentId}`,
        },
        () => {
          if (!isSavingRef.current) {
            fetchMatches();
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTournamentId]);

  const matchesRef = useRef(matches);
  useEffect(() => {
    matchesRef.current = matches;
  }, [matches]);

  // --- ACTIONS ---

  const saveMatches = useCallback(
    async (newMatches, _specificMatchId = null) => {
      if (!activeTournamentId) {
        console.error("No active tournament ID, cannot save!");
        return;
      }

      // 0. CAPTURE CURRENT STATE BEFORE ASYNC/UPDATES
      const previousMatches = [...matchesRef.current];

      // 1. OPTIMISTIC UPDATE
      setMatches(newMatches);
      isSavingRef.current = true; // Lock snapshots
      setIsSaving(true);

      // 2. PERSISTENCE
      if (isAuthenticated) {
        try {
          // Identify what to save
          const payload = newMatches.map((m) => mapToSnake(m));
          const changesToSave = payload.filter((p) => {
            const old = previousMatches.find((m) => m.id === p.id);
            if (!old) return true;

            const oldSnake = mapToSnake(old);

            if (p.manual_order !== oldSnake.manual_order) return true;
            if (p.court !== oldSnake.court) return true;
            if (p.winner_id !== oldSnake.winner_id) return true;
            if (p.score1 !== oldSnake.score1 || p.score2 !== oldSnake.score2)
              return true;
            if (p.status !== oldSnake.status) return true;
            if (JSON.stringify(p.micro_points) !== JSON.stringify(oldSnake.micro_points))
              return true;
            if (p.finished_at !== oldSnake.finished_at) return true;

            return false;
          });

          if (changesToSave.length > 0) {
            const { error } = await supabase
              .from("matches")
              .upsert(changesToSave, { onConflict: "tournament_id,id" });

            if (error) {
              // Backward compatibility: older local schemas might not have
              // optional queue/finish columns yet.
              const message = `${error.message || ""} ${error.details || ""}`;
              const missingOptionalColumns =
                message.includes("manual_order") || message.includes("finished_at");

              if (!missingOptionalColumns) throw error;

              const fallbackPayload = changesToSave.map(
                ({ manual_order, finished_at, ...rest }) => rest,
              );

              const { error: fallbackError } = await supabase
                .from("matches")
                .upsert(fallbackPayload, { onConflict: "tournament_id,id" });

              if (fallbackError) throw fallbackError;
            }
          }
        } catch (e) {
          console.error("Error saving matches:", e);
        } finally {
          // Release lock with slight delay
          setIsSaving(false);
          setTimeout(() => {
            isSavingRef.current = false;
          }, 500);
        }
      } else {
        setIsSaving(false);
        isSavingRef.current = false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAuthenticated, activeTournamentId],
  );

  const resetMatches = async () => {
    if (!isAuthenticated || !activeTournamentId) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("matches")
        .delete()
        .eq("tournament_id", activeTournamentId);
      if (error) throw error;
      setMatches([]);
    } catch (e) {
      console.error("Error resetting matches:", e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MatchesContext.Provider
      value={{ matches, saveMatches, resetMatches, isSaving }}
    >
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
