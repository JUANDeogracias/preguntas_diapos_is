import { getTopicName } from "../data/topics";
import { getQuestionsByIds } from "../services/questionService";
import { useProgress } from "../hooks/useProgress";
import { Button } from "../components/common/Button";
import { FavoriteToggle } from "../components/quiz/FavoriteToggle";

interface MistakesPageProps {
  onStart: () => void;
  onExit: () => void;
}

export function MistakesPage({ onStart, onExit }: MistakesPageProps) {
  const { progress, toggleFavorite } = useProgress();
  const mistakeQuestions = getQuestionsByIds(progress.mistakes);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-50">Repasar fallos</h1>
        <Button variant="ghost" onClick={onExit}>
          Volver
        </Button>
      </div>

      {mistakeQuestions.length === 0 ? (
        <p className="text-slate-400">Todavía no tienes preguntas falladas pendientes de repasar. ¡Buen trabajo!</p>
      ) : (
        <>
          <p className="text-slate-300">
            Tienes <span className="font-semibold text-slate-100">{mistakeQuestions.length}</span> pregunta(s) pendiente(s)
            de repasar. Se elimina de esta lista en cuanto la respondas correctamente.
          </p>
          <div className="flex flex-col gap-3">
            {mistakeQuestions.map((question) => (
              <div key={question.id} className="flex flex-col gap-2 rounded-lg border border-border bg-surface-raised p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs uppercase tracking-wide text-slate-500">
                    {getTopicName(question.topic)} · {question.difficulty}
                  </span>
                  <FavoriteToggle
                    isFavorite={progress.favorites.includes(question.id)}
                    onToggle={() => toggleFavorite(question.id)}
                  />
                </div>
                <p className="text-sm text-slate-100">{question.question}</p>
              </div>
            ))}
          </div>
          <Button onClick={onStart} className="self-start">
            Comenzar repaso
          </Button>
        </>
      )}
    </div>
  );
}
