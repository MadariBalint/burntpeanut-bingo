import BingoCell from "./BingoCell";

function BingoBoard({
  board,
  opponents = [],
  playerColor,
  getOpponentColor,
  onToggleCell,
}) {
  return (
    <div className="grid w-full grid-cols-5 gap-1.5 sm:gap-2 md:gap-3">
      {board.map((cell, index) => (
        <BingoCell
          key={`${cell.id}-${index}`}
          cell={cell}
          playerColor={playerColor}
          opponentMarks={opponents
            .filter((opponent) => opponent.board?.[index]?.marked)
            .map((opponent) => getOpponentColor(opponent))}
          onClick={() => onToggleCell(index)}
        />
      ))}
    </div>
  );
}

export default BingoBoard;
