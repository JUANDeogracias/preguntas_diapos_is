import { useMemo, useState } from "react";
import type { Difficulty } from "../../domain/question";
import type { ExamConfig } from "../../domain/quiz";
import { TOPICS } from "../../data/topics";
import { getAllQuestions } from "../../services/questionService";
import { filterByDifficulties, filterByTopics } from "../../utils/questionFilters";
import { Button } from "../common/Button";

const QUESTION_COUNT_OPTIONS = [10, 20, 30, 50];

const DIFFICULTY_OPTIONS: { id: Difficulty; label: string }[] = [
  { id: "easy", label: "Fácil" },
  { id: "medium", label: "Media" },
  { id: "hard", label: "Difícil" },
];

interface ExamConfigFormProps {
  onStart: (config: ExamConfig) => void;
  onExit: () => void;
}

export function ExamConfigForm({ onStart, onExit }: ExamConfigFormProps) {
  const [questionCount, setQuestionCount] = useState(20);
  const [topics, setTopics] = useState<string[]>([]);
  const [difficulties, setDifficulties] = useState<Difficulty[]>([]);

  const availableCount = useMemo(() => {
    const byTopic = filterByTopics(getAllQuestions(), topics);
    return filterByDifficulties(byTopic, difficulties).length;
  }, [topics, difficulties]);

  const effectiveCount = Math.min(questionCount, availableCount);

  function toggleTopic(topicId: string) {
    setTopics((current) => (current.includes(topicId) ? current.filter((id) => id !== topicId) : [...current, topicId]));
  }

  function toggleDifficulty(difficulty: Difficulty) {
    setDifficulties((current) =>
      current.includes(difficulty) ? current.filter((d) => d !== difficulty) : [...current, difficulty]
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-50">Configurar examen</h1>
        <Button variant="ghost" onClick={onExit}>
          Volver
        </Button>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Número de preguntas</h2>
        <div className="flex flex-wrap gap-2">
          {QUESTION_COUNT_OPTIONS.map((count) => (
            <Button key={count} variant={questionCount === count ? "primary" : "secondary"} onClick={() => setQuestionCount(count)}>
              {count}
            </Button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Bloques</h2>
        <p className="text-xs text-slate-500">Sin seleccionar ninguno se incluye todo el tema.</p>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((topic) => (
            <Button
              key={topic.id}
              variant={topics.includes(topic.id) ? "primary" : "secondary"}
              onClick={() => toggleTopic(topic.id)}
              className="text-sm"
            >
              {topic.name}
            </Button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Dificultad</h2>
        <p className="text-xs text-slate-500">Sin seleccionar ninguna se incluyen todas.</p>
        <div className="flex flex-wrap gap-2">
          {DIFFICULTY_OPTIONS.map((option) => (
            <Button
              key={option.id}
              variant={difficulties.includes(option.id) ? "primary" : "secondary"}
              onClick={() => toggleDifficulty(option.id)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface-raised p-4">
        <p className="text-sm text-slate-300">
          {availableCount === 0
            ? "No hay preguntas disponibles con estos filtros."
            : `Preguntas disponibles con estos filtros: ${availableCount}. El examen tendrá ${effectiveCount} pregunta(s).`}
        </p>
        <Button
          onClick={() => onStart({ questionCount, topics, difficulties })}
          disabled={availableCount === 0}
          className="self-start"
        >
          Comenzar examen
        </Button>
      </div>
    </div>
  );
}
