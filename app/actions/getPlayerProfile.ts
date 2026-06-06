"use server";
// getPlayerProfile — Lecture du profil joueur CÔTÉ SERVEUR (#31, Partie A).
//
// Avant : la page profil et la démo lisaient `raw_data` directement avec la clé
// anon → n'importe qui pouvait moissonner en boucle le JSON intégral de tous les
// joueurs. On route désormais la lecture par le serveur (service_role), et on
// révoque l'accès anon à `raw_data` au niveau base (voir la migration SQL).
//
// On ne renvoie qu'un joueur à la fois, et `raw_data` est typé DashboardData :
// cette structure ne contient que des stats (aucun SteamID ni chemin de fichier).
import { supabaseAdmin } from "@/lib/supabaseServer";
import { DashboardData } from "@/lib/types";

export async function getPlayerProfile(
  rawName: string,
): Promise<DashboardData | null> {
  const name = rawName.trim();
  if (!name) return null;

  // Étape 1 — identifier le joueur sans charger raw_data.
  // ilike est insensible à la casse mais traite % et _ comme des jokers :
  // on projette uniquement player_name pour éviter de charger raw_data sur
  // plusieurs lignes si le nom contient des wildcards.
  const { data: nameRows } = await supabaseAdmin
    .from("players")
    .select("player_name")
    .ilike("player_name", name);

  const exactName = nameRows?.find(
    (p) => p.player_name.toUpperCase() === name.toUpperCase(),
  )?.player_name;

  if (!exactName) return null;

  // Étape 2 — charger raw_data pour le seul joueur confirmé, par égalité exacte.
  // eq n'interprète jamais % ou _ comme jokers → un seul résultat possible.
  const { data } = await supabaseAdmin
    .from("players")
    .select("raw_data")
    .eq("player_name", exactName)
    .single();

  return (data?.raw_data as DashboardData) ?? null;
}
