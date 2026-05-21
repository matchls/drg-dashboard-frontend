import { DashboardData } from "@/lib/types";

interface Props {
  heroStats: DashboardData["hero_stats"];
}

export default function HeroStats({ heroStats }: Props) {
  const totalHours = Math.floor(heroStats.MS_TimePlayed.total / 3600);
  const distanceKm = Math.floor(heroStats.MS_DistanceTravelled.total / 100000);
  const minerals = Math.floor(heroStats.MS_Mined_TotalMinerals.total);

  const stats = [
    { label: "Missions", value: heroStats.MS_Completed_TotalMissions.total },
    {
      label: "Kills",
      value: heroStats.MS_Killed_TotalEnemies.total.toLocaleString(),
    },
    { label: "Heures jouées", value: `${totalHours}h` },
    { label: "Distance", value: `${distanceKm} km` },
    { label: "Minerals", value: minerals.toLocaleString() },
    { label: "Downs", value: heroStats.MS_Death_TotalDowns.total },
  ];

  return (
    <div className="grid grid-cols-6 gap-4 mt-8">
      {stats.map(({ label, value }) => (
        <div key={label} className="relative">
          {/* Couche bordure — orange */}
          <div
            className="w-full h-full absolute inset-0 bg-drg-orange"
            style={{
              clipPath: "polygon(66% 0, 100% 38%, 100% 99%, 0 100%, 0 0)",
            }}
          />
          {/* Couche contenu — fond sombre */}
          <div
            className="relative m-0.5 bg-drg-dark p-4 text-center"
            style={{
              clipPath: "polygon(66% 0, 100% 38%, 100% 99%, 0 100%, 0 0)",
            }}
          >
            <p className="text-3xl font-bold text-drg-orange">{value}</p>
            <p className="text-gray-400 uppercase text-sm mt-1">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
