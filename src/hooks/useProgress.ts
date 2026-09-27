import { useMemo, useSyncExternalStore } from "react";
import * as progressStore from "../store/progressStore";
import { getProgressReport } from "../services/progressService";

export function useProgress() {
  const progress = useSyncExternalStore(progressStore.subscribe, progressStore.getState);
  const stats = useMemo(() => getProgressReport(progress), [progress]);

  return {
    progress,
    stats,
    recordAnswer: progressStore.recordAnswer,
    toggleFavorite: progressStore.toggleFavorite,
    resetProgress: progressStore.resetProgress,
    appendExamAttempt: progressStore.appendExamAttempt,
  };
}
