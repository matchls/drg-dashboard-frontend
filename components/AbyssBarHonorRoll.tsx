"use client";
import { useEffect, useState } from "react";
import { fetchHonorRoll } from "@/lib/data/players";

interface HonorEntry {
  label: string;
  playerName: string | null;
  value: number;
  unit: string;
}

export default function AbyssBarHonorRoll() {
  const [honors, setHonors] = useState<HonorEntry[]>([]);

  useEffect(() => {
    async function loadHonors() {
      const roll = await fetchHonorRoll();
      setHonors([
        {
          label: "PLUS GROS TIPSEUR",
          playerName: roll.tips.playerName,
          value: roll.tips.value,
          unit: "crédits",
        },
        {
          label: "PLUS GRAND BUVEUR",
          playerName: roll.beers.playerName,
          value: roll.beers.value,
          unit: "bières",
        },
        {
          label: "PLUS DE TOURNÉES",
          playerName: roll.rounds.playerName,
          value: roll.rounds.value,
          unit: "tournées",
        },
      ]);
    }
    loadHonors();
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
