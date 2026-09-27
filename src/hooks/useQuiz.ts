import { useCallback, useMemo, useState } from "react";
import {
  advanceToNextQuestion,
  answerCurrentQuestion,
  buildExamAttempt,
  countUnanswered,
  finalizeExam,
  getCurrentQuestion,
  goToQuestionIndex,
  isAnswerCorrect,
  isSessionComplete,
  type DraftAnswers,
  type ExamConfig,
  type QuizSession,
} from "../domain/quiz";
import { buildExamSession, buildFavoritesSession, buildMistakesSession, buildPracticeSession } from "../services/quizService";
import { useProgress } from "./useProgress";

const ENDLESS_MODES: QuizSession["mode"][] = ["practice", "topic", "random"];

export function useQuiz() {
  const [session, setSession] = useState<QuizSession | null>(null);
  const [draftAnswers, setDraftAnswers] = useState<DraftAnswers>({});
  const { recordAnswer, appendExamAttempt } = useProgress();

  const startPractice = useCallback((topicId?: string) => {
    setSession(buildPracticeSession(topicId));
  }, []);

  const startMistakesPractice = useCallback((mistakeIds: string[]) => {
    setSession(buildMistakesSession(mistakeIds));
  }, []);

  const startFavoritesPractice = useCallback((favoriteIds: string[]) => {
    setSession(buildFavoritesSession(favoriteIds));
  }, []);

  const startExam = useCallback((config: ExamConfig) => {
    setDraftAnswers({});
    setSession(buildExamSession(config));
  }, []);

  const submitAnswer = useCallback(
    (selectedOptionIds: string[]) => {
      if (!session) return;
      const question = getCurrentQuestion(session);
      if (!question) return;

      // El registro en progreso es un efecto secundario: se ejecuta aquí, en el cuerpo
      // del callback, y no dentro del updater de setSession, para que React.StrictMode
      // no pueda invocarlo dos veces (los updater sí se invocan por duplicado en dev).
      recordAnswer(question, isAnswerCorrect(question, selectedOptionIds));
      setSession(answerCurrentQuestion(session, selectedOptionIds));
    },
    [session, recordAnswer]
  );

  const nextQuestion = useCallback(() => {
    setSession((current) => {
      if (!current) return current;
      const next = advanceToNextQuestion(current);

      if (isSessionComplete(next) && ENDLESS_MODES.includes(next.mode)) {
        const topicId = next.mode === "topic" ? next.questions[0]?.topic : undefined;
        return buildPracticeSession(topicId);
      }

      return next;
    });
  }, []);

  const selectExamAnswer = useCallback((questionId: string, selectedOptionIds: string[]) => {
    setDraftAnswers((current) => ({ ...current, [questionId]: selectedOptionIds }));
  }, []);

  const goToExamQuestion = useCallback((index: number) => {
    setSession((current) => (current ? goToQuestionIndex(current, index) : current));
  }, []);

  const finishExam = useCallback(() => {
    if (!session || isSessionComplete(session)) return;

    const finished = finalizeExam(session, draftAnswers);
    // Igual que en submitAnswer: todo efecto secundario (progreso e historial) ocurre
    // aquí, fuera de cualquier updater de setSession, para que no pueda duplicarse bajo
    // React.StrictMode. finishExam solo llega hasta aquí una vez por intento gracias a la
    // guarda `isSessionComplete(session)` de arriba (una segunda llamada no hace nada).
    finished.questions.forEach((question, index) => {
      const answer = finished.answers[index];
      recordAnswer(question, answer.isCorrect);
    });
    appendExamAttempt(buildExamAttempt(finished, crypto.randomUUID(), Date.now()));
    setSession(finished);
  }, [session, draftAnswers, recordAnswer, appendExamAttempt]);

  const exitSession = useCallback(() => {
    setSession(null);
    setDraftAnswers({});
  }, []);

  const currentQuestion = session ? getCurrentQuestion(session) : undefined;
  const currentAnswer = session?.answers[session.currentIndex];
  const unansweredExamCount = useMemo(
    () => (session ? countUnanswered(session.questions, draftAnswers) : 0),
    [session, draftAnswers]
  );

  return {
    session,
    currentQuestion,
    currentAnswer,
    isComplete: session ? isSessionComplete(session) : false,
    startPractice,
    startMistakesPractice,
    startFavoritesPractice,
    submitAnswer,
    nextQuestion,
    exitSession,
    // Exam
    draftAnswers,
    startExam,
    selectExamAnswer,
    goToExamQuestion,
    finishExam,
    unansweredExamCount,
  };
}
