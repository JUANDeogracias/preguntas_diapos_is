import { useState } from "react";
import type { Question } from "../../domain/question";
import { AnswerOption } from "./AnswerOption";
import { Button } from "../common/Button";

interface QuestionCardProps {
  question: Question;
  answered: boolean;
  selectedOptionIds: string[];
  onSubmit: (selectedOptionIds: string[]) => void;
}

export function QuestionCard({ question, answered, selectedOptionIds, onSubmit }: QuestionCardProps) {
  const [pendingSelection, setPendingSelection] = useState<string[]>([]);

  const isMultiple = question.type === "multiple-choice";
  const selection = answered ? selectedOptionIds : pendingSelection;

  function toggleOption(optionId: string) {
    if (answered) return;

    setPendingSelection((current) => {
      if (isMultiple) {
        return current.includes(optionId) ? current.filter((id) => id !== optionId) : [...current, optionId];
      }
      return [optionId];
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
        <span className="rounded-full bg-surface-overlay px-3 py-1">{question.subtopic}</span>
        <span className="rounded-full bg-surface-overlay px-3 py-1 capitalize">{question.difficulty}</span>
        {isMultiple && <span className="rounded-full bg-surface-overlay px-3 py-1">Selección múltiple</span>}
      </div>

      <h2 className="text-xl font-semibold leading-relaxed text-slate-50 sm:text-2xl">{question.question}</h2>

      <div className="flex flex-col gap-3">
        {question.options.map((option) => (
          <AnswerOption
            key={option.id}
            option={option}
            selected={selection.includes(option.id)}
            disabled={answered}
            isCorrectOption={question.correctAnswers.includes(option.id)}
            revealResult={answered}
            onToggle={() => toggleOption(option.id)}
          />
        ))}
      </div>

      {!answered && (
        <Button
          onClick={() => onSubmit(pendingSelection)}
          disabled={pendingSelection.length === 0}
          className="self-start"
        >
          Comprobar respuesta
        </Button>
      )}
    </div>
  );
}
