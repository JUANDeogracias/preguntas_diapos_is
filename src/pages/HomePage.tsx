import { useState } from "react";
import { TOPICS } from "../data/topics";
import { getQuestionsByTopic } from "../services/questionService";
import { useProgress } from "../hooks/useProgress";
import { Modal } from "../components/common/Modal";
import { StudyModeCard } from "../components/dashboard/StudyModeCard";
import { TopicCard } from "../components/dashboard/TopicCard";
import { StatisticsCard } from "../components/dashboard/StatisticsCard";

interface HomePageProps {
  onStartPractice: (topicId?: string) => void;
  onStartMistakes: () => void;
  onOpenFavorites: () => void;
  onOpenStatistics: () => void;
  onStartExam: () => void;
}

export function HomePage({ onStartPractice, onStartMistakes, onOpenFavorites, onOpenStatistics, onStartExam }: HomePageProps) {
  const [isTopicModalOpen, setTopicModalOpen] = useState(false);
  const { progress, stats } = useProgress();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-slate-50 sm:text-3xl">Ingeniería del Software · Tema 2</h1>
        <p className="text-slate-400">El proceso de desarrollo del software. Paradigmas o modelos de desarrollo.</p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatisticsCard label="Respondidas" value={String(stats.global.totalAnswered)} />
        <StatisticsCard label="Aciertos" value={String(stats.global.totalCorrect)} />
        <StatisticsCard label="Precisión" value={`${stats.global.accuracy}%`} />
        <StatisticsCard label="Fallos pendientes" value={String(progress.mistakes.length)} />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Estudiar</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <StudyModeCard
            title="Práctica aleatoria"
            description="Preguntas sin límite de todo el tema, con feedback inmediato."
            onClick={() => onStartPractice()}
          />
          <StudyModeCard
            title="Estudiar por bloque"
            description="Elige un bloque del temario para practicar solo sus preguntas."
            onClick={() => setTopicModalOpen(true)}
          />
          <StudyModeCard
            title="Repasar fallos"
            description={
              progress.mistakes.length > 0
                ? `Tienes ${progress.mistakes.length} pregunta(s) pendiente(s) de repasar.`
                : "Aún no tienes preguntas falladas."
            }
            onClick={progress.mistakes.length > 0 ? onStartMistakes : undefined}
            disabled={progress.mistakes.length === 0}
          />
          <StudyModeCard
            title="Favoritas"
            description={
              progress.favorites.length > 0
                ? `Tienes ${progress.favorites.length} pregunta(s) guardada(s).`
                : "Aún no has guardado ninguna pregunta como favorita."
            }
            onClick={onOpenFavorites}
          />
          <StudyModeCard
            title="Modo examen"
            description="Elige bloques, dificultad y número de preguntas. Sin feedback hasta el final."
            onClick={onStartExam}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Progreso</h2>
        <StudyModeCard title="Estadísticas" description="Consulta tu rendimiento por tema y dificultad." onClick={onOpenStatistics} />
      </section>

      <Modal title="Elige un bloque" isOpen={isTopicModalOpen} onClose={() => setTopicModalOpen(false)}>
        <div className="grid gap-3 sm:grid-cols-2">
          {TOPICS.map((topic) => (
            <TopicCard
              key={topic.id}
              name={topic.name}
              questionCount={getQuestionsByTopic(topic.id).length}
              onClick={() => {
                setTopicModalOpen(false);
                onStartPractice(topic.id);
              }}
            />
          ))}
        </div>
      </Modal>
    </div>
  );
}
