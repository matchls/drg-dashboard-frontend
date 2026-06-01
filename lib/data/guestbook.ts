// lib/data/guestbook.ts — Couche d'accès aux données : table `guestbook` (lecture anon).
//
// La lecture du livre d'or reste en lecture seule via la clé anon (autorisée par
// les RLS). L'écriture passe par la server action saveGuestbookMessage (vérifiée
// côté serveur) — elle n'est donc pas dans cette couche de lecture.

import { supabase } from "@/lib/supabase";

export interface GuestbookEntry {
  player_name: string;
  message: string;
  updated_at: string;
}

// Tous les messages, du plus récent au plus ancien.
// Renvoie `null` si Supabase ne renvoie pas de données : l'appelant peut alors
// décider de conserver l'affichage courant (comportement identique à l'ancien code).
export async function fetchGuestbook(): Promise<GuestbookEntry[] | null> {
  const { data } = await supabase
    .from("guestbook")
    .select("player_name, message, updated_at")
    .order("updated_at", { ascending: false });
  return data;
}
