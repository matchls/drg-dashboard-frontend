import "server-only";
// pinThrottle.ts — Anti-brute-force DURABLE du PIN (#30).
//
// Le PIN est l'unique facteur d'auth. Contrairement à lib/rateLimit.ts (en
// mémoire, perdu à chaque instance froide Vercel), l'état vit ici dans la table
// Supabase `pin_attempts` : il est PARTAGÉ entre toutes les instances serverless.
//
// L'incrément des échecs est délégué à la RPC Postgres `record_pin_failure`
// (cf. sql/2026-06-01_pin-attempts-rate-limit.sql). La RPC utilise
// SELECT … FOR UPDATE pour garantir qu'aucune tentative concurrente ne peut
// être sous-comptée (#93).
import { supabaseAdmin } from "./supabaseServer";

/**
 * checkPinLock — le couple (joueur, IP) est-il actuellement verrouillé ?
 * À appeler AVANT bcrypt, pour ne pas offrir d'oracle de timing.
 */
export async function checkPinLock(
  playerName: string,
  ip: string,
): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("pin_attempts")
    .select("locked_until")
    .eq("player_name", playerName)
    .eq("ip", ip)
    .maybeSingle();

  const lockedUntil = data?.locked_until;
  return !!lockedUntil && new Date(lockedUntil).getTime() > Date.now();
}

/**
 * recordFailure — enregistre un échec via la RPC atomique Postgres.
 * L'incrément, le calcul de fenêtre et le verrou sont entièrement délégués
 * à record_pin_failure (SELECT FOR UPDATE) : aucune race condition possible.
 */
export async function recordFailure(
  playerName: string,
  ip: string,
): Promise<void> {
  const { data, error } = await supabaseAdmin.rpc("record_pin_failure", {
    p_player_name: playerName,
    p_ip: ip,
  });

  if (error) {
    // On log mais on ne fait pas échouer la vérification pour autant :
    // un souci de compteur ne doit pas rendre l'auth indisponible.
    console.error("pinThrottle.recordFailure:", error);
    return;
  }

  const result = data as { failed_count: number; locked_until: string | null };
  const { failed_count: failedCount, locked_until: lockedUntil } = result;

  // Journalisation serveur des échecs (sans révéler quoi que ce soit au client).
  console.warn(
    `[pin] échec #${failedCount} pour "${playerName}" depuis ${ip}` +
      (lockedUntil ? ` — verrouillé jusqu'à ${lockedUntil}` : ""),
  );
}

/**
 * clearAttempts — PIN correct : on efface le compteur pour repartir propre.
 */
export async function clearAttempts(
  playerName: string,
  ip: string,
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("pin_attempts")
    .delete()
    .eq("player_name", playerName)
    .eq("ip", ip);

  if (error) console.error("pinThrottle.clearAttempts:", error);
}
