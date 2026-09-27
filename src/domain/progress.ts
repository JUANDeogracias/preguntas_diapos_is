import type { Difficulty, Question } from "./question";
import type { ExamAttempt } from "./quiz";

export interface TopicStats {
  answered: number;
  correct: number;
}

export interface DifficultyStats {
  answered: number;
  correct: number;
}

export const MAX_EXAM_HISTORY = 20;

export interface ProgressState {
  totalAnswered: number;
  totalCorrect: number;
  totalIncorrect: number;
  mistakes: string[];
  favorites: string[];
  /** IDs únicos de preguntas respondidas al menos una vez (no crece con respuestas repetidas). */
  seenQuestionIds: string[];
  /** Resúmenes de examen, más reciente primero. Como mucho MAX_EXAM_HISTORY entradas. */
  examHistory: ExamAttempt[];
  byTopic: Record<string, TopicStats>;
  byDifficulty: Record<Difficulty, DifficultyStats>;
}

export function createEmptyProgress(): ProgressState {
  return {
    totalAnswered: 0,
    totalCorrect: 0,
    totalIncorrect: 0,
    mistakes: [],
    favorites: [],
    seenQuestionIds: [],
    examHistory: [],
    byTopic: {},
    byDifficulty: {
      easy: { answered: 0, correct: 0 },
      medium: { answered: 0, correct: 0 },
      hard: { answered: 0, correct: 0 },
    },
  };
}

/**
 * Normaliza cualquier valor leído de localStorage a un ProgressState válido y completo.
 * Cubre tanto la ausencia total de datos (primera visita) como progreso guardado por una
 * versión anterior de la app a la que le falten campos (p. ej. `seenQuestionIds` o
 * `examHistory`, añadidos en SPEC-004): cada campo ausente o con forma inválida se
 * sustituye por su valor vacío, sin descartar el resto del progreso ya guardado.
 */
export function normalizeProgress(raw: unknown): ProgressState {
  const empty = createEmptyProgress();
  if (!raw || typeof raw !== "object") return empty;

  const partial = raw as Partial<ProgressState>;
  const rawByDifficulty = partial.byDifficulty as Partial<Record<Difficulty, DifficultyStats>> | undefined;

  return {
    totalAnswered: typeof partial.totalAnswered === "number" ? partial.totalAnswered : empty.totalAnswered,
    totalCorrect: typeof partial.totalCorrect === "number" ? partial.totalCorrect : empty.totalCorrect,
    totalIncorrect: typeof partial.totalIncorrect === "number" ? partial.totalIncorrect : empty.totalIncorrect,
    mistakes: Array.isArray(partial.mistakes) ? partial.mistakes : empty.mistakes,
    favorites: Array.isArray(partial.favorites) ? partial.favorites : empty.favorites,
    seenQuestionIds: Array.isArray(partial.seenQuestionIds) ? partial.seenQuestionIds : empty.seenQuestionIds,
    examHistory: Array.isArray(partial.examHistory) ? partial.examHistory : empty.examHistory,
    byTopic: partial.byTopic && typeof partial.byTopic === "object" ? partial.byTopic : empty.byTopic,
    byDifficulty: {
      easy: rawByDifficulty?.easy ?? empty.byDifficulty.easy,
      medium: rawByDifficulty?.medium ?? empty.byDifficulty.medium,
      hard: rawByDifficulty?.hard ?? empty.byDifficulty.hard,
    },
  };
}

function incrementStats(stats: TopicStats | undefined, correct: boolean): TopicStats {
  const base = stats ?? { answered: 0, correct: 0 };
  return {
    answered: base.answered + 1,
    correct: base.correct + (correct ? 1 : 0),
  };
}

export function recordAnswer(progress: ProgressState, question: Question, correct: boolean): ProgressState {
  const mistakes = new Set(progress.mistakes);
  if (correct) {
    mistakes.delete(question.id);
  } else {
    mistakes.add(question.id);
  }

  const seenQuestionIds = progress.seenQuestionIds.includes(question.id)
    ? progress.seenQuestionIds
    : [...progress.seenQuestionIds, question.id];

  return {
    ...progress,
    totalAnswered: progress.totalAnswered + 1,
    totalCorrect: progress.totalCorrect + (correct ? 1 : 0),
    totalIncorrect: progress.totalIncorrect + (correct ? 0 : 1),
    mistakes: Array.from(mistakes),
    seenQuestionIds,
    byTopic: {
      ...progress.byTopic,
      [question.topic]: incrementStats(progress.byTopic[question.topic], correct),
    },
    byDifficulty: {
      ...progress.byDifficulty,
      [question.difficulty]: incrementStats(progress.byDifficulty[question.difficulty], correct),
    },
  };
}

export function toggleFavorite(progress: ProgressState, questionId: string): ProgressState {
  const favorites = new Set(progress.favorites);
  if (favorites.has(questionId)) {
    favorites.delete(questionId);
  } else {
    favorites.add(questionId);
  }
  return {
    ...progress,
    favorites: Array.from(favorites),
  };
}

/** Añade un intento de examen, más reciente primero, recortando al límite MAX_EXAM_HISTORY. */
export function appendExamAttempt(progress: ProgressState, attempt: ExamAttempt): ProgressState {
  const examHistory = [attempt, ...progress.examHistory].slice(0, MAX_EXAM_HISTORY);
  return { ...progress, examHistory };
}

export interface GlobalProgressStats {
  totalAnswered: number;
  totalCorrect: number;
  totalIncorrect: number;
  /** Porcentaje 0-100. 0 si todavía no hay respuestas, nunca NaN. */
  accuracy: number;
}

export function getGlobalProgressStats(progress: ProgressState): GlobalProgressStats {
  return {
    totalAnswered: progress.totalAnswered,
    totalCorrect: progress.totalCorrect,
    totalIncorrect: progress.totalIncorrect,
    accuracy: progress.totalAnswered > 0 ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100) : 0,
  };
}

export interface BankCoverage {
  uniqueSeen: number;
  totalInBank: number;
  /** Porcentaje 0-100 basado en IDs únicos vistos, no en número de respuestas. */
  percentExplored: number;
}

export function getBankCoverage(progress: ProgressState, totalQuestionsInBank: number): BankCoverage {
  const uniqueSeen = progress.seenQuestionIds.length;
  return {
    uniqueSeen,
    totalInBank: totalQuestionsInBank,
    percentExplored: totalQuestionsInBank > 0 ? Math.round((uniqueSeen / totalQuestionsInBank) * 100) : 0,
  };
}

export interface TopicProgressStats {
  topic: string;
  answered: number;
  correct: number;
  incorrect: number;
  /** Porcentaje 0-100. 0 si el bloque todavía no tiene respuestas. */
  accuracy: number;
  uniqueSeen: number;
  totalAvailable: number;
  percentExplored: number;
}

/**
 * Estadísticas por bloque. Recibe el banco de preguntas y la lista de bloques como
 * parámetros (no los importa) para permanecer pura: quien la llama (la capa de
 * servicios) es responsable de obtenerlos de `questionService`/`data/topics`.
 * Incluye siempre todos los bloques recibidos, aunque tengan 0 respuestas.
 */
export function getTopicProgressStats(progress: ProgressState, allQuestions: Question[], topicIds: string[]): TopicProgressStats[] {
  const seenSet = new Set(progress.seenQuestionIds);

  return topicIds.map((topicId) => {
    const topicQuestions = allQuestions.filter((question) => question.topic === topicId);
    const stats = progress.byTopic[topicId] ?? { answered: 0, correct: 0 };
    const uniqueSeen = topicQuestions.filter((question) => seenSet.has(question.id)).length;

    return {
      topic: topicId,
      answered: stats.answered,
      correct: stats.correct,
      incorrect: stats.answered - stats.correct,
      accuracy: stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 0,
      uniqueSeen,
      totalAvailable: topicQuestions.length,
      percentExplored: topicQuestions.length > 0 ? Math.round((uniqueSeen / topicQuestions.length) * 100) : 0,
    };
  });
}

/**
 * Umbral mínimo de respuestas y máximo de acierto para considerar un bloque "débil".
 * Centralizados aquí (no en la UI) para poder ajustarlos sin tocar componentes.
 * Criterio propio del proyecto: SPEC-004 no llegó a redactarse como fichero, así que
 * se aplica tal cual el criterio acordado con el usuario (>=5 respuestas y <70% acierto).
 */
export const WEAK_TOPIC_MIN_ANSWERS = 5;
export const WEAK_TOPIC_MAX_ACCURACY = 70;

export interface WeakTopic {
  topic: string;
  answered: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  percentExplored: number;
}

/**
 * Bloques débiles a partir de estadísticas ya calculadas (`getTopicProgressStats`), para
 * no recalcular vistas/exploración dos veces. Un bloque con muestra insuficiente (menos
 * de WEAK_TOPIC_MIN_ANSWERS respuestas) nunca se marca como débil, aunque su acierto
 * parcial sea bajo. El umbral se compara contra el acierto exacto (correct/answered), no
 * contra `stats.accuracy` ya redondeado a entero: así un bloque en, p. ej., 69.6% real no
 * se libra de marcarse débil solo porque su valor mostrado redondee a 70%. Ordenados de
 * peor a mejor acierto.
 */
export function getWeakTopics(topicStats: TopicProgressStats[]): WeakTopic[] {
  return topicStats
    .filter((stats) => stats.answered >= WEAK_TOPIC_MIN_ANSWERS && (stats.correct / stats.answered) * 100 < WEAK_TOPIC_MAX_ACCURACY)
    .map(({ topic, answered, correct, incorrect, accuracy, percentExplored }) => ({
      topic,
      answered,
      correct,
      incorrect,
      accuracy,
      percentExplored,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);
}
