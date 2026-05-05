import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { createBoard, checkWinner } from "./utils/bingo";
import GameLobby from "./components/GameLobby";
import PlayerBoard from "./components/PlayerBoard";

export default function App() {
  const [game, setGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [currentPlayerId, setCurrentPlayerId] = useState(null);
  const [error, setError] = useState("");

  async function getPhrases() {
    const { data, error } = await supabase.from("bingo_phrases").select("*");
    if (error) throw error;
    return data;
  }

  async function createGame(playerName) {
    setError("");

    if (!playerName.trim()) {
      setError("Enter your name first.");
      return;
    }

    const phrases = await getPhrases();

    if (phrases.length < 24) {
      setError("Add at least 24 phrases in Supabase.");
      return;
    }

    const { data: newGame, error: gameError } = await supabase
      .from("games")
      .insert({
        player1_name: playerName,
      })
      .select()
      .single();

    if (gameError) {
      setError(gameError.message);
      return;
    }

    const board = createBoard(phrases);

    const { data: player, error: playerError } = await supabase
      .from("game_players")
      .insert({
        game_id: newGame.id,
        player_name: playerName,
        board,
        marked: [],
      })
      .select()
      .single();

    if (playerError) {
      setError(playerError.message);
      return;
    }

    setGame(newGame);
    setCurrentPlayerId(player.id);
    loadPlayers(newGame.id);
  }

  async function joinGame(gameId, playerName) {
    setError("");

    if (!gameId.trim() || !playerName.trim()) {
      setError("Enter game ID and your name.");
      return;
    }

    const phrases = await getPhrases();

    if (phrases.length < 24) {
      setError("Add at least 24 phrases in Supabase.");
      return;
    }

    const { data: foundGame, error: gameError } = await supabase
      .from("games")
      .select("*")
      .eq("id", gameId)
      .single();

    if (gameError) {
      setError("Game not found.");
      return;
    }

    const board = createBoard(phrases);

    const { data: player, error: playerError } = await supabase
      .from("game_players")
      .insert({
        game_id: foundGame.id,
        player_name: playerName,
        board,
        marked: [],
      })
      .select()
      .single();

    if (playerError) {
      setError(playerError.message);
      return;
    }

    const { data: updatedGame } = await supabase
      .from("games")
      .update({ player2_name: playerName })
      .eq("id", foundGame.id)
      .select()
      .single();

    setGame(updatedGame || foundGame);
    setCurrentPlayerId(player.id);
    loadPlayers(foundGame.id);
  }

  async function loadPlayers(gameId) {
    const { data, error } = await supabase
      .from("game_players")
      .select("*")
      .eq("game_id", gameId);

    if (error) {
      setError(error.message);
      return;
    }

    setPlayers(data);
  }

  async function toggleCell(index) {
    const player = players.find((p) => p.id === currentPlayerId);

    if (!player || player.has_won || game?.winner) return;

    const updatedBoard = player.board.map((cell, i) =>
      i === index && !cell.free ? { ...cell, marked: !cell.marked } : cell,
    );

    const hasWon = checkWinner(updatedBoard);

    const { error: playerError } = await supabase
      .from("game_players")
      .update({
        board: updatedBoard,
        has_won: hasWon,
      })
      .eq("id", player.id);

    if (playerError) {
      setError(playerError.message);
      return;
    }

    if (hasWon) {
      const { data: updatedGame, error: gameError } = await supabase
        .from("games")
        .update({ winner: player.player_name })
        .eq("id", game.id)
        .select()
        .single();

      if (gameError) {
        setError(gameError.message);
        return;
      }

      setGame(updatedGame);
    }
  }

  useEffect(() => {
    if (!game?.id) return;

    loadPlayers(game.id);

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
        () => {
          loadPlayers(game.id);
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
          setGame(payload.new);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [game?.id]);

  if (!game) {
    return (
      <div className="min-h-screen bg-zinc-950">
        <GameLobby onCreateGame={createGame} onJoinGame={joinGame} />

        {error && (
          <p className="px-4 text-center font-semibold text-red-400">{error}</p>
        )}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-8 text-center text-white">
      <h1 className="mb-4 text-4xl font-bold">TheBurntPeanut Bingo</h1>

      <p className="mb-6 text-zinc-300">
        Share this Game ID:
        <strong className="ml-2 break-all text-yellow-400">{game.id}</strong>
      </p>

      {game.winner && (
        <h2 className="mb-6 text-3xl font-bold text-yellow-400">
          Winner: {game.winner}
        </h2>
      )}

      {error && <p className="mb-4 font-semibold text-red-400">{error}</p>}

      <div className="flex flex-wrap justify-center gap-8">
        {players.map((player) => (
          <PlayerBoard
            key={player.id}
            player={player}
            currentPlayerId={currentPlayerId}
            onToggleCell={toggleCell}
          />
        ))}
      </div>
    </main>
  );
}
