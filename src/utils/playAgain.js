export function hasPlayAgainVote(player) {
  return Array.isArray(player?.marked) && player.marked.includes("play_again");
}

export const playAgainVote = ["play_again"];
