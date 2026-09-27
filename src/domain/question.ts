export type QuestionType =
  | "single-choice"
  | "multiple-choice";

export type Difficulty =
  | "easy"
  | "medium"
  | "hard";

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;

  topic: string;
  subtopic: string;

  difficulty: Difficulty;
  type: QuestionType;

  question: string;

  options: QuestionOption[];

  correctAnswers: string[];

  explanation: string;

  sourcePage: number;

  tags: string[];
}