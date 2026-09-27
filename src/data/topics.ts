export interface Topic {
  id: string;
  name: string;
}

export const TOPICS: Topic[] = [
  { id: "lifecycle", name: "Procesos en el Ciclo de Vida del Software" },
  { id: "paradigms", name: "Paradigmas o Modelos de Desarrollo del Software" },
  { id: "traditional-models", name: "Modelos Tradicionales de Desarrollo de Software" },
  { id: "unified-process", name: "Proceso Unificado de Desarrollo" },
  { id: "agile", name: "Modelos Ágiles de Desarrollo de Software" },
  { id: "devops", name: "DevOps y la Integración Continua" },
];

export function getTopicName(topicId: string): string {
  return TOPICS.find((topic) => topic.id === topicId)?.name ?? topicId;
}

/** "Todos los bloques" si abarca los 6, la lista de nombres separada por comas si no. */
export function formatTopicNames(topicIds: string[]): string {
  if (topicIds.length === 0) return "—";
  if (topicIds.length === TOPICS.length) return "Todos los bloques";
  return topicIds.map(getTopicName).join(", ");
}
