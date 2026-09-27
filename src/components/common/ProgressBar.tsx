interface ProgressBarProps {
  value: number;
  max: number;
}

export function ProgressBar({ value, max }: ProgressBarProps) {
  const percentage = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-overlay" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <div className="h-full rounded-full bg-accent transition-all duration-300" style={{ width: `${percentage}%` }} />
    </div>
  );
}
