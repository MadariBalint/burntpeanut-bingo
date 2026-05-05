import BingoCell from "./BingoCell";

function BingoBoard({ board, onToggleCell }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {board.map((cell, index) => (
        <BingoCell
          key={`${cell.id}-${index}`}
          cell={cell}
          onClick={() => onToggleCell(index)}
        />
      ))}
    </div>
  );
}

export default BingoBoard;
