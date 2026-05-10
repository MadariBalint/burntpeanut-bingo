import { supabase } from "../lib/supabase";
import { createBoard } from "./bingo";
import { hasPlayAgainVote, noPlayAgainVote, playAgainVote } from "./playAgain";

export async function getPhrases() {
  const { data, error } = await supabase.from("bingo_phrases").select("*");
  if (error) throw error;
  return data;
}

export async function createGameForPlayer(playerName) {
  const phrases = await getPhrases();

  if (phrases.length < 24) {
    return { error: "Add at least 24 phrases in Supabase." };
  }

  const { data: game, error: gameError } = await supabase
    .from("games")
    .insert({
      player1_name: playerName,
      player1_score: 0,
      player2_score: 0,
      round_number: 1,
    })
    .select()
    .single();

  if (gameError) {
    return { error: gameError.message };
  }

  const { data: player, error: playerError } = await supabase
    .from("game_players")
    .insert({
      game_id: game.id,
      player_name: playerName,
      board: createBoard(phrases),
      marked: [],
      voted: noPlayAgainVote,
    })
    .select()
    .single();

  if (playerError) {
    return { error: playerError.message };
  }

  return { game, player };
}

export async function joinGameForPlayer(gameId, playerName) {
  const phrases = await getPhrases();

  if (phrases.length < 24) {
    return { error: "Add at least 24 phrases in Supabase." };
  }

  const { data: foundGame, error: gameError } = await supabase
    .from("games")
    .select("*")
    .eq("id", gameId)
    .single();

  if (gameError) {
    return { error: "Game not found." };
  }

  const { data: player, error: playerError } = await supabase
    .from("game_players")
    .insert({
      game_id: foundGame.id,
      player_name: playerName,
      board: createBoard(phrases),
      marked: [],
      voted: noPlayAgainVote,
    })
    .select()
    .single();

  if (playerError) {
    return { error: playerError.message };
  }

  const { data: updatedGame } = await supabase
    .from("games")
    .update({ player2_name: playerName })
    .eq("id", foundGame.id)
    .select()
    .single();

  return { game: updatedGame || foundGame, player };
}

export async function loadPlayersByGameId(gameId) {
  const { data, error } = await supabase
    .from("game_players")
    .select("*")
    .eq("game_id", gameId);

  if (error) {
    return { error: error.message };
  }

  return { players: data };
}

export async function updatePlayerBoard(playerId, board, hasWon) {
  const { error } = await supabase
    .from("game_players")
    .update({
      board,
      has_won: hasWon,
    })
    .eq("id", playerId);

  return { error: error?.message };
}

export async function updateGameWinner(game, player) {
  const scoreUpdate =
    player.player_name === game.player2_name
      ? { player2_score: (game.player2_score ?? 0) + 1 }
      : { player1_score: (game.player1_score ?? 0) + 1 };

  const { data, error } = await supabase
    .from("games")
    .update({ winner: player.player_name, ...scoreUpdate })
    .eq("id", game.id)
    .select()
    .single();

  return { game: data, error: error?.message };
}

export async function fetchSavedGameAndPlayer(savedSession) {
  const { data: game, error: gameError } = await supabase
    .from("games")
    .select("*")
    .eq("id", savedSession.gameId)
    .single();

  const { data: player, error: playerError } = await supabase
    .from("game_players")
    .select("id")
    .eq("id", savedSession.playerId)
    .eq("game_id", savedSession.gameId)
    .single();

  if (gameError || playerError || !game || !player) {
    return { error: "Could not load your previous game." };
  }

  return { game, player };
}

export async function deleteGameById(gameId) {
  const { error: playersError } = await supabase
    .from("game_players")
    .delete()
    .eq("game_id", gameId);

  if (playersError) {
    return { error: playersError.message };
  }

  const { error: gameError } = await supabase
    .from("games")
    .delete()
    .eq("id", gameId);

  return { error: gameError?.message };
}

export async function votePlayAgainForPlayer(playerId) {
  const { error } = await supabase
    .from("game_players")
    .update({ voted: playAgainVote })
    .eq("id", playerId);

  return { error: error?.message };
}

export async function startNextRoundForGame(gameId) {
  const phrases = await getPhrases();

  if (phrases.length < 24) {
    return { error: "Add at least 24 phrases in Supabase." };
  }

  const { data: freshGame, error: gameFetchError } = await supabase
    .from("games")
    .select("*")
    .eq("id", gameId)
    .single();

  if (gameFetchError) {
    return { error: gameFetchError.message };
  }

  if (!freshGame.winner) {
    return {};
  }

  const { data: currentPlayers, error: playersFetchError } = await supabase
    .from("game_players")
    .select("*")
    .eq("game_id", gameId);

  if (playersFetchError) {
    return { error: playersFetchError.message };
  }

  if (!currentPlayers.every(hasPlayAgainVote)) {
    return {};
  }

  const playerResults = await Promise.all(
    currentPlayers.map((player) =>
      supabase
        .from("game_players")
        .update({
          board: createBoard(phrases),
          has_won: false,
          marked: [],
          voted: noPlayAgainVote,
        })
        .eq("id", player.id),
    ),
  );
  const playerError = playerResults.find((result) => result.error)?.error;

  if (playerError) {
    return { error: playerError.message };
  }

  const { data: updatedGame, error: gameError } = await supabase
    .from("games")
    .update({
      winner: null,
      round_number: (freshGame.round_number ?? 1) + 1,
    })
    .eq("id", gameId)
    .eq("winner", freshGame.winner)
    .select()
    .single();

  return { game: updatedGame, error: gameError?.message };
}
