const PREFIX = "preguntas-is-tema2";

export const STORAGE_KEYS = {
  progress: `${PREFIX}:progress:v1`,
} as const;

export function readFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeToStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage puede no estar disponible (modo privado, cuota excedida); se ignora.
  }
}
