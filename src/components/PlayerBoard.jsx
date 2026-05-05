import BingoBoard from "./BingoBoard";

function PlayerBoard({ player, currentPlayerId, onToggleCell }) {
  const isCurrentPlayer = player.id === currentPlayerId;

  return (
    <div>
      <h2>
        {player.player_name} {player.has_won ? "🏆" : ""}
      </h2>

      <BingoBoard
        board={player.board}
        onToggleCell={isCurrentPlayer ? onToggleCell : () => {}}
      />
    </div>
  );
}

export default PlayerBoard;
