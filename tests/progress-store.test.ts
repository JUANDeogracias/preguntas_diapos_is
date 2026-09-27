// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { STORAGE_KEYS } from "../src/services/storageService";
import { createEmptyProgress } from "../src/domain/progress";

/**
 * progressStore.ts lee su estado inicial de localStorage en el momento en que el módulo
 * se importa. Para simular "reiniciar la aplicación" en estos tests, se usa
 * vi.resetModules() y un import() dinámico entre pasos: así cada import obtiene una
 * instancia nueva del store que vuelve a leer de localStorage (que sí persiste entre
 * imports, como en un navegador real).
 */

beforeEach(() => {
  window.localStorage.clear();
  vi.resetModules();
});

describe("persistencia de progreso en localStorage", () => {
  it("toggleFavorite escribe el cambio inmediatamente en localStorage", async () => {
    const progressStore = await import("../src/store/progressStore");
    progressStore.toggleFavorite("q1");

    const raw = window.localStorage.getItem(STORAGE_KEYS.progress);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw as string).favorites).toEqual(["q1"]);
  });

  it("el progreso persiste entre sesiones (reimportar el store simula reabrir la app)", async () => {
    const firstSession = await import("../src/store/progressStore");
    firstSession.toggleFavorite("q1");
    firstSession.toggleFavorite("q2");

    vi.resetModules();
    const secondSession = await import("../src/store/progressStore");

    expect([...secondSession.getState().favorites].sort()).toEqual(["q1", "q2"]);
  });

  it("carga sin romperse un progreso antiguo guardado sin favoriteQuestionIds ni examHistory", async () => {
    const oldShape = {
      totalAnswered: 3,
      totalCorrect: 2,
      totalIncorrect: 1,
      mistakes: [],
      byTopic: { lifecycle: { answered: 3, correct: 2 } },
      byDifficulty: {
        easy: { answered: 3, correct: 2 },
        medium: { answered: 0, correct: 0 },
        hard: { answered: 0, correct: 0 },
      },
    };
    window.localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(oldShape));

    const progressStore = await import("../src/store/progressStore");

    expect(progressStore.getState().favorites).toEqual([]);
    expect(progressStore.getState().examHistory).toEqual([]);
    expect(progressStore.getState().totalAnswered).toBe(3);
  });

  it("resetProgress limpia por completo el progreso guardado, y la UI lo reflejaría de inmediato", async () => {
    const progressStore = await import("../src/store/progressStore");
    progressStore.toggleFavorite("q1");

    let notified = 0;
    const unsubscribe = progressStore.subscribe(() => {
      notified += 1;
    });

    progressStore.resetProgress();
    unsubscribe();

    expect(progressStore.getState()).toEqual(createEmptyProgress());
    expect(notified).toBeGreaterThan(0); // los suscriptores (useSyncExternalStore) se enteran del reset

    const raw = window.localStorage.getItem(STORAGE_KEYS.progress);
    expect(JSON.parse(raw as string)).toEqual(createEmptyProgress());
  });

  it("nunca toca el banco de preguntas ni otras claves de localStorage ajenas al progreso", async () => {
    window.localStorage.setItem("otra-clave-de-la-app", "no-tocar");
    const progressStore = await import("../src/store/progressStore");
    progressStore.toggleFavorite("q1");
    progressStore.resetProgress();

    expect(window.localStorage.getItem("otra-clave-de-la-app")).toBe("no-tocar");
  });
});
