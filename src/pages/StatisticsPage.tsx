import { useState } from "react";
import { formatTopicNames, getTopicName } from "../data/topics";
import { useProgress } from "../hooks/useProgress";
import { Button } from "../components/common/Button";
import { Modal } from "../components/common/Modal";
import { ProgressBar } from "../components/common/ProgressBar";
import { StatisticsCard } from "../components/dashboard/StatisticsCard";

interface StatisticsPageProps {
  onExit: () => void;
}

function formatExamDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" });
}

export function StatisticsPage({ onExit }: StatisticsPageProps) {
  const { progress, stats, resetProgress } = useProgress();
  const [isConfirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-50">Estadísticas</h1>
        <Button variant="ghost" onClick={onExit}>
          Volver
        </Button>
      </div>

      {/* 1. Resumen global */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Resumen global</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatisticsCard label="Respondidas" value={String(stats.global.totalAnswered)} />
          <StatisticsCard label="Aciertos" value={String(stats.global.totalCorrect)} />
          <StatisticsCard label="Fallos" value={String(stats.global.totalIncorrect)} />
          <StatisticsCard label="Precisión global" value={`${stats.global.accuracy}%`} />
          <StatisticsCard label="Preguntas únicas vistas" value={String(stats.bankCoverage.uniqueSeen)} />
          <StatisticsCard label="Favoritas" value={String(progress.favorites.length)} />
        </div>
      </section>

      {/* 2. Progreso del banco */}
      <section className="flex flex-col gap-2 rounded-lg border border-border bg-surface-raised p-4 text-center">
        <p className="text-sm text-slate-300">
          Has visto <span className="font-semibold text-slate-100">{stats.bankCoverage.uniqueSeen}</span> de{" "}
          <span className="font-semibold text-slate-100">{stats.bankCoverage.totalInBank}</span> preguntas del banco
        </p>
        <p className="text-2xl font-bold text-accent">{stats.bankCoverage.percentExplored}% del banco explorado</p>
        <ProgressBar value={stats.bankCoverage.uniqueSeen} max={Math.max(stats.bankCoverage.totalInBank, 1)} />
      </section>

      {/* 3. Rendimiento por bloque */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Rendimiento por bloque</h2>
        <div className="flex flex-col gap-3">
          {stats.topicStats.map((topic) => (
            <div key={topic.topic} className="flex flex-col gap-2 rounded-lg border border-border bg-surface-raised p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-slate-100">{getTopicName(topic.topic)}</span>
                <span className="text-sm text-slate-400">
                  {topic.answered > 0 ? `${topic.accuracy}% acierto` : "Sin respuestas todavía"}
                </span>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                <span>
                  Vistas: {topic.uniqueSeen}/{topic.totalAvailable} ({topic.percentExplored}%)
                </span>
                <span>Respuestas: {topic.answered}</span>
                <span>Aciertos: {topic.correct}</span>
                <span>Fallos: {topic.incorrect}</span>
              </div>
              <ProgressBar value={topic.uniqueSeen} max={Math.max(topic.totalAvailable, 1)} />
            </div>
          ))}
        </div>
      </section>

      {/* 4. Puntos débiles */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Puntos débiles</h2>
        {stats.weakTopics.length === 0 ? (
          <p className="text-sm text-slate-400">No hay suficientes datos o no se han detectado bloques débiles.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {stats.weakTopics.map((weak) => (
              <div key={weak.topic} className="flex flex-col gap-1 rounded-lg border border-danger/40 bg-danger/10 p-4">
                <span className="font-medium text-slate-100">{getTopicName(weak.topic)}</span>
                <span className="text-sm text-slate-300">
                  {weak.accuracy}% de acierto en {weak.answered} respuesta(s) · {weak.incorrect} fallo(s) ·{" "}
                  {weak.percentExplored}% del bloque explorado
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. Últimos exámenes */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Últimos exámenes</h2>
        {progress.examHistory.length === 0 ? (
          <p className="text-sm text-slate-400">Todavía no has completado ningún examen.</p>
        ) : (
          <div className="flex flex-col divide-y divide-border rounded-lg border border-border bg-surface-raised">
            {progress.examHistory.map((attempt) => (
              <div key={attempt.id} className="flex flex-col gap-1 px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-slate-200">{formatExamDate(attempt.timestamp)}</span>
                  <span className="text-lg font-semibold text-slate-100">{attempt.grade.toFixed(1)} / 10</span>
                </div>
                <span className="text-xs text-slate-500">
                  {attempt.correct}/{attempt.questionCount} aciertos · {Math.round(attempt.grade * 10)}% ·{" "}
                  {formatTopicNames(attempt.topics)} ·{" "}
                  {attempt.difficulties.length > 0 ? attempt.difficulties.join(", ") : "todas las dificultades"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <Button variant="secondary" className="self-start" onClick={() => setConfirmOpen(true)}>
        Reiniciar progreso
      </Button>

      <Modal title="Reiniciar progreso" isOpen={isConfirmOpen} onClose={() => setConfirmOpen(false)}>
        <p className="mb-4 text-sm text-slate-300">
          Esto borrará permanentemente todas tus estadísticas, preguntas vistas, fallos, favoritos e historial de exámenes
          guardados en este navegador. No afecta al banco de preguntas. Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              resetProgress();
              setConfirmOpen(false);
            }}
          >
            Reiniciar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
