import { useState } from "react";
import type { ExamConfig } from "../domain/quiz";
import { useQuiz } from "../hooks/useQuiz";
import { ExamConfigForm } from "../components/quiz/ExamConfigForm";
import { ExamQuestionCard } from "../components/quiz/ExamQuestionCard";
import { QuizHeader } from "../components/quiz/QuizHeader";
import { ProgressBar } from "../components/common/ProgressBar";
import { Button } from "../components/common/Button";
import { Modal } from "../components/common/Modal";
import { ResultsPage } from "./ResultsPage";

interface ExamPageProps {
  onExit: () => void;
}

export function ExamPage({ onExit }: ExamPageProps) {
  const {
    session,
    currentQuestion,
    isComplete,
    draftAnswers,
    startExam,
    selectExamAnswer,
    goToExamQuestion,
    finishExam,
    unansweredExamCount,
    exitSession,
  } = useQuiz();
  const [isConfirmOpen, setConfirmOpen] = useState(false);

  function handleStart(config: ExamConfig) {
    startExam(config);
  }

  function handleFinishClick() {
    if (unansweredExamCount > 0) {
      setConfirmOpen(true);
    } else {
      finishExam();
    }
  }

  function confirmFinish() {
    setConfirmOpen(false);
    finishExam();
  }

  if (!session) {
    return <ExamConfigForm onStart={handleStart} onExit={onExit} />;
  }

  if (isComplete) {
    return <ResultsPage session={session} onExit={onExit} onNewExam={exitSession} />;
  }

  if (!currentQuestion) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-16 text-center">
        <p className="text-lg text-slate-300">No hay preguntas disponibles con los filtros seleccionados.</p>
        <Button onClick={exitSession}>Volver a configurar</Button>
      </div>
    );
  }

  const isLastQuestion = session.currentIndex === session.questions.length - 1;
  const selectedOptionIds = draftAnswers[currentQuestion.id] ?? [];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8">
      <QuizHeader
        title="Modo examen"
        questionNumber={session.currentIndex + 1}
        totalQuestions={session.questions.length}
        onExit={onExit}
      />
      <ProgressBar value={session.currentIndex + 1} max={session.questions.length} />

      <ExamQuestionCard
        question={currentQuestion}
        selectedOptionIds={selectedOptionIds}
        onChange={(ids) => selectExamAnswer(currentQuestion.id, ids)}
      />

      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={() => goToExamQuestion(session.currentIndex - 1)}
          disabled={session.currentIndex === 0}
        >
          Anterior
        </Button>
        {isLastQuestion ? (
          <Button onClick={handleFinishClick}>Finalizar examen</Button>
        ) : (
          <Button onClick={() => goToExamQuestion(session.currentIndex + 1)}>Siguiente</Button>
        )}
      </div>

      <Modal title="Preguntas sin responder" isOpen={isConfirmOpen} onClose={() => setConfirmOpen(false)}>
        <p className="mb-4 text-sm text-slate-300">
          Tienes {unansweredExamCount} pregunta{unansweredExamCount === 1 ? "" : "s"} sin responder. Las preguntas sin
          responder se contarán como falladas.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
            Volver al examen
          </Button>
          <Button variant="secondary" onClick={confirmFinish}>
            Finalizar de todas formas
          </Button>
        </div>
      </Modal>
    </div>
  );
}
