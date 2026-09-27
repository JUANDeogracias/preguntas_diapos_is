import { Button } from "../common/Button";

interface QuizHeaderProps {
  title: string;
  questionNumber: number;
  totalQuestions?: number;
  onExit: () => void;
}

export function QuizHeader({ title, questionNumber, totalQuestions, onExit }: QuizHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-400">
          Pregunta {questionNumber}
          {totalQuestions !== undefined ? ` de ${totalQuestions}` : ""}
        </p>
        <h1 className="text-lg font-semibold text-slate-100">{title}</h1>
      </div>
      <Button variant="ghost" onClick={onExit}>
        Salir
      </Button>
    </div>
  );
}
