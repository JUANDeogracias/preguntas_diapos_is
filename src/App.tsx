import { useState } from "react";
import { HomePage } from "./pages/HomePage";
import { QuizPage, type QuizLaunchConfig } from "./pages/QuizPage";
import { MistakesPage } from "./pages/MistakesPage";
import { FavoritesPage } from "./pages/FavoritesPage";
import { StatisticsPage } from "./pages/StatisticsPage";
import { ExamPage } from "./pages/ExamPage";

type View =
  | { name: "home" }
  | { name: "quiz"; config: QuizLaunchConfig }
  | { name: "mistakes" }
  | { name: "favorites" }
  | { name: "statistics" }
  | { name: "exam" };

export default function App() {
  const [view, setView] = useState<View>({ name: "home" });

  switch (view.name) {
    case "quiz":
      return <QuizPage config={view.config} onExit={() => setView({ name: "home" })} />;
    case "mistakes":
      return (
        <MistakesPage
          onStart={() => setView({ name: "quiz", config: { kind: "mistakes" } })}
          onExit={() => setView({ name: "home" })}
        />
      );
    case "favorites":
      return (
        <FavoritesPage
          onStart={() => setView({ name: "quiz", config: { kind: "favorites" } })}
          onExit={() => setView({ name: "home" })}
        />
      );
    case "statistics":
      return <StatisticsPage onExit={() => setView({ name: "home" })} />;
    case "exam":
      return <ExamPage onExit={() => setView({ name: "home" })} />;
    case "home":
    default:
      return (
        <HomePage
          onStartPractice={(topicId) => setView({ name: "quiz", config: { kind: "practice", topicId } })}
          onStartMistakes={() => setView({ name: "mistakes" })}
          onOpenFavorites={() => setView({ name: "favorites" })}
          onOpenStatistics={() => setView({ name: "statistics" })}
          onStartExam={() => setView({ name: "exam" })}
        />
      );
  }
}
