import { TranslationKey } from "@/lib/i18n";
import {
  COMMUNITY_KILL_MILESTONE,
  COMMUNITY_MISSION_MILESTONE,
} from "@/lib/leaderboard";

interface BountyTargetsProps {
  // Agrégats globaux issus de fetchCommunityTotals() — pas le leaderboard paginé
  communityKills: number;
  communityMissions: number;
  t: (key: TranslationKey) => string;
}

export default function BountyTargets({ communityKills, communityMissions, t }: BountyTargetsProps) {

  return (
    <div className="industrial-panel p-4 flex flex-col gap-4">
      <p className="font-display text-lg text-on-surface tracking-widest">
        {t("lbBountyTitle")}
      </p>
      {[
        {
          label: t("lbCommunityKills"),
          current: communityKills,
          milestone: COMMUNITY_KILL_MILESTONE,
        },
        {
          label: t("lbCommunityMissions"),
          current: communityMissions,
          milestone: COMMUNITY_MISSION_MILESTONE,
        },
      ].map((target) => {
        // Math.min(100, ...) : cap à 100% si le milestone est dépassé
        const pct = Math.min(100, Math.round((target.current / target.milestone) * 100));
        return (
          <div key={target.label} className="flex flex-col gap-1">
            <div className="flex justify-between font-mono text-xs text-on-surface-variant">
              <span>{target.label}</span>
              <span>
                {target.current.toLocaleString()} / {target.milestone.toLocaleString()} ({pct}%)
              </span>
            </div>
            <div className="h-3 bg-surface-container-highest border border-outline">
              <div
                className="h-full bg-error transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
