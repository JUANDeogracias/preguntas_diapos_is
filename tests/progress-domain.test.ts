import { describe, expect, it } from "vitest";
import type { ExamAttempt } from "../src/domain/quiz";
import type { Question } from "../src/domain/question";
import {
  MAX_EXAM_HISTORY,
  WEAK_TOPIC_MAX_ACCURACY,
  WEAK_TOPIC_MIN_ANSWERS,
  appendExamAttempt,
  createEmptyProgress,
  getBankCoverage,
  getGlobalProgressStats,
  getTopicProgressStats,
  getWeakTopics,
  normalizeProgress,
  recordAnswer,
  toggleFavorite,
  type ProgressState,
} from "../src/domain/progress";

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

function makeAttempt(overrides: Partial<ExamAttempt> = {}): ExamAttempt {
  return {
    id: "attempt-1",
    timestamp: 1000,
    questionCount: 10,
    correct: 8,
    incorrect: 2,
    grade: 8,
    topics: ["lifecycle"],
    difficulties: ["medium"],
    ...overrides,
  };
}

describe("estadísticas globales", () => {
  it("acumula respondidas, aciertos, fallos y precisión", () => {
    let progress = createEmptyProgress();
    progress = recordAnswer(progress, makeQuestion({ id: "q1" }), true);
    progress = recordAnswer(progress, makeQuestion({ id: "q2" }), false);
    progress = recordAnswer(progress, makeQuestion({ id: "q3" }), true);

    const stats = getGlobalProgressStats(progress);
    expect(stats).toEqual({ totalAnswered: 3, totalCorrect: 2, totalIncorrect: 1, accuracy: 67 });
  });

  it("da un porcentaje válido (0) cuando todavía no hay ninguna respuesta, sin NaN", () => {
    const stats = getGlobalProgressStats(createEmptyProgress());
    expect(stats.accuracy).toBe(0);
    expect(Number.isNaN(stats.accuracy)).toBe(false);
  });
});

describe("preguntas únicas vistas", () => {
  it("una misma pregunta respondida varias veces solo cuenta una vez como vista", () => {
    let progress = createEmptyProgress();
    const question = makeQuestion({ id: "q1" });

    for (let i = 0; i < 8; i++) {
      progress = recordAnswer(progress, question, i % 2 === 0);
    }

    expect(progress.totalAnswered).toBe(8);
    expect(progress.seenQuestionIds).toEqual(["q1"]);
  });

  it("crece en 1 por cada pregunta distinta vista", () => {
    let progress = createEmptyProgress();
    progress = recordAnswer(progress, makeQuestion({ id: "q1" }), true);
    progress = recordAnswer(progress, makeQuestion({ id: "q2" }), true);
    progress = recordAnswer(progress, makeQuestion({ id: "q1" }), false);

    expect(progress.seenQuestionIds).toEqual(["q1", "q2"]);
  });
});

describe("cobertura del banco", () => {
  it("calcula el porcentaje explorado a partir de IDs únicos, no de respuestas totales", () => {
    let progress = createEmptyProgress();
    const question = makeQuestion({ id: "q1" });
    for (let i = 0; i < 5; i++) {
      progress = recordAnswer(progress, question, true);
    }

    const coverage = getBankCoverage(progress, 100);
    expect(coverage).toEqual({ uniqueSeen: 1, totalInBank: 100, percentExplored: 1 });
  });

  it("no divide entre cero si el banco estuviera vacío", () => {
    const coverage = getBankCoverage(createEmptyProgress(), 0);
    expect(coverage.percentExplored).toBe(0);
  });
});

describe("estadísticas por bloque", () => {
  const allQuestions = [
    makeQuestion({ id: "q1", topic: "lifecycle" }),
    makeQuestion({ id: "q2", topic: "lifecycle" }),
    makeQuestion({ id: "q3", topic: "agile" }),
  ];

  it("incluye todos los bloques recibidos, incluso sin respuestas", () => {
    const stats = getTopicProgressStats(createEmptyProgress(), allQuestions, ["lifecycle", "agile", "devops"]);
    expect(stats.map((s) => s.topic)).toEqual(["lifecycle", "agile", "devops"]);
    expect(stats.find((s) => s.topic === "devops")).toEqual({
      topic: "devops",
      answered: 0,
      correct: 0,
      incorrect: 0,
      accuracy: 0,
      uniqueSeen: 0,
      totalAvailable: 0,
      percentExplored: 0,
    });
  });

  it("calcula vistas/disponibles, respuestas, aciertos, fallos y precisión por bloque", () => {
    let progress = createEmptyProgress();
    progress = recordAnswer(progress, allQuestions[0], true);
    progress = recordAnswer(progress, allQuestions[1], false);

    const stats = getTopicProgressStats(progress, allQuestions, ["lifecycle", "agile"]);
    const lifecycle = stats.find((s) => s.topic === "lifecycle")!;

    expect(lifecycle).toEqual({
      topic: "lifecycle",
      answered: 2,
      correct: 1,
      incorrect: 1,
      accuracy: 50,
      uniqueSeen: 2,
      totalAvailable: 2,
      percentExplored: 100,
    });
  });
});

describe("puntos débiles", () => {
  it("no marca como débil un bloque con menos de 5 respuestas aunque el acierto sea bajo", () => {
    const stats = [
      {
        topic: "lifecycle",
        answered: WEAK_TOPIC_MIN_ANSWERS - 1,
        correct: 0,
        incorrect: WEAK_TOPIC_MIN_ANSWERS - 1,
        accuracy: 0,
        uniqueSeen: 1,
        totalAvailable: 10,
        percentExplored: 10,
      },
    ];

    expect(getWeakTopics(stats)).toEqual([]);
  });

  it("marca como débil un bloque con al menos 5 respuestas y menos del 70% de acierto", () => {
    const stats = [
      {
        topic: "lifecycle",
        answered: WEAK_TOPIC_MIN_ANSWERS,
        correct: 2,
        incorrect: 3,
        accuracy: 40,
        uniqueSeen: 3,
        totalAvailable: 10,
        percentExplored: 30,
      },
    ];

    expect(WEAK_TOPIC_MAX_ACCURACY).toBe(70);
    const weak = getWeakTopics(stats);
    expect(weak).toHaveLength(1);
    expect(weak[0].topic).toBe("lifecycle");
  });

  it("no marca como débil un bloque con acierto igual o superior al umbral", () => {
    const stats = [
      {
        topic: "lifecycle",
        answered: 10,
        correct: 7,
        incorrect: 3,
        accuracy: 70,
        uniqueSeen: 5,
        totalAvailable: 10,
        percentExplored: 50,
      },
    ];

    expect(getWeakTopics(stats)).toEqual([]);
  });

  it("ordena los bloques débiles de peor a mejor acierto", () => {
    const stats = [
      { topic: "a", answered: 5, correct: 3, incorrect: 2, accuracy: 60, uniqueSeen: 1, totalAvailable: 1, percentExplored: 100 },
      { topic: "b", answered: 5, correct: 1, incorrect: 4, accuracy: 20, uniqueSeen: 1, totalAvailable: 1, percentExplored: 100 },
    ];

    expect(getWeakTopics(stats).map((w) => w.topic)).toEqual(["b", "a"]);
  });

  it("usa el acierto exacto, no el redondeado, para no dejar escapar un bloque justo en el límite", () => {
    // 139/200 = 69.5% exacto, pero Math.round(69.5) = 70, que ya NO es "< 70". El criterio
    // debe seguir marcándolo débil basándose en el 69.5% real, no en el 70% mostrado.
    const stats = [
      {
        topic: "lifecycle",
        answered: 200,
        correct: 139,
        incorrect: 61,
        accuracy: Math.round((139 / 200) * 100),
        uniqueSeen: 50,
        totalAvailable: 100,
        percentExplored: 50,
      },
    ];

    expect(stats[0].accuracy).toBe(70); // confirma que el valor mostrado redondearía a 70
    expect(getWeakTopics(stats)).toHaveLength(1); // pero el criterio real (69.5%) sí es débil
  });
});

describe("favoritos", () => {
  it("añade una pregunta a favoritos", () => {
    const progress = toggleFavorite(createEmptyProgress(), "q1");
    expect(progress.favorites).toEqual(["q1"]);
  });

  it("elimina una pregunta de favoritos si ya estaba marcada", () => {
    let progress = toggleFavorite(createEmptyProgress(), "q1");
    progress = toggleFavorite(progress, "q1");
    expect(progress.favorites).toEqual([]);
  });

  it("no duplica un favorito aunque el estado de partida ya contuviera el id repetido", () => {
    const corrupted: ProgressState = { ...createEmptyProgress(), favorites: ["q1", "q1"] };
    const progress = toggleFavorite(corrupted, "q2");
    expect(progress.favorites).toEqual(["q1", "q2"]);
  });
});

describe("historial de exámenes", () => {
  it("añade un intento al historial", () => {
    const progress = appendExamAttempt(createEmptyProgress(), makeAttempt({ id: "a1" }));
    expect(progress.examHistory).toHaveLength(1);
    expect(progress.examHistory[0].id).toBe("a1");
  });

  it("mantiene el orden de más reciente a más antiguo", () => {
    let progress = createEmptyProgress();
    progress = appendExamAttempt(progress, makeAttempt({ id: "a1", timestamp: 1 }));
    progress = appendExamAttempt(progress, makeAttempt({ id: "a2", timestamp: 2 }));
    progress = appendExamAttempt(progress, makeAttempt({ id: "a3", timestamp: 3 }));

    expect(progress.examHistory.map((a) => a.id)).toEqual(["a3", "a2", "a1"]);
  });

  it(`mantiene como máximo ${MAX_EXAM_HISTORY} intentos`, () => {
    let progress = createEmptyProgress();
    for (let i = 0; i < MAX_EXAM_HISTORY; i++) {
      progress = appendExamAttempt(progress, makeAttempt({ id: `a${i}` }));
    }
    expect(progress.examHistory).toHaveLength(MAX_EXAM_HISTORY);
  });

  it("al superar el límite, descarta el intento más antiguo y conserva los más recientes", () => {
    let progress = createEmptyProgress();
    for (let i = 0; i < MAX_EXAM_HISTORY; i++) {
      progress = appendExamAttempt(progress, makeAttempt({ id: `a${i}` }));
    }
    // a0 es el más antiguo (se añadió primero); al llegar el intento 21, debe desaparecer.
    progress = appendExamAttempt(progress, makeAttempt({ id: "a-new" }));

    expect(progress.examHistory).toHaveLength(MAX_EXAM_HISTORY);
    expect(progress.examHistory[0].id).toBe("a-new");
    expect(progress.examHistory.map((a) => a.id)).not.toContain("a0");
    expect(progress.examHistory.map((a) => a.id)).toContain("a1");
  });
});

describe("compatibilidad con progreso antiguo (normalizeProgress)", () => {
  it("devuelve progreso vacío si no hay nada guardado", () => {
    expect(normalizeProgress(null)).toEqual(createEmptyProgress());
    expect(normalizeProgress(undefined)).toEqual(createEmptyProgress());
  });

  it("inicializa favoritos a [] si el progreso guardado no los tenía", () => {
    const old = {
      totalAnswered: 5,
      totalCorrect: 3,
      totalIncorrect: 2,
      mistakes: ["q1"],
      byTopic: { lifecycle: { answered: 5, correct: 3 } },
      byDifficulty: { easy: { answered: 5, correct: 3 }, medium: { answered: 0, correct: 0 }, hard: { answered: 0, correct: 0 } },
    };

    const normalized = normalizeProgress(old);
    expect(normalized.favorites).toEqual([]);
    expect(normalized.examHistory).toEqual([]);
    expect(normalized.seenQuestionIds).toEqual([]);
    // El progreso previo real no se pierde ni se resetea:
    expect(normalized.totalAnswered).toBe(5);
    expect(normalized.mistakes).toEqual(["q1"]);
  });

  it("soporta un objeto de progreso mínimo/muy antiguo sin romper la aplicación", () => {
    const veryOld = { totalAnswered: 2 };
    const normalized = normalizeProgress(veryOld);

    expect(normalized.totalAnswered).toBe(2);
    expect(normalized.totalCorrect).toBe(0);
    expect(normalized.favorites).toEqual([]);
    expect(normalized.examHistory).toEqual([]);
    expect(normalized.byDifficulty).toEqual(createEmptyProgress().byDifficulty);
  });

  it("no rompe con un JSON completamente inesperado (array, string, número)", () => {
    expect(normalizeProgress([1, 2, 3])).toEqual(createEmptyProgress());
    expect(normalizeProgress("no-progreso")).toEqual(createEmptyProgress());
    expect(normalizeProgress(42)).toEqual(createEmptyProgress());
  });
});

describe("reset completo", () => {
  it("createEmptyProgress no deja rastro de estadísticas, favoritos, fallos ni historial previos", () => {
    let progress = createEmptyProgress();
    progress = recordAnswer(progress, makeQuestion({ id: "q1" }), false);
    progress = toggleFavorite(progress, "q2");
    progress = appendExamAttempt(progress, makeAttempt());

    const reset = createEmptyProgress();

    expect(reset.totalAnswered).toBe(0);
    expect(reset.mistakes).toEqual([]);
    expect(reset.favorites).toEqual([]);
    expect(reset.seenQuestionIds).toEqual([]);
    expect(reset.examHistory).toEqual([]);
    expect(reset.byTopic).toEqual({});
    // Y confirma que el progreso "sucio" de partida sí tenía datos (para que el test sea significativo):
    expect(progress.totalAnswered).toBe(1);
    expect(progress.favorites).toEqual(["q2"]);
    expect(progress.examHistory).toHaveLength(1);
  });
});
