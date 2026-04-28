export type ChallengeType = 'sprint' | 'streak' | 'thematic' | 'daily';
export type ChallengeStatus = 'locked' | 'available' | 'completed';

export interface Challenge {
  id: string;
  type: ChallengeType;
  title: string;
  description: string;
  icon: string;
  target: number;
  timeLimit?: number;
  theme?: string;
  unlocksAt?: number;
}

export interface ChallengeSession {
  challengeId: string;
  startedAt: string;
  completedAt?: string;
  correct: number;
  total: number;
  success: boolean;
}
