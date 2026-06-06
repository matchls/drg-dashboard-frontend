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

  // Étape 1 — identifier le joueur sans charger pin_hash.
  // ilike est insensible à la casse mais traite % et _ comme jokers : on
  // projette uniquement player_name pour rester cohérent avec getPlayerProfile.
  const { data: nameRows } = await supabaseAdmin
    .from("players")
    .select("player_name")
    .ilike("player_name", name);

  const exactName = nameRows?.find(
    (p) => p.player_name.toUpperCase() === name.toUpperCase(),
  )?.player_name;

  if (!exactName) return null;

  // Étape 2 — charger pin_hash par égalité exacte sur le nom confirmé.
  const { data } = await supabaseAdmin
    .from("players")
    .select("player_name, pin_hash")
    .eq("player_name", exactName)
    .single();

  return data ?? null;
}
