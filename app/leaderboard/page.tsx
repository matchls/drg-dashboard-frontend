"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface PlayerRow {
  player_name: string;
  total_missions: number;
  total_kills: number;
  total_time_s: number;
  total_distance_cm: number;
  total_downs: number;
}

// Calcule le badge de statut selon le nombre de missions
function getStatusBadge(missions: number): {
  label: string;
  className: string;
} {
  if (missions >= 2000)
    return {
      label: "LEGENDARY",
      className: "bg-primary text-on-primary px-2 py-0.5",
    };
  if (missions >= 500)
    return {
      label: "PRODUCTIVE",
      className: "border border-tertiary text-tertiary px-2 py-0.5",
    };
  if (missions >= 100)
    return {
      label: "ADEQUATE",
      className:
        "border border-outline-variant text-on-surface-variant px-2 py-0.5",
    };
  return {
    label: "CRITICAL SLACKER",
    className: "border border-error text-error px-2 py-0.5",
  };
}

// Couleurs du podium : or / argent / bronze
function getPodiumStyle(rank: number): string {
  if (rank === 1)
    return "border-[#FFD700] bg-[#FFD700]/10 scale-105 shadow-lg shadow-[#FFD700]/20";
  if (rank === 2) return "border-[#C0C0C0] bg-[#C0C0C0]/10";
  return "border-[#A52A2A] bg-[#A52A2A]/10";
}

export default function LeaderboardPage() {
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [currentPlayerName, setCurrentPlayerName] = useState<string | null>(
    null,
  );
  const [clock, setClock] = useState("");

  // Horloge live — mise à jour chaque seconde
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("fr-FR"));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Nom du joueur connecté depuis sessionStorage
  useEffect(() => {
    const data = sessionStorage.getItem("dashboardData");
    if (data) {
      const parsed = JSON.parse(data);
      setCurrentPlayerName(parsed.player?.name ?? null);
    }
  }, []);

  // Fetch Supabase — trié par missions
  useEffect(() => {
    async function fetchPlayers() {
      const { data, error } = await supabase
        .from("players")
        .select(
          "player_name, total_missions, total_kills, total_time_s, total_distance_cm, total_downs",
        )
        .order("total_missions", { ascending: false });
      if (error) console.error(error);
      else setPlayers(data ?? []);
    }
    fetchPlayers();
  }, []);

  const top3 = players.slice(0, 3);
  return (
    <div className="min-h-screen bg-background scanline-overlay p-6 flex flex-col gap-6">
      {/* Podium Top 3 */}
      <div className="flex gap-4 justify-center">
        {top3.map((player, i) => {
          const badge = getStatusBadge(player.total_missions);
          return (
            <div
              key={player.player_name}
              className={`industrial-panel flex-1 max-w-xs p-6 flex flex-col items-center gap-2 border-4 transition-transform ${getPodiumStyle(i + 1)}`}
            >
              <p className="font-mono text-xs text-on-surface-variant tracking-widest">
                #{i + 1}
              </p>
              <div className="w-16 h-16 bg-surface-container-highest border-4 border-outline flex items-center justify-center">
                <span className="font-display text-3xl text-primary">
                  {player.player_name[0].toUpperCase()}
                </span>
              </div>
              <p className="font-display text-xl text-on-surface tracking-widest text-center">
                {player.player_name}
              </p>
              <p className="font-mono text-sm text-on-surface-variant">
                {player.total_missions} missions
              </p>
              <span
                className={`font-mono text-xs tracking-widest ${badge.className}`}
              >
                {badge.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Table Company Spreadsheet */}
      <div className="industrial-panel">
        <div className="p-4 border-b-4 border-outline flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">list</span>
          <p className="font-display text-xl text-on-surface tracking-widest flex-1">
            COMPANY SPREADSHEET V.2.04
          </p>
          <p className="font-mono text-xs text-primary animate-pulse">
            SYNCING WITH MISSION CONTROL... [OK]
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-4 border-outline text-on-surface-variant font-mono text-xs tracking-widest uppercase">
                <th className="p-4 text-left">Rank</th>
                <th className="p-4 text-left">Miner Name</th>
                <th className="p-4 text-right">Missions</th>
                <th className="p-4 text-right">Kills</th>
                <th className="p-4 text-right">Minerals</th>
                <th className="p-4 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => {
                const isCurrentPlayer =
                  player.player_name === currentPlayerName;
                const badge = getStatusBadge(player.total_missions);
                return (
                  <tr
                    key={player.player_name}
                    className={`border-b border-outline transition-colors hover:bg-surface-container-high
                      ${isCurrentPlayer ? "bg-primary/5 text-primary" : "text-on-surface"}
                    `}
                  >
                    <td className="p-4 font-mono text-sm text-on-surface-variant">
                      {index + 1}
                    </td>
                    <td className="p-4 font-display text-lg tracking-widest">
                      {player.player_name}
                      {isCurrentPlayer && (
                        <span className="ml-2 font-mono text-xs text-primary">
                          [YOU]
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-mono text-sm text-right">
                      {player.total_missions.toLocaleString()}
                    </td>
                    <td className="p-4 font-mono text-sm text-right">
                      {player.total_kills.toLocaleString()}
                    </td>
                    <td className="p-4 font-mono text-sm text-right">
                      {player.total_distance_cm.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span
                        className={`font-mono text-xs tracking-widest ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {/* Avertissement final */}
              <tr>
                <td
                  colSpan={6}
                  className="p-4 font-mono text-xs text-error text-center tracking-widest"
                >
                  ⚠ SLACKERS WILL BE PROCESSED FOR LEAF-LOVER JUICE.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t-4 border-outline flex gap-4">
          <button className="border-4 border-outline text-on-surface-variant font-mono text-xs px-4 py-2 tracking-widest hover:bg-surface-container-high">
            PAGE UP
          </button>
          <button className="border-4 border-outline text-on-surface-variant font-mono text-xs px-4 py-2 tracking-widest hover:bg-surface-container-high">
            PAGE DOWN
          </button>
        </div>
      </div>
      {/* Sections placeholder */}
      <div className="grid grid-cols-2 gap-4">
        {/* Company Quota Fulfillment */}
        <div className="industrial-panel p-4 flex flex-col gap-4">
          <p className="font-display text-lg text-on-surface tracking-widest">
            COMPANY QUOTA FULFILLMENT
          </p>
          <div className="flex items-end gap-2 h-24">
            {[60, 85, 45, 95, 70].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-primary/20 border border-primary/40 relative"
              >
                <div
                  className="bg-primary absolute bottom-0 w-full"
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bounty Targets */}
        <div className="industrial-panel p-4 flex flex-col gap-4">
          <p className="font-display text-lg text-on-surface tracking-widest">
            BOUNTY TARGETS: HOXXES IV
          </p>
          {[
            { label: "GLYPHID DREADNOUGHT", value: 72 },
            { label: "CAVE LEECH CLUSTER", value: 41 },
          ].map((target) => (
            <div key={target.label} className="flex flex-col gap-1">
              <div className="flex justify-between font-mono text-xs text-on-surface-variant">
                <span>{target.label}</span>
                <span>{target.value}%</span>
              </div>
              <div className="h-3 bg-surface-container-highest border border-outline">
                <div
                  className="h-full bg-error"
                  style={{ width: `${target.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-surface-container border-t-4 border-outline flex items-center justify-between px-6 py-3">
        <p className="font-mono text-xs text-on-surface-variant tracking-widest">
          TERMINAL_ID: CR0-4 | OS: DRG_MAINFRAME_V4.2
        </p>
        <div className="flex items-center gap-4 font-mono text-xs text-on-surface-variant">
          <span>DEEP ROCK GALACTIC: WE DIG IT.</span>
          <span className="text-primary">{clock}</span>
        </div>
      </footer>
    </div>
  );
}
