export type QuestionType =
  | 'photo-to-name'
  | 'name-to-photo'
  | 'true-false'
  | 'family';

export type Difficulty = 'beginner' | 'intermediate' | 'expert';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  plantId: string;
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  imageUrl?: string;
  explanation?: string;
}

export interface QuizOption {
  id: string;
  label: string;
  imageUrl?: string;
}

export interface QuizSession {
  id: string;
  difficulty: Difficulty;
  questions: QuizQuestion[];
  answers: Record<string, string>;
  startedAt: string;
  completedAt?: string;
  score?: number;
}

export interface QuizResult {
  session: QuizSession;
  score: number;
  total: number;
  percentage: number;
  wrongPlantIds: string[];
}
