import { ProgressBar } from "../common/ProgressBar";

interface QuizProgressProps {
  current: number;
  total: number;
  correct: number;
}

export function QuizProgress({ current, total, correct }: QuizProgressProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>
          {current} / {total} en esta ronda
        </span>
        <span>{correct} aciertos</span>
      </div>
      <ProgressBar value={current} max={total} />
    </div>
  );
}
