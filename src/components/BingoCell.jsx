const ownColorClasses = {
  blue: "border-sky-300 bg-sky-500 text-white shadow-sky-500/30",
  red: "border-rose-300 bg-rose-500 text-white shadow-rose-500/30",
};

const opponentColorClasses = {
  blue: "border-sky-400/60 bg-sky-500/35 text-white",
  red: "border-rose-400/60 bg-rose-500/35 text-white",
};

function BingoCell({ cell, opponentMarks, playerColor, onClick }) {
  const opponentColor = opponentMarks[0];
  const isMarkedByPlayer = cell.marked || cell.free;
  const statusClasses = isMarkedByPlayer
    ? `${ownColorClasses[playerColor]} font-bold shadow-lg`
    : opponentColor
      ? opponentColorClasses[opponentColor]
      : "border-zinc-600 bg-zinc-800 text-white hover:bg-zinc-700";

  return (
    <button
      className={`aspect-square min-h-16 rounded-lg border-2 p-1 text-[10px] leading-tight transition sm:min-h-24 sm:p-2 sm:text-xs ${statusClasses}
        ${cell.free ? "cursor-not-allowed" : "cursor-pointer"}`}
      onClick={onClick}
      disabled={cell.free}
    >
      {cell.free ? "FREE" : cell.text}
    </button>
  );
}

export default BingoCell;
