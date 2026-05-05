import { useState } from "react";

function GameLobby({ onCreateGame, onJoinGame }) {
  const [name, setName] = useState("");
  const [gameId, setGameId] = useState("");

  return (
    <div className="mx-auto max-w-xl px-6 py-12 text-center text-white">
      <h1 className="mb-8 text-4xl font-bold">TheBurntPeanut Bingo</h1>
      <input
        className="m-2 rounded-lg px-4 py-3 text-white placeholder:text-white"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button
        className="m-2 rounded-lg bg-yellow-400 px-5 py-3 font-bold text-black hover:bg-yellow-300"
        onClick={() => onCreateGame(name)}
      >
        Create Game
      </button>

      <hr className="my-8 border-zinc-700" />

      <input
        className="m-2 rounded-lg px-4 py-3 text-white placeholder:text-white"
        placeholder="Game ID"
        value={gameId}
        onChange={(e) => setGameId(e.target.value)}
      />
      <button
        className="m-2 rounded-lg bg-zinc-700 px-5 py-3 font-bold text-white hover:bg-zinc-600"
        onClick={() => onJoinGame(gameId, name)}
      >
        Join Game
      </button>
    </div>
  );
}

export default GameLobby;
