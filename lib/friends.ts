// Gestion de la liste d'amis en localStorage
// Les noms sont stockés en majuscules pour correspondre à player_name dans Supabase

const KEY = "drg_friends";

export function getFriends(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function addFriend(name: string): void {
  const normalized = name.trim().toUpperCase();
  const friends = getFriends();
  if (!friends.includes(normalized)) {
    localStorage.setItem(KEY, JSON.stringify([...friends, normalized]));
  }
}

export function removeFriend(name: string): void {
  const normalized = name.trim().toUpperCase();
  localStorage.setItem(
    KEY,
    JSON.stringify(getFriends().filter((f) => f !== normalized)),
  );
}

export function isFriend(name: string): boolean {
  return getFriends().includes(name.trim().toUpperCase());
}
