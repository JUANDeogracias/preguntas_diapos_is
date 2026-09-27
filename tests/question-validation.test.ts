import { describe, expect, it } from "vitest";
import { getAllQuestions } from "../src/services/questionService";
import { TOPICS } from "../src/data/topics";
import { findDuplicateQuestionTexts, validateQuestionBank } from "../src/utils/questionValidation";

describe("banco de preguntas", () => {
  const questions = getAllQuestions();

  it("no está vacío", () => {
    expect(questions.length).toBeGreaterThan(0);
  });

  it("cumple el esquema y las reglas de negocio", () => {
    const issues = validateQuestionBank(questions);
    expect(issues).toEqual([]);
  });

  it("no contiene preguntas duplicadas por enunciado", () => {
    const duplicates = findDuplicateQuestionTexts(questions);
    expect(duplicates).toEqual([]);
  });

  it("tiene al menos una pregunta por cada bloque del temario", () => {
    for (const topic of TOPICS) {
      const topicQuestions = questions.filter((question) => question.topic === topic.id);
      expect(topicQuestions.length, `bloque "${topic.id}" sin preguntas`).toBeGreaterThan(0);
    }
  });

  it("todas las preguntas referencian una página del PDF fuente", () => {
    for (const question of questions) {
      expect(question.sourcePage, question.id).toBeGreaterThanOrEqual(1);
    }
  });
});
