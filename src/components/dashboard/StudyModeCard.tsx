interface StudyModeCardProps {
  title: string;
  description: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function StudyModeCard({ title, description, onClick, disabled = false }: StudyModeCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !onClick}
      className="flex flex-col items-start gap-2 rounded-xl border border-border bg-surface-raised p-5 text-left transition-colors hover:border-accent/60 hover:bg-surface-overlay disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border disabled:hover:bg-surface-raised"
    >
      <h3 className="text-base font-semibold text-slate-100">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
      {disabled && <span className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">Próximamente</span>}
    </button>
  );
}
