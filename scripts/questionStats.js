import { loadAllQuestions } from "./lib/loadQuestions.js";

function main() {
  const questions = loadAllQuestions();
  const byTopic = new Map();
  const byDifficulty = new Map();

  for (const question of questions) {
    byTopic.set(question.topic, (byTopic.get(question.topic) ?? 0) + 1);
    byDifficulty.set(question.difficulty, (byDifficulty.get(question.difficulty) ?? 0) + 1);
  }

  console.log(`Total de preguntas: ${questions.length}\n`);

  console.log("Por bloque:");
  for (const [topic, count] of [...byTopic.entries()].sort()) {
    console.log(`  ${topic}: ${count}`);
  }

  console.log("\nPor dificultad:");
  for (const difficulty of ["easy", "medium", "hard"]) {
    console.log(`  ${difficulty}: ${byDifficulty.get(difficulty) ?? 0}`);
  }
}

main();
