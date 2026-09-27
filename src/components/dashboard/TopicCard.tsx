interface TopicCardProps {
  name: string;
  questionCount: number;
  onClick: () => void;
}

export function TopicCard({ name, questionCount, onClick }: TopicCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-start gap-1 rounded-lg border border-border bg-surface-overlay p-4 text-left transition-colors hover:border-accent/60"
    >
      <span className="font-medium text-slate-100">{name}</span>
      <span className="text-xs text-slate-400">{questionCount} preguntas</span>
    </button>
  );
}
