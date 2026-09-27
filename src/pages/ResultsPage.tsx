import { getAnsweredQuestions, getExamGrade, getScoreByTopic, getSessionScore, type QuizSession } from "../domain/quiz";
import { getTopicName } from "../data/topics";
import { useProgress } from "../hooks/useProgress";
import { QuizResults } from "../components/quiz/QuizResults";
import { FavoriteToggle } from "../components/quiz/FavoriteToggle";

interface ResultsPageProps {
  session: QuizSession;
  onExit: () => void;
  onNewExam: () => void;
}

export function ResultsPage({ session, onExit, onNewExam }: ResultsPageProps) {
  const { progress, toggleFavorite } = useProgress();
  const score = getSessionScore(session);
  const grade = getExamGrade(score);
  const byTopic = getScoreByTopic(session);
  const failed = getAnsweredQuestions(session).filter((answered) => !answered.isCorrect);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-10">
      <QuizResults title="Examen finalizado" score={score} onExit={onExit} onRestart={onNewExam} />

      <div className="flex items-center justify-center gap-2">
        <span className="text-sm text-slate-400">Nota:</span>
        <span className="text-2xl font-bold text-slate-100">{grade.toFixed(1)} / 10</span>
      </div>

      {byTopic.length > 1 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Resultado por bloque</h2>
          <div className="flex flex-col divide-y divide-border rounded-lg border border-border bg-surface-raised">
            {byTopic.map((entry) => (
              <div key={entry.topic} className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-slate-200">{getTopicName(entry.topic)}</span>
                <span className="text-sm text-slate-400">
                  {entry.correct}/{entry.total}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {failed.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Preguntas falladas ({failed.length})</h2>
          <div className="flex flex-col gap-4">
            {failed.map(({ question, selectedOptionIds }) => {
              const selectedTexts = question.options
                .filter((option) => selectedOptionIds.includes(option.id))
                .map((option) => option.text);
              const correctTexts = question.options
                .filter((option) => question.correctAnswers.includes(option.id))
                .map((option) => option.text);

              return (
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
                  <p className="font-medium text-slate-100">{question.question}</p>
                  <p className="text-sm text-danger">
                    Tu respuesta: {selectedTexts.length > 0 ? selectedTexts.join(", ") : "(sin responder)"}
                  </p>
                  <p className="text-sm text-success">Respuesta correcta: {correctTexts.join(", ")}</p>
                  <p className="text-sm text-slate-400">{question.explanation}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
