"use client";
import { fetchHonorRoll } from "@/lib/data/players";
import { useAsync } from "@/lib/hooks/useAsync";
import { useTranslation, TranslationKey } from "@/lib/i18n";

interface HonorEntry {
  labelKey: TranslationKey;
  playerName: string | null;
  value: number;
  unitKey: TranslationKey;
}

export default function AbyssBarHonorRoll() {
  const t = useTranslation();
  const { data: roll } = useAsync(() => fetchHonorRoll());

  const honors: HonorEntry[] = roll
    ? [
        { labelKey: "honorTopTipper", playerName: roll.tips.playerName, value: roll.tips.value, unitKey: "honorUnitCredits" },
        { labelKey: "honorTopDrinker", playerName: roll.beers.playerName, value: roll.beers.value, unitKey: "honorUnitBeers" },
        { labelKey: "honorTopRounds", playerName: roll.rounds.playerName, value: roll.rounds.value, unitKey: "honorUnitRounds" },
      ]
    : [];

  return (
    <div className="industrial-panel p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3 border-b-4 border-outline pb-3">
        <span className="material-symbols-outlined text-primary">
          emoji_events
        </span>
        <p className="font-display text-xl text-on-surface tracking-widest">
          {t("honorRollTitle")}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {honors.map((entry) => (
          <div
            key={entry.labelKey}
            className="flex flex-col gap-1 border-l-2 border-drg-orange pl-3"
          >
            <p className="font-mono text-xs text-on-surface-variant tracking-widest">
              {t(entry.labelKey)}
            </p>
            <p className="font-display text-lg text-drg-orange">
              {entry.playerName ?? "—"}
            </p>
            <p className="font-mono text-xs text-on-surface">
              {entry.value.toLocaleString()} {t(entry.unitKey)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
