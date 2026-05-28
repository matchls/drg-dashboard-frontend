"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function TopBar() {
  const [playerName, setPlayerName] = useState("OPERATIVE");

  useEffect(() => {
    const data = sessionStorage.getItem("dashboardData");
    if (data) {
      const parsed = JSON.parse(data);
      setPlayerName(parsed.player?.name ?? "OPERATIVE");
    }
  }, []);

  return (
    <header className="h-14 bg-surface-container-high border-b-4 border-outline flex items-center justify-between px-6">
      <p className="font-display text-xl text-on-surface tracking-widest">
        {playerName}
      </p>
      <div className="flex items-center gap-4 text-on-surface-variant">
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
