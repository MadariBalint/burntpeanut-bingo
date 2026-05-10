import { useState } from "react";

function GameLobby({ onCreateGame, onJoinGame }) {
  const [name, setName] = useState("");
  const [gameId, setGameId] = useState("");

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4 py-8 text-center text-white sm:px-6 sm:py-12">
      <h1 className="mb-8 text-3xl font-bold sm:text-4xl">TheBurntPeanut Bingo</h1>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <input
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder:text-zinc-400"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          className="rounded-lg bg-yellow-400 px-5 py-3 font-bold text-black hover:bg-yellow-300"
          onClick={() => onCreateGame(name)}
        >
          Create Game
        </button>
      </div>

      <hr className="my-8 border-zinc-700" />

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <input
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder:text-zinc-400"
          placeholder="Game ID"
          value={gameId}
          onChange={(e) => setGameId(e.target.value)}
        />
        <button
          className="rounded-lg bg-zinc-700 px-5 py-3 font-bold text-white hover:bg-zinc-600"
          onClick={() => onJoinGame(gameId, name)}
        >
          Join Game
        </button>
      </div>
    </div>
  );
}

export default GameLobby;
