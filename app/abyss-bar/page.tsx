"use client";
import { useEffect, useState } from "react";
import { DashboardData } from "@/lib/types";
import AbyssBarGuestbook from "@/components/AbyssBarGuestbook";
import AbyssBarBadges from "@/components/AbyssBarBadges";
import AbyssBarHonorRoll from "@/components/AbyssBarHonorRoll";

export default function AbyssBarPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  // Nom connu (depuis une session active)
  const [guestName, setGuestName] = useState("");
  // Nom saisi manuellement par un visiteur sans save
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    const raw = sessionStorage.getItem("dashboardData");
    const savedName = sessionStorage.getItem("playerName") ?? "";

    if (raw) {
      const parsed = JSON.parse(raw);
      setData(parsed.data);
      setGuestName(parsed.data.player.name);
    } else if (savedName) {
      // Visiteur qui a déjà eu une session (ex: mode démo)
      setGuestName(savedName);
    }
  }, []);

  // Le nom actif : session connue en priorité, sinon saisie manuelle
  const activePlayerName = guestName || nameInput;

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="industrial-panel p-4 border-b-4 border-outline flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">
          local_bar
        </span>
        <p className="font-display text-2xl text-on-surface tracking-widest">
          ABYSS BAR
        </p>
      </div>

      <AbyssBarHonorRoll />

      {/* Badges — seulement si l'utilisateur a des données de session */}
      {data && (
        <div className="industrial-panel p-6">
          <AbyssBarBadges data={data} />
        </div>
      )}

      {/* Input pseudo pour les visiteurs sans save */}
      {!guestName && (
        <div className="industrial-panel p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">
            fingerprint
          </span>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="ENTER OPERATIVE ID TO LEAVE A MESSAGE"
            className="flex-1 bg-transparent border-b-2 border-drg-border text-on-surface font-mono text-sm py-1 focus:outline-none focus:border-drg-orange placeholder:text-on-surface-variant placeholder:text-xs"
          />
        </div>
      )}

      {/* Guestbook */}
      <div className="industrial-panel p-6">
        <AbyssBarGuestbook playerName={activePlayerName} />
      </div>
    </div>
  );
}
