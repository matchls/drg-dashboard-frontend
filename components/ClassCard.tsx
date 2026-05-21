import { ClassSummary } from "@/lib/types";

interface Props {
  classData: ClassSummary;
}

export default function ClassCard({ classData }: Props) {
  const hours = Math.floor(classData.time_played_s / 3600);
  const minutes = Math.floor((classData.time_played_s % 3600) / 60);
  const distanceKm = (classData.distance_cm / 100000).toFixed(1);

  const stats = [
    { label: "Missions", value: classData.missions_completed },
    { label: "Kills", value: classData.kills.toLocaleString() },
    { label: "Temps", value: `${hours}h ${minutes}m` },
    { label: "Distance", value: `${distanceKm} km` },
    { label: "Downs", value: classData.downs },
  ];

  return (
    <div
      className="p-4 rounded border-2"
      style={{
        borderColor: classData.color,
        backgroundColor: `${classData.color}15`,
      }}
    >
      <h2
        className="text-2xl font-bold uppercase tracking-widest pb-2 mb-3 border-b"
        style={{ color: classData.color, borderColor: classData.color }}
      >
        {classData.name}
      </h2>
      {stats.map(({ label, value }) => (
        <div key={label} className="flex justify-between py-1">
          <span className="text-gray-400 uppercase text-sm">{label}</span>
          <span className="font-bold">{value}</span>
        </div>
      ))}
    </div>
  );
}
