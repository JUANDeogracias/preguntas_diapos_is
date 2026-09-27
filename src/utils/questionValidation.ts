import type { Question } from "../domain/question";

export interface ValidationIssue {
  questionId: string;
  message: string;
}

const VALID_TYPES = new Set(["single-choice", "multiple-choice"]);
const VALID_DIFFICULTIES = new Set(["easy", "medium", "hard"]);

export function validateQuestion(question: Question): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const fail = (message: string) => issues.push({ questionId: question.id || "(sin id)", message });

  if (!question.id) fail("Falta id");
  if (!question.topic) fail("Falta topic");
  if (!question.subtopic) fail("Falta subtopic");
  if (!VALID_DIFFICULTIES.has(question.difficulty)) fail(`difficulty inválida: ${question.difficulty}`);
  if (!VALID_TYPES.has(question.type)) fail(`type inválido: ${question.type}`);
  if (!question.question || question.question.trim().length === 0) fail("Falta el enunciado");
  if (!question.explanation || question.explanation.trim().length === 0) fail("Falta explanation");
  if (!question.sourcePage || question.sourcePage < 1) fail("sourcePage inválido o ausente");

  if (!question.options || question.options.length < 2) {
    fail("Debe tener al menos 2 opciones");
  } else {
    const optionIds = new Set(question.options.map((option) => option.id));
    if (optionIds.size !== question.options.length) {
      fail("Hay ids de opciones duplicados");
    }

    if (!question.correctAnswers || question.correctAnswers.length === 0) {
      fail("correctAnswers no puede estar vacío");
    } else {
      const invalidRefs = question.correctAnswers.filter((id) => !optionIds.has(id));
      if (invalidRefs.length > 0) {
        fail(`correctAnswers referencia opciones inexistentes: ${invalidRefs.join(", ")}`);
      }

      if (question.type === "single-choice" && question.correctAnswers.length !== 1) {
        fail("single-choice debe tener exactamente 1 respuesta correcta");
      }
      if (question.type === "multiple-choice" && question.correctAnswers.length < 2) {
        fail("multiple-choice debe tener al menos 2 respuestas correctas");
      }
    }
  }

  return issues;
}

export function validateQuestionBank(questions: Question[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const question of questions) {
    issues.push(...validateQuestion(question));
  }

  const idCounts = new Map<string, number>();
  for (const question of questions) {
    idCounts.set(question.id, (idCounts.get(question.id) ?? 0) + 1);
  }
  for (const [id, count] of idCounts) {
    if (count > 1) {
      issues.push({ questionId: id, message: `id duplicado (${count} veces)` });
    }
  }

  return issues;
}

export function findDuplicateQuestionTexts(questions: Question[]): string[][] {
  const byText = new Map<string, string[]>();
  for (const question of questions) {
    const key = question.question.trim().toLowerCase();
    const ids = byText.get(key) ?? [];
    ids.push(question.id);
    byText.set(key, ids);
  }

  return Array.from(byText.values()).filter((ids) => ids.length > 1);
}
