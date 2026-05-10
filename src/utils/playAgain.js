export function hasPlayAgainVote(player) {
  return player?.voted === playAgainVote;
}

export const playAgainVote = "play_again";
export const noPlayAgainVote = "";
