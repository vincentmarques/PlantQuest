export interface UserProgress {
  score: number;
  plantsLearned: string[];
  streak: number;
  lastActiveDate: string | null;
  activeDays: string[];
  quizzesCompleted: number;
  challengesCompleted: number;
  badges: string[];
  level: UserLevel;
  onboardingCompleted: boolean;
  preferredDifficulty: 'beginner' | 'intermediate' | 'expert';
}

export type UserLevel = 'seed' | 'sprout' | 'shrub' | 'tree' | 'forest';

export const LEVEL_THRESHOLDS: Record<UserLevel, number> = {
  seed:   0,
  sprout: 5,
  shrub:  15,
  tree:   35,
  forest: 70,
};

export const LEVEL_LABELS: Record<UserLevel, string> = {
  seed:   'Graine',
  sprout: 'Pousse',
  shrub:  'Arbuste',
  tree:   'Arbre',
  forest: 'Forêt',
};

export const DEFAULT_PROGRESS: UserProgress = {
  score: 0,
  plantsLearned: [],
  streak: 0,
  lastActiveDate: null,
  activeDays: [],
  quizzesCompleted: 0,
  challengesCompleted: 0,
  badges: [],
  level: 'seed',
  onboardingCompleted: false,
  preferredDifficulty: 'beginner',
};
