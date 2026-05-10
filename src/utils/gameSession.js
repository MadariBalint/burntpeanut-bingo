const savedSessionKey = "burntpeanut-bingo-session";

export function getSavedSession() {
  try {
    return JSON.parse(localStorage.getItem(savedSessionKey));
  } catch {
    return null;
  }
}

export function saveSession(gameId, playerId) {
  localStorage.setItem(
    savedSessionKey,
    JSON.stringify({ gameId, playerId }),
  );
}

export function clearSavedSession() {
  localStorage.removeItem(savedSessionKey);
}

export function resetGameSession() {
  clearSavedSession();

  return {
    game: null,
    players: [],
    currentPlayerId: null,
    dismissedWinner: null,
    copiedGameId: "",
  };
}
