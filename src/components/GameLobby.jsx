import { useState } from "react";
import AppLogo from "./AppLogo";

function GameLobby({ onCreateGame, onJoinGame }) {
  const [mode, setMode] = useState("menu");
  const [name, setName] = useState("");
  const [gameId, setGameId] = useState("");

  function handleCreateSubmit(event) {
    event.preventDefault();
    onCreateGame(name);
  }

  function handleJoinSubmit(event) {
    event.preventDefault();
    onJoinGame(gameId, name);
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4 py-8 text-center text-white sm:px-6 sm:py-12">
      <AppLogo className="mb-8" />

      {mode === "menu" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            className="rounded-lg bg-yellow-400 px-5 py-4 font-bold text-black transition hover:bg-yellow-300"
            onClick={() => setMode("create")}
            type="button"
          >
            Create Game
          </button>
          <button
            className="rounded-lg bg-zinc-700 px-5 py-4 font-bold text-white transition hover:bg-zinc-600"
            onClick={() => setMode("join")}
            type="button"
          >
            Join Game
          </button>
        </div>
      )}

      {mode === "create" && (
        <form className="grid gap-3" onSubmit={handleCreateSubmit}>
          <input
            autoFocus
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder:text-zinc-400"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <button
              className="rounded-lg bg-zinc-800 px-5 py-3 font-bold text-white transition hover:bg-zinc-700"
              onClick={() => setMode("menu")}
              type="button"
            >
              Back
            </button>
            <button
              className="rounded-lg bg-yellow-400 px-5 py-3 font-bold text-black transition hover:bg-yellow-300"
              type="submit"
            >
              Start Game
            </button>
          </div>
        </form>
      )}

      {mode === "join" && (
        <form className="grid gap-3" onSubmit={handleJoinSubmit}>
          <input
            autoFocus
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder:text-zinc-400"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder:text-zinc-400"
            placeholder="Game ID"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
          />
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <button
              className="rounded-lg bg-zinc-800 px-5 py-3 font-bold text-white transition hover:bg-zinc-700"
              onClick={() => setMode("menu")}
              type="button"
            >
              Back
            </button>
            <button
              className="rounded-lg bg-yellow-400 px-5 py-3 font-bold text-black transition hover:bg-yellow-300"
              type="submit"
            >
              Join
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default GameLobby;
