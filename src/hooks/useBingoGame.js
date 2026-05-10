import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { checkWinner } from "../utils/bingo";
import {
  createGameForPlayer,
  deleteGameById,
  fetchSavedGameAndPlayer,
  joinGameForPlayer,
  loadPlayersByGameId,
  startNextRoundForGame,
  updateGameWinner,
  updatePlayerBoard,
  votePlayAgainForPlayer,
} from "../utils/gameApi";
import {
  clearSavedSession,
  getSavedSession,
  resetGameSession,
  saveSession,
} from "../utils/gameSession";
import { hasPlayAgainVote, playAgainVote } from "../utils/playAgain";

export function useBingoGame() {
  const [game, setGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [currentPlayerId, setCurrentPlayerId] = useState(null);
  const [error, setError] = useState("");
  const [dismissedWinner, setDismissedWinner] = useState(null);
  const [copiedGameId, setCopiedGameId] = useState("");
  const [isStartingNextRound, setIsStartingNextRound] = useState(false);
  const [isRestoringSession, setIsRestoringSession] = useState(() =>
    Boolean(getSavedSession()?.gameId),
  );

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

  const startNextRound = useCallback(async () => {
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
  }, [game, isStartingNextRound, loadPlayers]);

  useEffect(() => {
    currentPlayerIdRef.current = currentPlayerId;
    gameRef.current = game;
    startNextRoundRef.current = startNextRound;
  }, [currentPlayerId, game, startNextRound]);

  async function votePlayAgain() {
    const player = players.find(
      (currentPlayer) => currentPlayer.id === currentPlayerId,
    );

    if (!player || !game?.winner || hasPlayAgainVote(player)) return;

    setError("");

    setPlayers((currentPlayers) =>
      currentPlayers.map((currentPlayer) =>
        currentPlayer.id === player.id
          ? { ...currentPlayer, voted: playAgainVote }
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

  async function copyGameId() {
    try {
      await navigator.clipboard.writeText(game.id);
      setCopiedGameId(game.id);

      window.setTimeout(() => {
        setCopiedGameId("");
      }, 2000);
    } catch {
      setError("Could not copy the Game ID.");
    }
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
    setCopiedGameId("");
  }, []);

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
        setError(restoreError);
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
  }, []);

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
            resetState();
            return;
          }

          setGame(payload.new);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [game?.id, loadPlayers, resetState]);

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
