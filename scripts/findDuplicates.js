import { loadAllQuestions } from "./lib/loadQuestions.js";

function main() {
  const questions = loadAllQuestions();
  const byText = new Map();

  for (const question of questions) {
    const key = question.question.trim().toLowerCase();
    const ids = byText.get(key) ?? [];
    ids.push(question.id);
    byText.set(key, ids);
  }

  const duplicates = Array.from(byText.entries()).filter(([, ids]) => ids.length > 1);

  if (duplicates.length === 0) {
    console.log("✓ No se han encontrado preguntas duplicadas por enunciado.");
    return;
  }

  console.error("✗ Preguntas con el mismo enunciado:");
  for (const [text, ids] of duplicates) {
    console.error(`  - "${text}" -> ${ids.join(", ")}`);
  }
  process.exit(1);
}

main();
