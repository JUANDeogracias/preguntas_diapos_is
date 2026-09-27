import type { Question } from "../../domain/question";
import { Button } from "../common/Button";
import { FavoriteToggle } from "./FavoriteToggle";

interface QuestionFeedbackProps {
  question: Question;
  isCorrect: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onNext: () => void;
}

export function QuestionFeedback({ question, isCorrect, isFavorite, onToggleFavorite, onNext }: QuestionFeedbackProps) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-lg border p-4 ${
        isCorrect ? "border-success/40 bg-success/10" : "border-danger/40 bg-danger/10"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className={`font-semibold ${isCorrect ? "text-success" : "text-danger"}`}>
          {isCorrect ? "¡Respuesta correcta!" : "Respuesta incorrecta"}
        </p>
        <FavoriteToggle isFavorite={isFavorite} onToggle={onToggleFavorite} />
      </div>
      <p className="text-sm leading-relaxed text-slate-200">{question.explanation}</p>
      <p className="text-xs text-slate-500">Fuente: TEMA_2.pdf, página {question.sourcePage}</p>
      <Button onClick={onNext} className="self-start">
        Siguiente pregunta
      </Button>
    </div>
  );
}
