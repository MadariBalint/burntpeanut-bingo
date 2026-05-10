import GameLobby from "./components/GameLobby";
import PlayerBoard from "./components/PlayerBoard";
import WinnerModal from "./components/WinnerModal";
import { useBingoGame } from "./hooks/useBingoGame";
import { hasPlayAgainVote } from "./utils/playAgain";

export default function App() {
  const {
    copiedGameId,
    copyGameId,
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
    toggleCell,
    votePlayAgain,
  } = useBingoGame();

  const currentPlayer = players.find((player) => player.id === currentPlayerId);

  if (isRestoringSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-center text-white">
        <p className="font-semibold text-zinc-300">Loading your game...</p>
      </div>
    );
  }

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

      <div className="mb-6 flex flex-wrap items-center justify-center gap-2 text-zinc-300">
        <span>Share this Game ID:</span>
        <strong className="break-all text-yellow-400">{game.id}</strong>
        <button
          aria-label={copiedGameId === game.id ? "Game ID copied" : "Copy Game ID"}
          className="inline-flex size-10 items-center justify-center rounded-lg bg-zinc-800 text-white transition hover:bg-zinc-700"
          onClick={copyGameId}
          title={copiedGameId === game.id ? "Copied" : "Copy Game ID"}
          type="button"
        >
          <svg
            aria-hidden="true"
            className={copiedGameId === game.id ? "text-yellow-300" : ""}
            fill="none"
            height="20"
            viewBox="0 0 24 24"
            width="20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8 8H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
            <path
              d="M10 4h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </button>
      </div>

      {game.winner && (
        <p className="mb-6 font-semibold text-yellow-300">Game finished</p>
      )}

      {error && <p className="mb-4 font-semibold text-red-400">{error}</p>}

      <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
        <span className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 font-bold text-zinc-200">
          Round {game.round_number ?? 1}
        </span>
        <button
          className="rounded-lg border border-red-400/60 bg-red-500/10 px-4 py-2 font-bold text-red-300 transition hover:bg-red-500/20"
          onClick={deleteGameAndReturnToLobby}
          type="button"
        >
          Return to Lobby
        </button>
      </div>

      <PlayerBoard
        game={game}
        players={players}
        currentPlayerId={currentPlayerId}
        onToggleCell={toggleCell}
      />

      {game.winner && dismissedWinner !== game.winner && (
        <WinnerModal
          game={game}
          hasVoted={hasPlayAgainVote(currentPlayer)}
          onClose={() => setDismissedWinner(game.winner)}
          onPlayAgain={votePlayAgain}
        />
      )}

      {copiedGameId === game.id && (
        <div
          className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-lg border border-yellow-300/40 bg-zinc-900 px-4 py-3 font-semibold text-yellow-300 shadow-xl"
          role="status"
        >
          Game ID copied
        </div>
      )}
    </main>
  );
}
