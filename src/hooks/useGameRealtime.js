import { useEffect } from "react";
import { supabase } from "../lib/supabase";
import { hasPlayAgainVote } from "../utils/playAgain";

export function useGameRealtime({
  currentPlayerIdRef,
  game,
  gameRef,
  loadPlayers,
  onGameDeleted,
  setGame,
  startNextRoundRef,
}) {
  useEffect(() => {
    if (!game?.id) return;

    async function loadInitialPlayers() {
      await loadPlayers(game.id);
    }

    loadInitialPlayers();

    const channel = supabase
      .channel(`game-${game.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_players",
          filter: `game_id=eq.${game.id}`,
        },
        async () => {
          const updatedPlayers = await loadPlayers(game.id);
          const latestGame = gameRef.current;
          const player = updatedPlayers?.find(
            (currentPlayer) => currentPlayer.id === currentPlayerIdRef.current,
          );

          if (
            latestGame?.winner &&
            player?.player_name === latestGame.player1_name &&
            updatedPlayers.length >= 2 &&
            updatedPlayers.every(hasPlayAgainVote)
          ) {
            startNextRoundRef.current?.();
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "games",
          filter: `id=eq.${game.id}`,
        },
        (payload) => {
          if (payload.eventType === "DELETE") {
            onGameDeleted();
            return;
          }

          setGame(payload.new);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [
    currentPlayerIdRef,
    game?.id,
    gameRef,
    loadPlayers,
    onGameDeleted,
    setGame,
    startNextRoundRef,
  ]);
}
