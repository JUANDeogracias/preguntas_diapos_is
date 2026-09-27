import { describe, expect, it } from "vitest";
import type { Question } from "../src/domain/question";
import {
  advanceToNextQuestion,
  answerCurrentQuestion,
  createQuizSession,
  getCurrentQuestion,
  getSessionScore,
  isAnswerCorrect,
  isSessionComplete,
} from "../src/domain/quiz";
import { createEmptyProgress, recordAnswer, toggleFavorite } from "../src/domain/progress";

function makeQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: "q1",
    topic: "lifecycle",
    subtopic: "test",
    difficulty: "easy",
    type: "single-choice",
    question: "¿Pregunta de prueba?",
    options: [
      { id: "a", text: "Opción A" },
      { id: "b", text: "Opción B" },
    ],
    correctAnswers: ["a"],
    explanation: "Explicación de prueba",
    sourcePage: 1,
    tags: [],
    ...overrides,
  };
}

describe("isAnswerCorrect", () => {
  it("acepta la respuesta correcta en single-choice", () => {
    const question = makeQuestion();
    expect(isAnswerCorrect(question, ["a"])).toBe(true);
  });

  it("rechaza una respuesta incorrecta en single-choice", () => {
    const question = makeQuestion();
    expect(isAnswerCorrect(question, ["b"])).toBe(false);
  });

  it("exige exactamente el mismo conjunto de opciones en multiple-choice", () => {
    const question = makeQuestion({
      type: "multiple-choice",
      correctAnswers: ["a", "b"],
      options: [
        { id: "a", text: "A" },
        { id: "b", text: "B" },
        { id: "c", text: "C" },
      ],
    });
    expect(isAnswerCorrect(question, ["a", "b"])).toBe(true);
    expect(isAnswerCorrect(question, ["b", "a"])).toBe(true);
    expect(isAnswerCorrect(question, ["a"])).toBe(false);
    expect(isAnswerCorrect(question, ["a", "c"])).toBe(false);
  });
});

describe("sesión de quiz", () => {
  it("avanza pregunta a pregunta registrando respuestas", () => {
    const questions = [makeQuestion({ id: "q1" }), makeQuestion({ id: "q2", correctAnswers: ["b"] })];
    let session = createQuizSession("practice", questions);

    expect(getCurrentQuestion(session)?.id).toBe("q1");

    session = answerCurrentQuestion(session, ["a"]);
    expect(session.answers[0].isCorrect).toBe(true);

    session = advanceToNextQuestion(session);
    expect(getCurrentQuestion(session)?.id).toBe("q2");
    expect(isSessionComplete(session)).toBe(false);

    session = answerCurrentQuestion(session, ["a"]);
    expect(session.answers[1].isCorrect).toBe(false);

    session = advanceToNextQuestion(session);
    expect(isSessionComplete(session)).toBe(true);

    const score = getSessionScore(session);
    expect(score).toEqual({ total: 2, correct: 1, incorrect: 1 });
  });
});

describe("progreso del usuario", () => {
  it("acumula aciertos y fallos por tema y dificultad", () => {
    const question = makeQuestion({ topic: "lifecycle", difficulty: "medium" });
    let progress = createEmptyProgress();

    progress = recordAnswer(progress, question, true);
    expect(progress.totalAnswered).toBe(1);
    expect(progress.totalCorrect).toBe(1);
    expect(progress.byTopic.lifecycle).toEqual({ answered: 1, correct: 1 });
    expect(progress.byDifficulty.medium).toEqual({ answered: 1, correct: 1 });
    expect(progress.mistakes).toEqual([]);

    progress = recordAnswer(progress, question, false);
    expect(progress.totalIncorrect).toBe(1);
    expect(progress.mistakes).toEqual([question.id]);

    progress = recordAnswer(progress, question, true);
    expect(progress.mistakes).toEqual([]);
  });

  it("permite marcar y desmarcar favoritos", () => {
    let progress = createEmptyProgress();
    progress = toggleFavorite(progress, "q1");
    expect(progress.favorites).toEqual(["q1"]);
    progress = toggleFavorite(progress, "q1");
    expect(progress.favorites).toEqual([]);
  });
});
