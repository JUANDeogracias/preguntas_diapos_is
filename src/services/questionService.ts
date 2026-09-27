import type { Question } from "../domain/question";

import agile from "../data/questions/agile.json";
import devops from "../data/questions/devops.json";
import lifecycle from "../data/questions/lifecycle.json";
import paradigms from "../data/questions/paradigms.json";
import traditionalModels from "../data/questions/traditional-models.json";
import unifiedProcess from "../data/questions/unified-process.json";

const ALL_QUESTIONS: Question[] = [
  ...(lifecycle as Question[]),
  ...(paradigms as Question[]),
  ...(traditionalModels as Question[]),
  ...(unifiedProcess as Question[]),
  ...(agile as Question[]),
  ...(devops as Question[]),
];

export function getAllQuestions(): Question[] {
  return ALL_QUESTIONS;
}

export function getQuestionsByTopic(topic: string): Question[] {
  return ALL_QUESTIONS.filter((question) => question.topic === topic);
}

export function getQuestionsByIds(ids: string[]): Question[] {
  const idSet = new Set(ids);
  return ALL_QUESTIONS.filter((question) => idSet.has(question.id));
}

export function getQuestionById(id: string): Question | undefined {
  return ALL_QUESTIONS.find((question) => question.id === id);
}
