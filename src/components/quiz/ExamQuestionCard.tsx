import type { Question } from "../../domain/question";
import { AnswerOption } from "./AnswerOption";

interface ExamQuestionCardProps {
  question: Question;
  selectedOptionIds: string[];
  onChange: (selectedOptionIds: string[]) => void;
}

/**
 * Variante de QuestionCard para el modo Exam: a diferencia de Practice, la selección
 * nunca se bloquea ni revela si es correcta, y puede cambiarse libremente mientras
 * el examen siga en curso.
 */
export function ExamQuestionCard({ question, selectedOptionIds, onChange }: ExamQuestionCardProps) {
  const isMultiple = question.type === "multiple-choice";

  function toggleOption(optionId: string) {
    if (isMultiple) {
      const next = selectedOptionIds.includes(optionId)
        ? selectedOptionIds.filter((id) => id !== optionId)
        : [...selectedOptionIds, optionId];
      onChange(next);
    } else {
      onChange([optionId]);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
        <span className="rounded-full bg-surface-overlay px-3 py-1 capitalize">{question.difficulty}</span>
        {isMultiple && <span className="rounded-full bg-surface-overlay px-3 py-1">Selección múltiple</span>}
      </div>

      <h2 className="text-xl font-semibold leading-relaxed text-slate-50 sm:text-2xl">{question.question}</h2>

      <div className="flex flex-col gap-3">
        {question.options.map((option) => (
          <AnswerOption
            key={option.id}
            option={option}
            selected={selectedOptionIds.includes(option.id)}
            disabled={false}
            isCorrectOption={false}
            revealResult={false}
            onToggle={() => toggleOption(option.id)}
          />
        ))}
      </div>
    </div>
  );
}
