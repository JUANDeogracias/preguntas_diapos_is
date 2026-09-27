import type { QuizScore } from "../../domain/quiz";
import { Button } from "../common/Button";

interface QuizResultsProps {
  score: QuizScore;
  onRestart: () => void;
  onExit: () => void;
  title?: string;
}

export function QuizResults({ score, onRestart, onExit, title = "Ronda completada" }: QuizResultsProps) {
  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-surface-raised p-8 text-center">
      <h2 className="text-2xl font-semibold text-slate-100">{title}</h2>
      <p className="text-4xl font-bold text-accent">{accuracy}%</p>
      <p className="text-sm text-slate-400">
        {score.correct} aciertos de {score.total} preguntas
      </p>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onExit}>
          Volver al inicio
        </Button>
        <Button onClick={onRestart}>Repetir</Button>
      </div>
    </div>
  );
}
