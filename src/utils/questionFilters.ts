import type { Difficulty, Question } from "../domain/question";

export function filterByTopic(questions: Question[], topic: string): Question[] {
  return questions.filter((question) => question.topic === topic);
}

/** Vacío = sin filtro (devuelve todas). */
export function filterByTopics(questions: Question[], topics: string[]): Question[] {
  if (topics.length === 0) return questions;
  const topicSet = new Set(topics);
  return questions.filter((question) => topicSet.has(question.topic));
}

/** Vacío = sin filtro (devuelve todas). */
export function filterByDifficulties(questions: Question[], difficulties: Difficulty[]): Question[] {
  if (difficulties.length === 0) return questions;
  const difficultySet = new Set(difficulties);
  return questions.filter((question) => difficultySet.has(question.difficulty));
}

export function filterByIds(questions: Question[], ids: string[]): Question[] {
  const idSet = new Set(ids);
  return questions.filter((question) => idSet.has(question.id));
}

export function takeRandom(questions: Question[], count: number): Question[] {
  return questions.slice(0, count);
}
