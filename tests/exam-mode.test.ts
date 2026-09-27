import { describe, expect, it } from "vitest";
import type { Question } from "../src/domain/question";
import {
  countUnanswered,
  createQuizSession,
  finalizeExam,
  getAnsweredQuestions,
  getExamGrade,
  getScoreByTopic,
  getSessionScore,
  goToQuestionIndex,
  type DraftAnswers,
} from "../src/domain/quiz";
import { buildExamSession } from "../src/services/quizService";
import { getAllQuestions } from "../src/services/questionService";

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

describe("goToQuestionIndex", () => {
  it("clampea el índice dentro del rango válido", () => {
    const session = createQuizSession("exam", [makeQuestion({ id: "q1" }), makeQuestion({ id: "q2" })]);
    expect(goToQuestionIndex(session, -3).currentIndex).toBe(0);
    expect(goToQuestionIndex(session, 1).currentIndex).toBe(1);
    expect(goToQuestionIndex(session, 99).currentIndex).toBe(1);
  });
});

describe("countUnanswered", () => {
  it("cuenta las preguntas sin selección o con selección vacía", () => {
    const questions = [makeQuestion({ id: "q1" }), makeQuestion({ id: "q2" }), makeQuestion({ id: "q3" })];
    const draftAnswers: DraftAnswers = { q1: ["a"], q2: [] };
    expect(countUnanswered(questions, draftAnswers)).toBe(2);
  });

  it("devuelve 0 cuando todas las preguntas tienen selección", () => {
    const questions = [makeQuestion({ id: "q1" }), makeQuestion({ id: "q2" })];
    const draftAnswers: DraftAnswers = { q1: ["a"], q2: ["b"] };
    expect(countUnanswered(questions, draftAnswers)).toBe(0);
  });
});

describe("finalizeExam", () => {
  it("corrige todas las preguntas de una vez, tratando las no respondidas como falladas", () => {
    const questions = [
      makeQuestion({ id: "q1", correctAnswers: ["a"] }),
      makeQuestion({ id: "q2", correctAnswers: ["b"] }),
      makeQuestion({ id: "q3", correctAnswers: ["a"] }),
    ];
    const session = createQuizSession("exam", questions);
    const draftAnswers: DraftAnswers = { q1: ["a"], q2: ["a"] }; // q1 bien, q2 mal, q3 sin responder

    const finished = finalizeExam(session, draftAnswers);

    expect(finished.currentIndex).toBe(3);
    expect(finished.answers).toHaveLength(3);
    expect(finished.answers[0].isCorrect).toBe(true);
    expect(finished.answers[1].isCorrect).toBe(false);
    expect(finished.answers[2]).toEqual({ questionId: "q3", selectedOptionIds: [], isCorrect: false });
  });

  it("calcula aciertos correctamente cuando todas las respuestas son correctas", () => {
    const questions = [makeQuestion({ id: "q1" }), makeQuestion({ id: "q2" }), makeQuestion({ id: "q3" })];
    const session = createQuizSession("exam", questions);
    const draftAnswers: DraftAnswers = { q1: ["a"], q2: ["a"], q3: ["a"] };

    const finished = finalizeExam(session, draftAnswers);
    const score = getSessionScore(finished);

    expect(score).toEqual({ total: 3, correct: 3, incorrect: 0 });
  });

  it("calcula aciertos correctamente cuando todas las respuestas son incorrectas", () => {
    const questions = [makeQuestion({ id: "q1" }), makeQuestion({ id: "q2" }), makeQuestion({ id: "q3" })];
    const session = createQuizSession("exam", questions);
    const draftAnswers: DraftAnswers = { q1: ["b"], q2: ["b"], q3: ["b"] };

    const finished = finalizeExam(session, draftAnswers);
    const score = getSessionScore(finished);

    expect(score).toEqual({ total: 3, correct: 0, incorrect: 3 });
  });
});

describe("getExamGrade", () => {
  it("calcula la nota sobre 10 sin penalización por fallos", () => {
    expect(getExamGrade({ total: 30, correct: 27, incorrect: 3 })).toBe(9);
    expect(getExamGrade({ total: 20, correct: 15, incorrect: 5 })).toBe(7.5);
    expect(getExamGrade({ total: 10, correct: 10, incorrect: 0 })).toBe(10);
    expect(getExamGrade({ total: 10, correct: 0, incorrect: 10 })).toBe(0);
  });

  it("devuelve 0 si el examen no tiene preguntas, sin dividir por cero", () => {
    expect(getExamGrade({ total: 0, correct: 0, incorrect: 0 })).toBe(0);
  });
});

describe("getScoreByTopic y getAnsweredQuestions", () => {
  it("agrupa los resultados por bloque", () => {
    const questions = [
      makeQuestion({ id: "q1", topic: "lifecycle", correctAnswers: ["a"] }),
      makeQuestion({ id: "q2", topic: "lifecycle", correctAnswers: ["a"] }),
      makeQuestion({ id: "q3", topic: "agile", correctAnswers: ["a"] }),
    ];
    const session = createQuizSession("exam", questions);
    const finished = finalizeExam(session, { q1: ["a"], q2: ["b"], q3: ["a"] });

    const byTopic = getScoreByTopic(finished);
    expect(byTopic).toEqual(
      expect.arrayContaining([
        { topic: "lifecycle", correct: 1, total: 2 },
        { topic: "agile", correct: 1, total: 1 },
      ])
    );
  });

  it("expone la respuesta seleccionada y la corrección de cada pregunta", () => {
    const questions = [makeQuestion({ id: "q1", correctAnswers: ["a"] })];
    const session = createQuizSession("exam", questions);
    const finished = finalizeExam(session, { q1: ["b"] });

    const answered = getAnsweredQuestions(finished);
    expect(answered).toEqual([{ question: questions[0], selectedOptionIds: ["b"], isCorrect: false }]);
  });
});

describe("buildExamSession", () => {
  it("crea un examen con exactamente N preguntas cuando el banco lo permite", () => {
    const session = buildExamSession({ questionCount: 10, topics: [], difficulties: [] });
    expect(session.mode).toBe("exam");
    expect(session.questions).toHaveLength(10);
  });

  it("limita el número de preguntas al tamaño disponible si se piden más de las que existen", () => {
    const total = getAllQuestions().length;
    const session = buildExamSession({ questionCount: total + 1000, topics: [], difficulties: [] });
    expect(session.questions).toHaveLength(total);
  });

  it("respeta el filtro por bloque", () => {
    const session = buildExamSession({ questionCount: 100, topics: ["devops"], difficulties: [] });
    expect(session.questions.length).toBeGreaterThan(0);
    expect(session.questions.every((question) => question.topic === "devops")).toBe(true);
  });

  it("respeta el filtro por varios bloques a la vez", () => {
    const session = buildExamSession({ questionCount: 100, topics: ["devops", "paradigms"], difficulties: [] });
    expect(session.questions.every((question) => question.topic === "devops" || question.topic === "paradigms")).toBe(true);
  });

  it("respeta el filtro por dificultad", () => {
    const session = buildExamSession({ questionCount: 100, topics: [], difficulties: ["hard"] });
    expect(session.questions.length).toBeGreaterThan(0);
    expect(session.questions.every((question) => question.difficulty === "hard")).toBe(true);
  });

  it("combina filtro por bloque y por dificultad", () => {
    const session = buildExamSession({ questionCount: 100, topics: ["agile"], difficulties: ["easy", "medium"] });
    expect(session.questions.every((question) => question.topic === "agile")).toBe(true);
    expect(session.questions.every((question) => question.difficulty === "easy" || question.difficulty === "medium")).toBe(
      true
    );
  });

  it("no genera preguntas duplicadas dentro del mismo examen", () => {
    const session = buildExamSession({ questionCount: 50, topics: [], difficulties: [] });
    const ids = session.questions.map((question) => question.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("no rompe la aplicación si los filtros no dejan ninguna pregunta disponible", () => {
    const session = buildExamSession({ questionCount: 10, topics: ["__inexistente__"], difficulties: [] });
    expect(session.questions).toHaveLength(0);
  });
});
