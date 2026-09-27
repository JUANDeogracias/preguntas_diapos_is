import type { Question } from "../domain/question";
import type { ExamAttempt } from "../domain/quiz";
import {
  appendExamAttempt as appendExamAttemptDomain,
  createEmptyProgress,
  normalizeProgress,
  recordAnswer as recordAnswerDomain,
  toggleFavorite as toggleFavoriteDomain,
  type ProgressState,
} from "../domain/progress";
import { readFromStorage, STORAGE_KEYS, writeToStorage } from "../services/storageService";

type Listener = () => void;

let state: ProgressState = normalizeProgress(readFromStorage<unknown>(STORAGE_KEYS.progress, null));
const listeners = new Set<Listener>();

function setState(next: ProgressState): void {
  state = next;
  writeToStorage(STORAGE_KEYS.progress, state);
  listeners.forEach((listener) => listener());
}

export function getState(): ProgressState {
  return state;
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function recordAnswer(question: Question, correct: boolean): void {
  setState(recordAnswerDomain(state, question, correct));
}

export function toggleFavorite(questionId: string): void {
  setState(toggleFavoriteDomain(state, questionId));
}

export function appendExamAttempt(attempt: ExamAttempt): void {
  setState(appendExamAttemptDomain(state, attempt));
}

export function resetProgress(): void {
  setState(createEmptyProgress());
}
