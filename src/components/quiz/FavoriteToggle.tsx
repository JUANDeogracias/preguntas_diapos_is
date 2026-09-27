interface FavoriteToggleProps {
  isFavorite: boolean;
  onToggle: () => void;
}

export function FavoriteToggle({ isFavorite, onToggle }: FavoriteToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "Quitar de favoritas" : "Marcar como favorita"}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
        isFavorite
          ? "border-accent bg-accent/10 text-accent"
          : "border-border bg-surface-raised text-slate-400 hover:border-accent/60 hover:text-slate-200"
      }`}
    >
      <span aria-hidden="true">{isFavorite ? "★" : "☆"}</span>
      {isFavorite ? "Favorita" : "Guardar"}
    </button>
  );
}
