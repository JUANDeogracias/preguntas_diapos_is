import { createQuizSession, type ExamConfig, type QuizSession } from "../domain/quiz";
import { shuffleArray } from "../utils/shuffle";
import { filterByDifficulties, filterByTopics } from "../utils/questionFilters";
import { getAllQuestions, getQuestionsByIds, getQuestionsByTopic } from "./questionService";

export function buildPracticeSession(topicId?: string): QuizSession {
  const pool = topicId ? getQuestionsByTopic(topicId) : getAllQuestions();
  const questions = shuffleArray(pool);
  const mode = topicId ? "topic" : "practice";
  return createQuizSession(mode, questions);
}

export function buildMistakesSession(mistakeIds: string[]): QuizSession {
  const questions = shuffleArray(getQuestionsByIds(mistakeIds));
  return createQuizSession("mistakes", questions);
}

export function buildFavoritesSession(favoriteIds: string[]): QuizSession {
  const questions = shuffleArray(getQuestionsByIds(favoriteIds));
  return createQuizSession("favorites", questions);
}

/**
 * Construye una sesión de examen: filtra por bloques y dificultades (vacío = sin filtro),
 * mezcla el orden de las preguntas resultantes y limita la cantidad a lo realmente
 * disponible. También mezcla el orden de las opciones de cada pregunta seleccionada;
 * es seguro porque la corrección compara ids de opción, no su posición.
 */
export function buildExamSession(config: ExamConfig): QuizSession {
  const byTopic = filterByTopics(getAllQuestions(), config.topics);
  const byDifficulty = filterByDifficulties(byTopic, config.difficulties);
  const shuffled = shuffleArray(byDifficulty);
  const count = Math.min(config.questionCount, shuffled.length);

  const questions = shuffled.slice(0, count).map((question) => ({
    ...question,
    options: shuffleArray(question.options),
  }));

  return createQuizSession("exam", questions);
}
