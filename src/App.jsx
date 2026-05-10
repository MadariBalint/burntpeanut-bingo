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
      <div className="flex min-h-dvh items-center justify-center bg-zinc-950 px-4 text-center text-white sm:px-6">
        <p className="font-semibold text-zinc-300">Loading your game...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-dvh bg-zinc-950">
        <GameLobby onCreateGame={createGame} onJoinGame={joinGame} />

        {error && (
          <p className="px-4 text-center font-semibold text-red-400">{error}</p>
        )}
      </div>
    );
  }

  return (
    <main className="min-h-dvh bg-zinc-950 px-3 py-4 text-center text-white sm:px-6 sm:py-8">
      <h1 className="mb-3 text-3xl font-bold sm:mb-4 sm:text-4xl">
        TheBurntPeanut Bingo
      </h1>

      <div className="mx-auto mb-4 flex max-w-xl items-center justify-center gap-2 text-sm text-zinc-300 sm:mb-6 sm:text-base">
        <span className="shrink-0">Game ID:</span>
        <strong className="min-w-0 flex-1 truncate text-left text-yellow-400 sm:flex-none sm:break-all">
          {game.id}
        </strong>
        <button
          aria-label={copiedGameId === game.id ? "Game ID copied" : "Copy Game ID"}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-white transition hover:bg-zinc-700"
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
        <p className="mb-4 font-semibold text-yellow-300 sm:mb-6">
          Game finished
        </p>
      )}

      {error && <p className="mb-4 font-semibold text-red-400">{error}</p>}

      <div className="mb-4 flex flex-wrap items-center justify-center gap-2 sm:mb-6 sm:gap-3">
        <span className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-bold text-zinc-200 sm:px-4 sm:text-base">
          Round {game.round_number ?? 1}
        </span>
        <button
          className="rounded-lg border border-red-400/60 bg-red-500/10 px-3 py-2 text-sm font-bold text-red-300 transition hover:bg-red-500/20 sm:px-4 sm:text-base"
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
          className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-xs -translate-x-1/2 rounded-lg border border-yellow-300/40 bg-zinc-900 px-4 py-3 font-semibold text-yellow-300 shadow-xl sm:bottom-6"
          role="status"
        >
          Game ID copied
        </div>
      )}
    </main>
  );
}
