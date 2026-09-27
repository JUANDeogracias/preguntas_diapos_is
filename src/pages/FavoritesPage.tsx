import { getTopicName } from "../data/topics";
import { getQuestionsByIds } from "../services/questionService";
import { useProgress } from "../hooks/useProgress";
import { Button } from "../components/common/Button";
import { FavoriteToggle } from "../components/quiz/FavoriteToggle";

interface FavoritesPageProps {
  onStart: () => void;
  onExit: () => void;
}

export function FavoritesPage({ onStart, onExit }: FavoritesPageProps) {
  const { progress, toggleFavorite } = useProgress();
  // getQuestionsByIds filtra sobre el banco real: si un id favorito ya no existiera en el
  // banco, simplemente no aparece, sin romper la página.
  const favoriteQuestions = getQuestionsByIds(progress.favorites);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-50">Favoritas</h1>
        <Button variant="ghost" onClick={onExit}>
          Volver
        </Button>
      </div>

      {favoriteQuestions.length === 0 ? (
        <p className="text-slate-400">
          Todavía no has guardado ninguna pregunta como favorita. Márcala con la estrella mientras practicas o repasas
          fallos.
        </p>
      ) : (
        <>
          <p className="text-slate-300">
            Tienes <span className="font-semibold text-slate-100">{favoriteQuestions.length}</span> pregunta(s) favorita(s).
          </p>
          <div className="flex flex-col gap-3">
            {favoriteQuestions.map((question) => (
              <div key={question.id} className="flex flex-col gap-2 rounded-lg border border-border bg-surface-raised p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs uppercase tracking-wide text-slate-500">
                    {getTopicName(question.topic)} · {question.difficulty}
                  </span>
                  <FavoriteToggle isFavorite onToggle={() => toggleFavorite(question.id)} />
                </div>
                <p className="text-sm text-slate-100">{question.question}</p>
              </div>
            ))}
          </div>
          <Button onClick={onStart} className="self-start">
            Practicar favoritas
          </Button>
        </>
      )}
    </div>
  );
}
