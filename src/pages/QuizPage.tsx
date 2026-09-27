import { useEffect } from "react";
import { getSessionScore } from "../domain/quiz";
import { useQuiz } from "../hooks/useQuiz";
import { useProgress } from "../hooks/useProgress";
import { QuizHeader } from "../components/quiz/QuizHeader";
import { QuizProgress } from "../components/quiz/QuizProgress";
import { QuestionCard } from "../components/quiz/QuestionCard";
import { QuestionFeedback } from "../components/quiz/QuestionFeedback";
import { QuizResults } from "../components/quiz/QuizResults";

export type QuizLaunchConfig = { kind: "practice"; topicId?: string } | { kind: "mistakes" } | { kind: "favorites" };

interface QuizPageProps {
  config: QuizLaunchConfig;
  onExit: () => void;
}

const TITLES: Record<QuizLaunchConfig["kind"], string> = {
  practice: "Modo práctica",
  mistakes: "Repaso de fallos",
  favorites: "Practicar favoritas",
};

export function QuizPage({ config, onExit }: QuizPageProps) {
  const {
    session,
    currentQuestion,
    currentAnswer,
    isComplete,
    startPractice,
    startMistakesPractice,
    startFavoritesPractice,
    submitAnswer,
    nextQuestion,
  } = useQuiz();
  const { progress, toggleFavorite } = useProgress();

  useEffect(() => {
    if (config.kind === "practice") {
      startPractice(config.topicId);
    } else if (config.kind === "mistakes") {
      startMistakesPractice(progress.mistakes);
    } else {
      startFavoritesPractice(progress.favorites);
    }
    // Relanza la sesión solo cuando cambia el modo o el tema seleccionado, no en cada render.
  }, [config.kind, config.kind === "practice" ? config.topicId : undefined]);

  function restartBoundedRound() {
    if (config.kind === "mistakes") {
      startMistakesPractice(progress.mistakes);
    } else if (config.kind === "favorites") {
      startFavoritesPractice(progress.favorites);
    }
  }

  if (!session) {
    return null;
  }

  if (isComplete) {
    const score = getSessionScore(session);
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-10">
        <QuizResults score={score} onExit={onExit} onRestart={restartBoundedRound} />
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-16 text-center">
        <p className="text-lg text-slate-300">No hay preguntas disponibles para esta selección todavía.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
      <QuizHeader title={TITLES[config.kind]} questionNumber={session.currentIndex + 1} onExit={onExit} />
      <QuizProgress
        current={session.currentIndex + (currentAnswer ? 1 : 0)}
        total={session.questions.length}
        correct={getSessionScore(session).correct}
      />
      <QuestionCard
        key={currentQuestion.id}
        question={currentQuestion}
        answered={Boolean(currentAnswer)}
        selectedOptionIds={currentAnswer?.selectedOptionIds ?? []}
        onSubmit={submitAnswer}
      />
      {currentAnswer && (
        <QuestionFeedback
          question={currentQuestion}
          isCorrect={currentAnswer.isCorrect}
          isFavorite={progress.favorites.includes(currentQuestion.id)}
          onToggleFavorite={() => toggleFavorite(currentQuestion.id)}
          onNext={nextQuestion}
        />
      )}
    </div>
  );
}
