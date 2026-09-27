import type { QuestionOption } from "../../domain/question";

interface AnswerOptionProps {
  option: QuestionOption;
  selected: boolean;
  disabled: boolean;
  isCorrectOption: boolean;
  revealResult: boolean;
  onToggle: () => void;
}

export function AnswerOption({ option, selected, disabled, isCorrectOption, revealResult, onToggle }: AnswerOptionProps) {
  let stateClasses = "border-border bg-surface-raised hover:border-accent/60";

  if (revealResult) {
    if (isCorrectOption) {
      stateClasses = "border-success bg-success/10";
    } else if (selected && !isCorrectOption) {
      stateClasses = "border-danger bg-danger/10";
    }
  } else if (selected) {
    stateClasses = "border-accent bg-accent/10";
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      className={`w-full rounded-lg border p-4 text-left text-slate-100 transition-colors disabled:cursor-default ${stateClasses}`}
    >
      {option.text}
    </button>
  );
}
