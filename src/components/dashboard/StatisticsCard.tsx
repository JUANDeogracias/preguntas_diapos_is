interface StatisticsCardProps {
  label: string;
  value: string;
}

export function StatisticsCard({ label, value }: StatisticsCardProps) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-surface-raised p-4">
      <span className="text-xs uppercase tracking-wide text-slate-500">{label}</span>
      <span className="text-2xl font-semibold text-slate-100">{value}</span>
    </div>
  );
}
