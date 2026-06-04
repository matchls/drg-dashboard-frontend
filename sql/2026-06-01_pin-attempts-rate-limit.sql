-- Migration : table pin_attempts — anti-brute-force du PIN (#30)
--
-- Le PIN est l'UNIQUE facteur d'authentification du projet. Sa vérification
-- (verifyPIN) n'imposait aucune limite : 10 000 combinaisons (4 chiffres)
-- restaient atteignables. Cette table fournit un compteur d'échecs DURABLE et
-- PARTAGÉ entre toutes les instances serverless (contrairement au limiteur en
-- mémoire de lib/rateLimit.ts, qui ne survit pas à une instance froide sur Vercel).
--
-- À exécuter dans le SQL Editor de Supabase, en LISANT chaque bloc.

-- ── Étape 1 — CRÉER la table ────────────────────────────────────────────────────
-- Une ligne par couple (joueur, IP). Le verrou est porté par locked_until :
-- tant que cet instant est dans le futur, toute tentative est refusée AVANT bcrypt.
create table if not exists pin_attempts (
  player_name     text        not null,            -- normalisé en MAJUSCULES (identité)
  ip              text        not null,            -- 1er IP de x-forwarded-for
  failed_count    int         not null default 0,  -- échecs dans la fenêtre courante
  first_failed_at timestamptz not null default now(), -- début de la fenêtre glissante
  locked_until    timestamptz,                     -- null = pas verrouillé
  updated_at      timestamptz not null default now(),
  primary key (player_name, ip)
);

-- ── Étape 2 — VERROUILLER l'accès anon (RLS) ─────────────────────────────────────
-- On active RLS SANS définir la moindre policy : par défaut, plus personne ne
-- peut lire/écrire cette table... sauf la clé service_role (supabaseAdmin), qui
-- IGNORE les RLS. C'est exactement ce qu'on veut : seul le serveur y touche.
-- Aucun client navigateur (clé anon) ne doit voir ni manipuler ces compteurs.
alter table pin_attempts enable row level security;

-- ── Étape 3 — FONCTION RPC ATOMIQUE : record_pin_failure ────────────────────────
-- Remplace le read-modify-write applicatif de lib/pinThrottle.ts.
-- SELECT ... FOR UPDATE verrouille la ligne avant modification : deux appels
-- concurrents pour le même (player_name, ip) s'exécutent en séquence, pas en
-- parallèle, ce qui garantit que chaque échec est compté exactement une fois.
-- Pour deux premiers inserts simultanés (ligne absente), ON CONFLICT DO UPDATE
-- couvre la race condition résiduelle.
create or replace function record_pin_failure(
  p_player_name text,
  p_ip          text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  -- Constantes identiques à lib/pinThrottle.ts
  v_window_ms    constant bigint := 15 * 60 * 1000;      -- 15 min
  v_max_failures constant int    := 5;
  v_max_lock_ms  constant bigint := 24 * 60 * 60 * 1000; -- 24 h

  v_now     timestamptz := now();
  v_old     record;
  v_count   int;
  v_first   timestamptz;
  v_lock    timestamptz;
  v_steps   int;
  v_lock_ms bigint;
begin
  -- Verrouille la ligne existante pour empêcher toute lecture concurrente
  select failed_count, first_failed_at, locked_until
  into v_old
  from pin_attempts
  where player_name = p_player_name and ip = p_ip
  for update;

  if found then
    -- Fenêtre glissante expirée → repart à 1
    if extract(epoch from (v_now - v_old.first_failed_at)) * 1000 > v_window_ms then
      v_count := 1;
      v_first := v_now;
    else
      v_count := v_old.failed_count + 1;
      v_first := v_old.first_failed_at;
    end if;

    -- Backoff exponentiel identique à lockDurationMs() côté TypeScript
    if v_count >= v_max_failures then
      v_steps   := v_count - v_max_failures;
      v_lock_ms := least(v_window_ms * power(2, v_steps)::bigint, v_max_lock_ms);
      v_lock    := v_now + make_interval(secs => (v_lock_ms / 1000.0));
    else
      v_lock := v_old.locked_until;
    end if;

    update pin_attempts set
      failed_count    = v_count,
      first_failed_at = v_first,
      locked_until    = v_lock,
      updated_at      = v_now
    where player_name = p_player_name and ip = p_ip;
  else
    -- Première tentative pour ce couple (joueur, IP)
    v_count := 1;
    v_first := v_now;
    v_lock  := null; -- 1 échec ne déclenche pas de verrou (max_failures = 5)

    -- ON CONFLICT gère la race condition entre deux INSERT simultanés (ligne absente)
    insert into pin_attempts (player_name, ip, failed_count, first_failed_at, locked_until, updated_at)
    values (p_player_name, p_ip, v_count, v_first, v_lock, v_now)
    on conflict (player_name, ip) do update set
      failed_count = pin_attempts.failed_count + 1,
      updated_at   = v_now;
  end if;

  return jsonb_build_object(
    'failed_count', v_count,
    'locked_until', v_lock
  );
end;
$$;
