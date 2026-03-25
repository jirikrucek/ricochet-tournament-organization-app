import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth.tsx";
import { useTournament } from "../contexts/TournamentContext";
import { supabase } from "../lib/supabase";

export const usePlayers = () => {
  const [players, setPlayers] = useState([]);
  const { isAuthenticated } = useAuth();
  const { activeTournamentId } = useTournament();

  useEffect(() => {
    if (!activeTournamentId) {
      setPlayers([]);
      return;
    }

    const fetchPlayers = async () => {
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .eq("tournament_id", activeTournamentId);

      if (!error && data) {
        setPlayers(data);
      }
    };

    fetchPlayers();

    // Realtime Subscription
    const channel = supabase
      .channel(`players:${activeTournamentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "players",
          filter: `tournament_id=eq.${activeTournamentId}`,
        },
        () => {
          fetchPlayers();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTournamentId]);

  const addPlayer = async (playerData) => {
    if (!isAuthenticated || !activeTournamentId) return null;

    const fullName = playerData.full_name || playerData.fullName;
    const newPlayer = {
      tournament_id: activeTournamentId,
      full_name: fullName,
      country: playerData.country || "",
      elo: playerData.elo ? parseInt(playerData.elo, 10) : 0,
    };

    const { data, error } = await supabase
      .from("players")
      .insert([newPlayer])
      .select()
      .single();

    if (error) {
      console.error("Error adding player:", error);
      return null;
    }
    setPlayers((prev) => [...prev, data]);
    return data;
  };

  const importPlayers = async (_namesList) => {
    // Basic impl for now
    return 0;
  };

  const updatePlayer = async (id, updates) => {
    if (!isAuthenticated) return;

    const { error } = await supabase
      .from("players")
      .update(updates)
      .eq("id", id);
    if (error) console.error("Error updating player:", error);
    else
      setPlayers((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      );
  };

  const deletePlayer = async (id) => {
    if (!isAuthenticated) return;

    const { error } = await supabase.from("players").delete().eq("id", id);
    if (error) console.error("Error deleting player:", error);
    else setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const bulkUpsertPlayers = async (playersList) => {
    if (!isAuthenticated || !activeTournamentId)
      return { success: false, error: "Authorization required" };

    const newPlayersBase = playersList.map((p) => ({
      tournament_id: activeTournamentId,
      full_name: p.full_name || p.fullName,
      country: p.country,
      elo: p.elo === "-" || !p.elo ? 0 : parseInt(p.elo, 10),
    }));

    const { data, error } = await supabase
      .from("players")
      .upsert(newPlayersBase)
      .select();
    if (error) return { success: false, error };
    return { success: true, count: data.length };
  };

  return {
    players,
    addPlayer,
    importPlayers,
    updatePlayer,
    deletePlayer,
    bulkUpsertPlayers,
  };
};
