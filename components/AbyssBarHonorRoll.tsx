"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface HonorEntry {
  label: string;
  playerName: string | null;
  value: number;
  unit: string;
}

export default function AbyssBarHonorRoll() {
  const [honors, setHonors] = useState<HonorEntry[]>([]);

  useEffect(() => {
    async function fetchHonors() {
      // Une requête par stat pour trouver le max
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

      setHonors([
        {
          label: "PLUS GROS TIPSEUR",
          playerName: tips.data?.player_name ?? null,
          value: tips.data?.bartender_tips ?? 0,
          unit: "crédits",
        },
        {
          label: "PLUS GRAND BUVEUR",
          playerName: beers.data?.player_name ?? null,
          value: beers.data?.beers_consumed ?? 0,
          unit: "bières",
        },
        {
          label: "PLUS DE TOURNÉES",
          playerName: rounds.data?.player_name ?? null,
          value: rounds.data?.rounds_ordered ?? 0,
          unit: "tournées",
        },
      ]);
    }
    fetchHonors();
  }, []);

  return (
    <div className="industrial-panel p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3 border-b-4 border-outline pb-3">
        <span className="material-symbols-outlined text-primary">
          emoji_events
        </span>
        <p className="font-display text-xl text-on-surface tracking-widest">
          MENTIONS SPÉCIALES
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {honors.map((h) => (
          <div
            key={h.label}
            className="flex flex-col gap-1 border-l-2 border-drg-orange pl-3"
          >
            <p className="font-mono text-xs text-on-surface-variant tracking-widest">
              {h.label}
            </p>
            <p className="font-display text-lg text-drg-orange">
              {h.playerName ?? "—"}
            </p>
            <p className="font-mono text-xs text-on-surface">
              {h.value.toLocaleString()} {h.unit}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
