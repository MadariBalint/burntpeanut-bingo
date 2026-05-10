import { useEffect } from "react";

export function useLatestRefs({
  currentPlayerId,
  currentPlayerIdRef,
  game,
  gameRef,
  startNextRound,
  startNextRoundRef,
}) {
  useEffect(() => {
    currentPlayerIdRef.current = currentPlayerId;
    gameRef.current = game;
    startNextRoundRef.current = startNextRound;
  }, [
    currentPlayerId,
    currentPlayerIdRef,
    game,
    gameRef,
    startNextRound,
    startNextRoundRef,
  ]);
}
