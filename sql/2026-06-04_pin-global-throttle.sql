-- Migration : throttle global par joueur (anti-rotation d'IP)
--
-- Complète le throttle par (player_name, ip) de 2026-06-01.
-- Problème : un attaquant changeant d'IP obtient un nouveau quota à chaque fois
-- (5 essais/IP × N IPs). Ce fichier ajoute un compteur global par joueur, toutes
-- IP confondues, qui plafonne le total même en cas de rotation de proxies/VPN.
--
-- Prérequis : 2026-06-01_pin-attempts-rate-limit.sql déjà exécuté.
-- À exécuter dans le SQL Editor de Supabase, en LISANT chaque bloc.

-- ── Étape 1 — TABLE pin_global_attempts ──────────────────────────────────────
-- Une ligne par joueur (toutes IP confondues). Complète pin_attempts sans la remplacer.
-- Le seuil global est plus tolérant (20 échecs / 1 h) pour éviter les faux positifs
-- sur des joueurs légitimes qui changent d'IP naturellement (domicile → mobile → bureau).
create table if not exists pin_global_attempts (
  player_name     text        not null primary key,
  global_count    int         not null default 0,
  first_failed_at timestamptz not null default now(),
  locked_until    timestamptz,
  updated_at      timestamptz not null default now()
);

-- Même politique RLS que pin_attempts : aucune policy → seul service_role y accède.
alter table pin_global_attempts enable row level security;

-- ── Étape 2 — REMPLACE record_pin_failure pour inclure le compteur global ────
-- CREATE OR REPLACE : même signature, retour étendu avec les champs global_*.
-- La mise à jour des deux tables se fait dans la même transaction Postgres :
-- aucune fenêtre de désynchronisation entre les deux compteurs.
create or replace function record_pin_failure(
  p_player_name text,
  p_ip          text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  -- ── Constantes par IP (inchangées) ─────────────────────────────────────────
  v_window_ms    constant bigint := 15 * 60 * 1000;       -- 15 min
  v_max_failures constant int    := 5;
  v_max_lock_ms  constant bigint := 24 * 60 * 60 * 1000;  -- 24 h

  -- ── Constantes globales ─────────────────────────────────────────────────────
  -- Fenêtre 4× plus large et seuil 4× plus tolérant qu'une IP seule.
  v_g_window_ms    constant bigint := 60 * 60 * 1000;  -- 1 h
  v_g_max_failures constant int    := 20;

  v_now timestamptz := now();

  -- ── État par IP ─────────────────────────────────────────────────────────────
  v_old     record;
  v_count   int;
  v_first   timestamptz;
  v_lock    timestamptz;
  v_steps   int;
  v_lock_ms bigint;

  -- ── État global ─────────────────────────────────────────────────────────────
  v_g_old   record;
  v_g_count int;
  v_g_first timestamptz;
  v_g_lock  timestamptz;
begin
  -- ── 1. Compteur par IP (logique originale) ──────────────────────────────────
  select failed_count, first_failed_at, locked_until
  into v_old
  from pin_attempts
  where player_name = p_player_name and ip = p_ip
  for update;

  if found then
    if extract(epoch from (v_now - v_old.first_failed_at)) * 1000 > v_window_ms then
      v_count := 1;
      v_first := v_now;
    else
      v_count := v_old.failed_count + 1;
      v_first := v_old.first_failed_at;
    end if;

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
    v_count := 1;
    v_first := v_now;
    v_lock  := null;

    -- ON CONFLICT gère la race condition entre deux INSERT simultanés (ligne absente).
    -- RETURNING récupère la valeur réelle après conflit.
    insert into pin_attempts (player_name, ip, failed_count, first_failed_at, locked_until, updated_at)
    values (p_player_name, p_ip, v_count, v_first, v_lock, v_now)
    on conflict (player_name, ip) do update set
      failed_count = pin_attempts.failed_count + 1,
      updated_at   = v_now
    returning failed_count into v_count;
  end if;

  -- ── 2. Compteur global par joueur (nouveau) ─────────────────────────────────
  -- SELECT … FOR UPDATE : même garantie d'atomicité que pour le compteur par IP.
  select global_count, first_failed_at, locked_until
  into v_g_old
  from pin_global_attempts
  where player_name = p_player_name
  for update;

  if found then
    if extract(epoch from (v_now - v_g_old.first_failed_at)) * 1000 > v_g_window_ms then
      v_g_count := 1;
      v_g_first := v_now;
    else
      v_g_count := v_g_old.global_count + 1;
      v_g_first := v_g_old.first_failed_at;
    end if;

    if v_g_count >= v_g_max_failures then
      v_steps   := v_g_count - v_g_max_failures;
      v_lock_ms := least(v_g_window_ms * power(2, v_steps)::bigint, v_max_lock_ms);
      v_g_lock  := v_now + make_interval(secs => (v_lock_ms / 1000.0));
    else
      v_g_lock := v_g_old.locked_until;
    end if;

    update pin_global_attempts set
      global_count    = v_g_count,
      first_failed_at = v_g_first,
      locked_until    = v_g_lock,
      updated_at      = v_now
    where player_name = p_player_name;
  else
    v_g_count := 1;
    v_g_first := v_now;
    v_g_lock  := null;

    insert into pin_global_attempts (player_name, global_count, first_failed_at, locked_until, updated_at)
    values (p_player_name, v_g_count, v_g_first, v_g_lock, v_now)
    on conflict (player_name) do update set
      global_count = pin_global_attempts.global_count + 1,
      updated_at   = v_now
    returning global_count into v_g_count;
  end if;

  return jsonb_build_object(
    'failed_count',        v_count,
    'locked_until',        v_lock,
    'global_count',        v_g_count,
    'global_locked_until', v_g_lock
  );
end;
$$;

-- ── Étape 3 — PERMISSIONS ─────────────────────────────────────────────────────
-- CREATE OR REPLACE peut réinitialiser les GRANTs selon la version Postgres.
-- On ré-applique systématiquement les restrictions sur la RPC.
revoke execute on function record_pin_failure(text, text) from public;
grant  execute on function record_pin_failure(text, text) to service_role;
