import { loadAllQuestions } from "./lib/loadQuestions.js";

const VALID_TYPES = new Set(["single-choice", "multiple-choice"]);
const VALID_DIFFICULTIES = new Set(["easy", "medium", "hard"]);

function validateQuestion(question) {
  const issues = [];
  const fail = (message) => issues.push(message);

  if (!question.id) fail("Falta id");
  if (!question.topic) fail("Falta topic");
  if (!question.subtopic) fail("Falta subtopic");
  if (!VALID_DIFFICULTIES.has(question.difficulty)) fail(`difficulty inválida: ${question.difficulty}`);
  if (!VALID_TYPES.has(question.type)) fail(`type inválido: ${question.type}`);
  if (!question.question?.trim()) fail("Falta el enunciado");
  if (!question.explanation?.trim()) fail("Falta explanation");
  if (!question.sourcePage || question.sourcePage < 1) fail("sourcePage inválido o ausente");

  if (!question.options || question.options.length < 2) {
    fail("Debe tener al menos 2 opciones");
  } else {
    const optionIds = new Set(question.options.map((option) => option.id));
    if (optionIds.size !== question.options.length) fail("Hay ids de opciones duplicados");

    if (!question.correctAnswers || question.correctAnswers.length === 0) {
      fail("correctAnswers no puede estar vacío");
    } else {
      const invalidRefs = question.correctAnswers.filter((id) => !optionIds.has(id));
      if (invalidRefs.length > 0) fail(`correctAnswers referencia opciones inexistentes: ${invalidRefs.join(", ")}`);
      if (question.type === "single-choice" && question.correctAnswers.length !== 1) {
        fail("single-choice debe tener exactamente 1 respuesta correcta");
      }
      if (question.type === "multiple-choice" && question.correctAnswers.length < 2) {
        fail("multiple-choice debe tener al menos 2 respuestas correctas");
      }
    }
  }

  return issues;
}

function main() {
  const questions = loadAllQuestions();
  let hasErrors = false;

  for (const question of questions) {
    const issues = validateQuestion(question);
    if (issues.length > 0) {
      hasErrors = true;
      console.error(`✗ ${question.sourceFile} :: ${question.id ?? "(sin id)"}`);
      for (const issue of issues) console.error(`  - ${issue}`);
    }
  }

  const idCounts = new Map();
  for (const question of questions) {
    idCounts.set(question.id, (idCounts.get(question.id) ?? 0) + 1);
  }
  for (const [id, count] of idCounts) {
    if (count > 1) {
      hasErrors = true;
      console.error(`✗ id duplicado "${id}" (${count} veces)`);
    }
  }

  if (hasErrors) {
    console.error(`\nValidación fallida: ${questions.length} preguntas revisadas.`);
    process.exit(1);
  }

  console.log(`✓ ${questions.length} preguntas válidas.`);
}

main();
