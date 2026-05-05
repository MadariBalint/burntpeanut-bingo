function BingoCell({ cell, onClick }) {
  return (
    <button
      className={`h-24 rounded-xl border-2 p-2 text-xs transition ${
        cell.marked
          ? "border-yellow-400 bg-yellow-400 font-bold text-black"
          : "border-zinc-600 bg-zinc-800 text-white hover:bg-zinc-700"
      }
        ${cell.free ? "cursor-not-allowed" : "cursor-pointer"}`}
      onClick={onClick}
      disabled={cell.free}
    >
      {cell.free ? "FREE" : cell.text}
    </button>
  );
}

export default BingoCell;
