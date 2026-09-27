import {
  getBankCoverage,
  getGlobalProgressStats,
  getTopicProgressStats,
  getWeakTopics,
  type ProgressState,
} from "../domain/progress";
import { TOPICS } from "../data/topics";
import { getAllQuestions } from "./questionService";

export interface ProgressReport {
  global: ReturnType<typeof getGlobalProgressStats>;
  bankCoverage: ReturnType<typeof getBankCoverage>;
  topicStats: ReturnType<typeof getTopicProgressStats>;
  weakTopics: ReturnType<typeof getWeakTopics>;
}

/**
 * Punto único donde se cruzan el progreso guardado con el banco de preguntas estático
 * (`questionService`) y la lista de bloques (`data/topics`). Las funciones de dominio
 * siguen siendo puras y no conocen ni el banco ni los bloques; esta función de servicio
 * es la que las alimenta con esos datos.
 */
export function getProgressReport(progress: ProgressState): ProgressReport {
  const allQuestions = getAllQuestions();
  const topicIds = TOPICS.map((topic) => topic.id);
  const topicStats = getTopicProgressStats(progress, allQuestions, topicIds);

  return {
    global: getGlobalProgressStats(progress),
    bankCoverage: getBankCoverage(progress, allQuestions.length),
    topicStats,
    weakTopics: getWeakTopics(topicStats),
  };
}
