import { useEffect } from "react";
import { fetchSavedGameAndPlayer } from "../utils/gameApi";
import { clearSavedSession, getSavedSession } from "../utils/gameSession";

export function useRestoreGameSession({
  onError,
  setCurrentPlayerId,
  setGame,
  setIsRestoringSession,
}) {
  useEffect(() => {
    const savedSession = getSavedSession();

    if (!savedSession?.gameId || !savedSession?.playerId) return;

    let isActive = true;

    async function restoreSession() {
      const {
        game: savedGame,
        player: savedPlayer,
        error: restoreError,
      } = await fetchSavedGameAndPlayer(savedSession);

      if (!isActive) return;

      if (restoreError) {
        clearSavedSession();
        onError(restoreError);
        setIsRestoringSession(false);
        return;
      }

      setGame(savedGame);
      setCurrentPlayerId(savedPlayer.id);
      setIsRestoringSession(false);
    }

    restoreSession();

    return () => {
      isActive = false;
    };
  }, [onError, setCurrentPlayerId, setGame, setIsRestoringSession]);
}
