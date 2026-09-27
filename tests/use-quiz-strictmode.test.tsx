// @vitest-environment jsdom
import { act, StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useQuiz } from "../src/hooks/useQuiz";
import * as progressStore from "../src/store/progressStore";

/**
 * Bajo React.StrictMode, React invoca dos veces la función updater que se pasa a
 * setState (setSession(prev => ...)) para ayudar a detectar impurezas. Si un efecto
 * secundario (como registrar una respuesta en el progreso) vive dentro de ese updater,
 * se ejecuta dos veces por cada respuesta real. Estos tests montan useQuiz bajo
 * StrictMode con el renderer real de React para reproducir esa condición y comprobar
 * que cada respuesta se registra exactamente una vez.
 */

// Requerido por React para permitir `act(...)` fuera de un test runner que lo declare
// automáticamente (Vitest, a diferencia de Jest, no lo hace por nosotros).
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;
let latestApi: ReturnType<typeof useQuiz> | null = null;

function TestHarness() {
  latestApi = useQuiz();
  return null;
}

function mount() {
  act(() => {
    root.render(
      <StrictMode>
        <TestHarness />
      </StrictMode>
    );
  });
}

beforeEach(() => {
  progressStore.resetProgress();
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  latestApi = null;
});

describe("useQuiz bajo React.StrictMode", () => {
  it("registra una respuesta de Practice exactamente una vez", () => {
    mount();

    act(() => {
      latestApi!.startPractice();
    });

    const question = latestApi!.currentQuestion!;

    act(() => {
      latestApi!.submitAnswer(question.correctAnswers);
    });

    expect(progressStore.getState().totalAnswered).toBe(1);
    expect(progressStore.getState().totalCorrect).toBe(1);
  });

  it("no registra dos veces una respuesta incorrecta de Practice", () => {
    mount();

    act(() => {
      latestApi!.startPractice();
    });

    const question = latestApi!.currentQuestion!;
    const wrongOption = question.options.find((option) => !question.correctAnswers.includes(option.id))!;

    act(() => {
      latestApi!.submitAnswer([wrongOption.id]);
    });

    expect(progressStore.getState().totalAnswered).toBe(1);
    expect(progressStore.getState().totalIncorrect).toBe(1);
    expect(progressStore.getState().mistakes).toEqual([question.id]);
  });

  it("registra los resultados de un examen y su entrada en el historial exactamente una vez al finalizar", () => {
    mount();

    act(() => {
      latestApi!.startExam({ questionCount: 5, topics: [], difficulties: [] });
    });

    const session = latestApi!.session!;
    expect(session.questions).toHaveLength(5);

    act(() => {
      session.questions.forEach((question) => {
        latestApi!.selectExamAnswer(question.id, question.correctAnswers);
      });
    });

    act(() => {
      latestApi!.finishExam();
    });

    expect(progressStore.getState().totalAnswered).toBe(5);
    expect(progressStore.getState().totalCorrect).toBe(5);
    expect(progressStore.getState().examHistory).toHaveLength(1);
    expect(progressStore.getState().examHistory[0]).toMatchObject({ questionCount: 5, correct: 5, incorrect: 0, grade: 10 });
  });

  it("no vuelve a registrar el progreso ni el historial si finishExam se llama dos veces", () => {
    mount();

    act(() => {
      latestApi!.startExam({ questionCount: 3, topics: [], difficulties: [] });
    });

    const session = latestApi!.session!;

    act(() => {
      session.questions.forEach((question) => {
        latestApi!.selectExamAnswer(question.id, question.correctAnswers);
      });
    });

    act(() => {
      latestApi!.finishExam();
    });
    act(() => {
      latestApi!.finishExam();
    });

    expect(progressStore.getState().totalAnswered).toBe(3);
    expect(progressStore.getState().examHistory).toHaveLength(1);
  });
});
