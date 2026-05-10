import { useCallback, useRef, useState } from "react";
import { checkWinner } from "../utils/bingo";
import {
  createGameForPlayer,
  deleteGameById,
  joinGameForPlayer,
  loadPlayersByGameId,
  startNextRoundForGame,
  updateGameWinner,
  updatePlayerBoard,
  votePlayAgainForPlayer,
} from "../utils/gameApi";
import {
  getSavedSession,
  resetGameSession,
  saveSession,
} from "../utils/gameSession";
import { hasPlayAgainVote, playAgainVote } from "../utils/playAgain";
import { useCopyFeedback } from "./useCopyFeedback";
import { useGameRealtime } from "./useGameRealtime";
import { useLatestRefs } from "./useLatestRefs";
import { useRestoreGameSession } from "./useRestoreGameSession";

export function useBingoGame() {
  const [game, setGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [currentPlayerId, setCurrentPlayerId] = useState(null);
  const [error, setError] = useState("");
  const [dismissedWinner, setDismissedWinner] = useState(null);
  const [isStartingNextRound, setIsStartingNextRound] = useState(false);
  const [isRestoringSession, setIsRestoringSession] = useState(() =>
    Boolean(getSavedSession()?.gameId),
  );
  const {
    copiedValue: copiedGameId,
    copyValue,
    resetCopiedValue,
  } = useCopyFeedback(setError);

  const currentPlayerIdRef = useRef(null);
  const gameRef = useRef(null);
  const startNextRoundRef = useRef(null);

  const loadPlayers = useCallback(async (gameId) => {
    const { players: loadedPlayers, error: loadError } =
      await loadPlayersByGameId(gameId);

    if (loadError) {
      setError(loadError);
      return;
    }

    setPlayers(loadedPlayers);
    return loadedPlayers;
  }, []);

  async function createGame(playerName) {
    setError("");

    if (!playerName.trim()) {
      setError("Enter your name first.");
      return;
    }

    try {
      const {
        game: createdGame,
        player,
        error: createError,
      } = await createGameForPlayer(playerName);

      if (createError) {
        setError(createError);
        return;
      }

      setGame(createdGame);
      setCurrentPlayerId(player.id);
      saveSession(createdGame.id, player.id);
      loadPlayers(createdGame.id);
    } catch (createError) {
      setError(createError.message);
    }
  }

  async function joinGame(gameId, playerName) {
    setError("");

    if (!gameId.trim() || !playerName.trim()) {
      setError("Enter game ID and your name.");
      return;
    }

    try {
      const {
        game: joinedGame,
        player,
        error: joinError,
      } = await joinGameForPlayer(gameId, playerName);

      if (joinError) {
        setError(joinError);
        return;
      }

      setGame(joinedGame);
      setCurrentPlayerId(player.id);
      saveSession(joinedGame.id, player.id);
      loadPlayers(joinedGame.id);
    } catch (joinError) {
      setError(joinError.message);
    }
  }

  async function toggleCell(index) {
    const player = players.find(
      (currentPlayer) => currentPlayer.id === currentPlayerId,
    );

    if (!player || player.has_won || game?.winner) return;

    const updatedBoard = player.board.map((cell, i) =>
      i === index && !cell.free ? { ...cell, marked: !cell.marked } : cell,
    );
    const hasWon = checkWinner(updatedBoard);

    setPlayers((currentPlayers) =>
      currentPlayers.map((currentPlayer) =>
        currentPlayer.id === player.id
          ? { ...currentPlayer, board: updatedBoard, has_won: hasWon }
          : currentPlayer,
      ),
    );

    const { error: playerError } = await updatePlayerBoard(
      player.id,
      updatedBoard,
      hasWon,
    );

    if (playerError) {
      setPlayers((currentPlayers) =>
        currentPlayers.map((currentPlayer) =>
          currentPlayer.id === player.id ? player : currentPlayer,
        ),
      );
      setError(playerError);
      return;
    }

    if (!hasWon) return;

    const { game: updatedGame, error: gameError } = await updateGameWinner(
      game,
      player,
    );

    if (gameError) {
      setError(gameError);
      return;
    }

    setGame(updatedGame);
  }

  async function startNextRound() {
    if (!game?.id || !game.winner || isStartingNextRound) return;

    setIsStartingNextRound(true);

    try {
      const { game: updatedGame, error: roundError } =
        await startNextRoundForGame(game.id);

      if (roundError) {
        setError(roundError);
        return;
      }

      if (!updatedGame) return;

      setDismissedWinner(null);
      setGame(updatedGame);
      loadPlayers(game.id);
    } catch (roundError) {
      setError(roundError.message);
    } finally {
      setIsStartingNextRound(false);
    }
  }

  useLatestRefs({
    currentPlayerId,
    currentPlayerIdRef,
    game,
    gameRef,
    startNextRound,
    startNextRoundRef,
  });

  async function votePlayAgain() {
    const player = players.find(
      (currentPlayer) => currentPlayer.id === currentPlayerId,
    );

    if (!player || !game?.winner || hasPlayAgainVote(player)) return;

    setError("");

    setPlayers((currentPlayers) =>
      currentPlayers.map((currentPlayer) =>
        currentPlayer.id === player.id
          ? { ...currentPlayer, marked: playAgainVote }
          : currentPlayer,
      ),
    );

    const { error: playerError } = await votePlayAgainForPlayer(player.id);

    if (playerError) {
      setPlayers((currentPlayers) =>
        currentPlayers.map((currentPlayer) =>
          currentPlayer.id === player.id ? player : currentPlayer,
        ),
      );
      setError(playerError);
    }
  }

  function copyGameId() {
    copyValue(game.id);
  }

  async function deleteGameAndReturnToLobby() {
    if (!game?.id) return;

    setError("");

    const { error: deleteError } = await deleteGameById(game.id);

    if (deleteError) {
      setError(deleteError);
      return;
    }

    resetState();
  }

  const resetState = useCallback(() => {
    const resetStateValues = resetGameSession();

    setGame(resetStateValues.game);
    setPlayers(resetStateValues.players);
    setCurrentPlayerId(resetStateValues.currentPlayerId);
    setDismissedWinner(resetStateValues.dismissedWinner);
    resetCopiedValue();
  }, [resetCopiedValue]);

  useRestoreGameSession({
    onError: setError,
    setCurrentPlayerId,
    setGame,
    setIsRestoringSession,
  });

  useGameRealtime({
    currentPlayerIdRef,
    game,
    gameRef,
    loadPlayers,
    onGameDeleted: resetState,
    setGame,
    startNextRoundRef,
  });

  return {
    copiedGameId,
    createGame,
    currentPlayerId,
    deleteGameAndReturnToLobby,
    dismissedWinner,
    error,
    game,
    isRestoringSession,
    joinGame,
    players,
    setDismissedWinner,
    copyGameId,
    toggleCell,
    votePlayAgain,
  };
}
