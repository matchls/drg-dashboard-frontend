"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import QuoteTypewriter from "@/components/QuoteTypewriter";

export default function TopBar() {
  const [playerName, setPlayerName] = useState("OPERATIVE");

  useEffect(() => {
    const data = sessionStorage.getItem("dashboardData");
    if (data) {
      const parsed = JSON.parse(data);
      // sessionStorage contient un ApiResponse : { ok, data: DashboardData }
      setPlayerName(parsed.data?.player?.name ?? "OPERATIVE");
    }
  }, []);

  return (
    <header className="h-14 bg-surface-container-high border-b-4 border-outline flex items-center px-6 gap-4">
      {/* Nom du joueur — fixe à gauche */}
      <p className="font-display text-xl text-on-surface tracking-widest shrink-0">
        {playerName}
      </p>

      {/* Citation animée — prend tout l'espace central */}
      <QuoteTypewriter />

      {/* Settings — fixe à droite */}
      <div className="shrink-0">
        <Link
          href="/options"
          className="text-on-surface-variant hover:text-drg-orange transition-colors"
        >
          <span className="material-symbols-outlined">settings</span>
        </Link>
      </div>
    </header>
  );
}
