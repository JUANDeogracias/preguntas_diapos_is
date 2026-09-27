import type { Difficulty, Question } from "./question";

export type QuizMode = "practice" | "exam" | "topic" | "mistakes" | "random" | "favorites";

export interface QuizAnswer {
  questionId: string;
  selectedOptionIds: string[];
  isCorrect: boolean;
}

export interface QuizSession {
  mode: QuizMode;
  questions: Question[];
  answers: QuizAnswer[];
  currentIndex: number;
}

export function createQuizSession(mode: QuizMode, questions: Question[]): QuizSession {
  return {
    mode,
    questions,
    answers: [],
    currentIndex: 0,
  };
}

export function isAnswerCorrect(question: Question, selectedOptionIds: string[]): boolean {
  if (selectedOptionIds.length !== question.correctAnswers.length) {
    return false;
  }
  const correctSet = new Set(question.correctAnswers);
  return selectedOptionIds.every((id) => correctSet.has(id));
}

export function getCurrentQuestion(session: QuizSession): Question | undefined {
  return session.questions[session.currentIndex];
}

export function answerCurrentQuestion(session: QuizSession, selectedOptionIds: string[]): QuizSession {
  const question = getCurrentQuestion(session);
  if (!question) {
    return session;
  }

  const answer: QuizAnswer = {
    questionId: question.id,
    selectedOptionIds,
    isCorrect: isAnswerCorrect(question, selectedOptionIds),
  };

  return {
    ...session,
    answers: [...session.answers, answer],
  };
}

export function advanceToNextQuestion(session: QuizSession): QuizSession {
  return {
    ...session,
    currentIndex: session.currentIndex + 1,
  };
}

export function isSessionComplete(session: QuizSession): boolean {
  return session.currentIndex >= session.questions.length;
}

export interface QuizScore {
  total: number;
  correct: number;
  incorrect: number;
}

export function getSessionScore(session: QuizSession): QuizScore {
  const correct = session.answers.filter((answer) => answer.isCorrect).length;
  return {
    total: session.answers.length,
    correct,
    incorrect: session.answers.length - correct,
  };
}

export function goToQuestionIndex(session: QuizSession, index: number): QuizSession {
  const clamped = Math.max(0, Math.min(index, session.questions.length - 1));
  return { ...session, currentIndex: clamped };
}

export interface ExamConfig {
  questionCount: number;
  /** Vacío = todos los bloques */
  topics: string[];
  /** Vacío = todas las dificultades */
  difficulties: Difficulty[];
}

/** Selecciones en curso de un examen, indexadas por id de pregunta, antes de corregirlo. */
export type DraftAnswers = Record<string, string[]>;

export function countUnanswered(questions: Question[], draftAnswers: DraftAnswers): number {
  return questions.filter((question) => (draftAnswers[question.id]?.length ?? 0) === 0).length;
}

/**
 * Corrige un examen de una sola vez: convierte las selecciones en curso en respuestas
 * definitivas (las preguntas sin responder cuentan como falladas) y marca la sesión como
 * completada, reutilizando el mismo criterio de "completada" que Practice y Mistakes.
 */
export function finalizeExam(session: QuizSession, draftAnswers: DraftAnswers): QuizSession {
  const answers: QuizAnswer[] = session.questions.map((question) => {
    const selectedOptionIds = draftAnswers[question.id] ?? [];
    return {
      questionId: question.id,
      selectedOptionIds,
      isCorrect: isAnswerCorrect(question, selectedOptionIds),
    };
  });

  return {
    ...session,
    answers,
    currentIndex: session.questions.length,
  };
}

export interface AnsweredQuestion {
  question: Question;
  selectedOptionIds: string[];
  isCorrect: boolean;
}

/** Empareja cada pregunta de la sesión con su respuesta, con seguridad ante preguntas sin responder. */
export function getAnsweredQuestions(session: QuizSession): AnsweredQuestion[] {
  return session.questions.map((question, index) => {
    const answer = session.answers[index];
    return {
      question,
      selectedOptionIds: answer?.selectedOptionIds ?? [],
      isCorrect: answer?.isCorrect ?? false,
    };
  });
}

export interface TopicScore {
  topic: string;
  correct: number;
  total: number;
}

export function getScoreByTopic(session: QuizSession): TopicScore[] {
  const byTopic = new Map<string, TopicScore>();

  for (const { question, isCorrect } of getAnsweredQuestions(session)) {
    const entry = byTopic.get(question.topic) ?? { topic: question.topic, correct: 0, total: 0 };
    entry.total += 1;
    if (isCorrect) entry.correct += 1;
    byTopic.set(question.topic, entry);
  }

  return Array.from(byTopic.values());
}

/** Nota sobre 10 = aciertos / total * 10, sin penalización por fallos. Redondeada a 1 decimal. */
export function getExamGrade(score: QuizScore): number {
  if (score.total === 0) return 0;
  return Math.round((score.correct / score.total) * 10 * 10) / 10;
}

export interface ExamAttempt {
  id: string;
  timestamp: number;
  questionCount: number;
  correct: number;
  incorrect: number;
  grade: number;
  topics: string[];
  difficulties: Difficulty[];
}

/**
 * Construye el resumen de un intento de examen a partir de una sesión ya corregida
 * (`finalizeExam`). `id` y `timestamp` se reciben como parámetros en lugar de generarse
 * aquí para que la función siga siendo pura y fácil de testear; quien la llama (el hook)
 * es responsable de generarlos junto al efecto secundario de guardar el intento.
 * Los bloques y dificultades se derivan de las preguntas reales del examen, no de la
 * configuración solicitada, para reflejar lo que realmente se examinó.
 */
export function buildExamAttempt(session: QuizSession, id: string, timestamp: number): ExamAttempt {
  const score = getSessionScore(session);

  return {
    id,
    timestamp,
    questionCount: score.total,
    correct: score.correct,
    incorrect: score.incorrect,
    grade: getExamGrade(score),
    topics: Array.from(new Set(session.questions.map((question) => question.topic))),
    difficulties: Array.from(new Set(session.questions.map((question) => question.difficulty))),
  };
}
