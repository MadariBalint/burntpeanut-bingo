const winnerColorClasses = {
  blue: "text-sky-300",
  red: "text-rose-300",
};

function getWinnerColor(game) {
  return game?.winner === game?.player2_name ? "red" : "blue";
}

function WinnerModal({ game, hasVoted, onClose, onPlayAgain }) {
  const winnerColor = getWinnerColor(game);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div
        className="w-full max-w-md rounded-lg border border-zinc-700 bg-zinc-900 p-6 text-center shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="winner-title"
      >
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-yellow-300">
          Bingo
        </p>
        <h2 id="winner-title" className="mb-3 text-3xl font-bold text-white">
          Winner
        </h2>
        <p className={`mb-6 text-4xl font-bold ${winnerColorClasses[winnerColor]}`}>
          {game.winner}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            className="rounded-lg bg-yellow-400 px-5 py-3 font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-70"
            onClick={onPlayAgain}
            disabled={hasVoted}
          >
            {hasVoted ? "Voted" : "Play Again"}
          </button>
          <button
            className="rounded-lg bg-zinc-800 px-5 py-3 font-bold text-white transition hover:bg-zinc-700"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default WinnerModal;
