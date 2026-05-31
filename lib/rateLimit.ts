import "server-only";
// rateLimit.ts — Limiteur de débit EN MÉMOIRE (best-effort).
//
// Analogie : un videur qui compte les entrées par personne sur une fenêtre de temps.
//
// ⚠️ LIMITE IMPORTANTE : l'état vit dans la mémoire du processus. Sur Vercel
// (serverless), chaque instance a sa propre mémoire → ça bloque les floods naïfs
// (depuis une même instance "chaude") mais PAS une attaque distribuée.
// Une version durable (compteurs en base) viendra avec l'issue #30.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/**
 * @returns true si l'action est autorisée, false si la limite est dépassée.
 */
export function checkRateLimit(
  key: string,
  max: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  // Pas de compteur, ou fenêtre expirée → on (re)démarre à 1.
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  // Limite atteinte → refus.
  if (bucket.count >= max) return false;

  bucket.count++;
  return true;
}
