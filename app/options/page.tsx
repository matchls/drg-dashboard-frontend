"use client";
import { useState, useEffect } from "react";
import { getPrefs, setPrefs, Preferences } from "@/lib/preferences";

export default function OptionsPage() {
  const [prefs, setPrefsState] = useState<Preferences | null>(null);

  useEffect(() => {
    setPrefsState(getPrefs());
  }, []);

  function update(partial: Partial<Preferences>) {
    setPrefs(partial);
    setPrefsState((prev) => (prev ? { ...prev, ...partial } : prev));
  }

  if (!prefs) return null;

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col gap-6">
      <div className="industrial-panel p-4 border-b-4 border-outline flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">settings</span>
        <p className="font-display text-2xl text-on-surface tracking-widest">
          OPTIONS
        </p>
      </div>

      {/* Leaderboard + Pseudo — issue #13 */}
      <div className="industrial-panel p-6">
        <p className="font-mono text-xs text-on-surface-variant tracking-widest text-center py-4">
          LEADERBOARD & PSEUDO — COMING SOON
        </p>
      </div>

      {/* Langue + Unités — issue #14 */}
      <div className="industrial-panel p-6">
        <p className="font-mono text-xs text-on-surface-variant tracking-widest text-center py-4">
          LANGUE & UNITÉS — COMING SOON
        </p>
      </div>
    </div>
  );
}
