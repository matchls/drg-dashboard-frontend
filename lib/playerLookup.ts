import "server-only";
import { supabaseAdmin } from "./supabaseServer";

// findPlayerByName — Recherche un joueur par pseudo, SANS tenir compte de la casse.
//
// Un pseudo est une identité : "Poussif", "poussif" et "POUSSIF" désignent la
// même personne. Toute vérification d'identité (livre d'or, upload, PIN) doit
// donc comparer de façon insensible à la casse, sinon un invité peut usurper
// un joueur stocké dans une autre casse.

export type PlayerRecord = { player_name: string; pin_hash: string | null };

export async function findPlayerByName(
  rawName: string,
): Promise<PlayerRecord | null> {
  const name = rawName.trim();
  if (!name) return null;

  const { data } = await supabaseAdmin
    .from("players")
    .select("player_name, pin_hash")
    .ilike("player_name", name); // insensible à la casse

  // ilike traite % et _ comme des jokers → on reconfirme par une égalité exacte
  // insensible à la casse (fail closed : au pire on sur-bloque, jamais l'inverse).
  return (
    data?.find((p) => p.player_name.toUpperCase() === name.toUpperCase()) ?? null
  );
}
