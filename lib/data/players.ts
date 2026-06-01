// lib/data/players.ts — Couche d'accès aux données : table `players` (lectures anon).
//
// Analogie : c'est le "guichet" de la table players. Les composants ne parlent
// plus directement à Supabase ; ils demandent au guichet (fetchLeaderboard, etc.).
// Avantage : les noms de colonnes et la forme des requêtes vivent à UN seul endroit.
//
// ⚠️ Lectures anon UNIQUEMENT (clé publique, exécutables côté navigateur).
// La lecture de `raw_data` reste côté serveur via la server action getPlayerProfile
// (service_role) — voir app/actions/getPlayerProfile.ts. On ne la déplace pas ici
// pour ne pas tirer la clé service_role dans le bundle client.

import { supabase } from "@/lib/supabase";

// Type partagé d'une ligne du leaderboard (projection des colonnes utiles de `players`).
export interface PlayerRow {
  player_name: string;
  total_missions: number;
  total_kills: number;
  total_time_s: number;
  total_distance_cm: number;
  total_downs: number;
  total_minerals: number;
  driller_missions: number;
  gunner_missions: number;
  engineer_missions: number;
  scout_missions: number;
}

// Colonnes du leaderboard — jamais `.select("*")` (raw_data est lourd, cf. CLAUDE.md).
const LEADERBOARD_COLUMNS =
  "player_name, total_missions, total_kills, total_time_s, total_distance_cm, total_downs, total_minerals, driller_missions, gunner_missions, engineer_missions, scout_missions";

// Leaderboard complet, trié par missions décroissantes.
// Sur erreur : log + tableau vide (comportement identique à l'ancien code inline).
export async function fetchLeaderboard(): Promise<PlayerRow[]> {
  const { data, error } = await supabase
    .from("players")
    .select(LEADERBOARD_COLUMNS)
    .order("total_missions", { ascending: false });
  if (error) {
    console.error(error);
    return [];
  }
  return data ?? [];
}

// Une "mention spéciale" : le joueur en tête d'une stat et sa valeur.
export interface HonorRollEntry {
  playerName: string | null;
  value: number;
}

// Mentions spéciales de l'Abyss Bar (top 1 de chaque stat de bar).
export interface HonorRoll {
  tips: HonorRollEntry;
  beers: HonorRollEntry;
  rounds: HonorRollEntry;
}

// Récupère le leader de chaque stat de bar (une requête par stat, en parallèle).
export async function fetchHonorRoll(): Promise<HonorRoll> {
  const [tips, beers, rounds] = await Promise.all([
    supabase
      .from("players")
      .select("player_name, bartender_tips")
      .order("bartender_tips", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("players")
      .select("player_name, beers_consumed")
      .order("beers_consumed", { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from("players")
      .select("player_name, rounds_ordered")
      .order("rounds_ordered", { ascending: false })
      .limit(1)
      .single(),
  ]);

  return {
    tips: {
      playerName: tips.data?.player_name ?? null,
      value: tips.data?.bartender_tips ?? 0,
    },
    beers: {
      playerName: beers.data?.player_name ?? null,
      value: beers.data?.beers_consumed ?? 0,
    },
    rounds: {
      playerName: rounds.data?.player_name ?? null,
      value: rounds.data?.rounds_ordered ?? 0,
    },
  };
}
