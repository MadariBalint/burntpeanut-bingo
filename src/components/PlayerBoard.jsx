import BingoBoard from "./BingoBoard";

function getPlayerColor(player, game) {
  return player?.player_name === game?.player2_name ? "red" : "blue";
}

const playerNameColorClasses = {
  blue: "text-sky-300",
  red: "text-rose-300",
};

function PlayerBoard({ game, players, currentPlayerId, onToggleCell }) {
  const player = players.find((currentPlayer) => currentPlayer.id === currentPlayerId);
  const opponents = players.filter(
    (currentPlayer) => currentPlayer.id !== currentPlayerId,
  );
  const player1Name = game?.player1_name || "Player 1";
  const player2Name = game?.player2_name || "Waiting...";
  const player1Score = game?.player1_score ?? 0;
  const player2Score = game?.player2_score ?? 0;

  if (!player) {
    return <p className="text-zinc-300">Loading your board...</p>;
  }

  const playerColor = getPlayerColor(player, game);

  return (
    <section className="mx-auto w-full max-w-[min(100%,38rem)]">
      <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:mb-4 sm:gap-3">
        <h2 className="min-w-0 text-right text-base font-bold sm:text-xl">
          <span className={playerNameColorClasses.blue}>
            {player1Name} ({player1Score})
          </span>{" "}
          {game?.winner === player1Name ? (
            <span className="text-yellow-300">Winner</span>
          ) : null}
        </h2>

        <span className="text-xs font-semibold uppercase text-zinc-400 sm:text-sm">
          vs
        </span>

        <div className="min-w-0 text-left">
          <h2 className="text-base font-bold sm:text-xl">
            <span className={playerNameColorClasses.red}>
              {player2Name} ({player2Score})
            </span>{" "}
            {game?.winner === player2Name ? (
              <span className="text-yellow-300">Winner</span>
            ) : null}
          </h2>
        </div>
      </div>

      <BingoBoard
        board={player.board}
        opponents={opponents}
        playerColor={playerColor}
        getOpponentColor={(opponent) => getPlayerColor(opponent, game)}
        onToggleCell={onToggleCell}
      />
    </section>
  );
}

export default PlayerBoard;
