import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const QUESTIONS_DIR = path.resolve(__dirname, "../../src/data/questions");

export function loadAllQuestions() {
  const files = readdirSync(QUESTIONS_DIR).filter((file) => file.endsWith(".json"));
  const questions = [];

  for (const file of files) {
    const content = readFileSync(path.join(QUESTIONS_DIR, file), "utf-8");
    const parsed = JSON.parse(content);
    for (const question of parsed) {
      questions.push({ ...question, sourceFile: file });
    }
  }

  return questions;
}
