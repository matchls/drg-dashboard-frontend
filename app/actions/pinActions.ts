"use server";
import bcrypt from "bcryptjs";
import { findPlayerByName } from "@/lib/playerLookup";

// Toutes les lectures liées au PIN passent par le client serveur (service_role,
// dans findPlayerByName) et sont INSENSIBLES À LA CASSE : un pseudo est une
// identité, "Bob" et "BOB" désignent la même personne.

// Vérifie si un joueur existe et s'il a déjà un PIN
export async function checkPlayer(
  playerName: string,
): Promise<{ exists: boolean; hasPIN: boolean }> {
  const player = await findPlayerByName(playerName);
  if (!player) return { exists: false, hasPIN: false };
  return { exists: true, hasPIN: !!player.pin_hash };
}

// Vérifie que le PIN saisi correspond au hash stocké
export async function verifyPIN(
  playerName: string,
  pin: string,
): Promise<{ valid: boolean }> {
  const player = await findPlayerByName(playerName);
  if (!player?.pin_hash) return { valid: false };

  const valid = await bcrypt.compare(pin, player.pin_hash);
  return { valid };
}
