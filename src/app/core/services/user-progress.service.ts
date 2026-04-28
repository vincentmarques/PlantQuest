import { Injectable, signal, computed, effect, inject } from '@angular/core';
import {
  UserProgress,
  UserLevel,
  DEFAULT_PROGRESS,
  LEVEL_THRESHOLDS,
} from '../models/user-progress.model';
import { StorageService } from './storage.service';

const STORAGE_KEY = 'pq_user_progress';

@Injectable({ providedIn: 'root' })
export class UserProgressService {
  private readonly storage = inject(StorageService);

  private readonly _progress = signal<UserProgress>({
    ...DEFAULT_PROGRESS,
    ...(this.storage.get<UserProgress>(STORAGE_KEY) ?? {}),
  });

  readonly progress = this._progress.asReadonly();
  readonly score = computed(() => this._progress().score);
  readonly plantsLearned = computed(() => this._progress().plantsLearned);
  readonly streak = computed(() => this._progress().streak);
  readonly activeDays = computed(() => this._progress().activeDays);
  readonly badges = computed(() => this._progress().badges);
  readonly level = computed(() => this._progress().level);
  readonly plantsLearnedCount = computed(() => this._progress().plantsLearned.length);
  readonly onboardingCompleted = computed(() => this._progress().onboardingCompleted);
  readonly preferredDifficulty = computed(() => this._progress().preferredDifficulty);

  constructor() {
    effect(() => {
      this.storage.set(STORAGE_KEY, this._progress());
    });
    this.updateStreak();
  }

  addScore(points: number): void {
    this._progress.update(p => ({ ...p, score: p.score + points }));
  }

  markPlantLearned(plantId: string): void {
    this._progress.update(p => {
      if (p.plantsLearned.includes(plantId)) return p;
      const plantsLearned = [...p.plantsLearned, plantId];
      return { ...p, plantsLearned, level: this.computeLevel(plantsLearned.length) };
    });
  }

  incrementQuizzesCompleted(): void {
    this._progress.update(p => ({ ...p, quizzesCompleted: p.quizzesCompleted + 1 }));
  }

  incrementChallengesCompleted(): void {
    this._progress.update(p => ({ ...p, challengesCompleted: p.challengesCompleted + 1 }));
  }

  unlockBadge(badgeId: string): void {
    this._progress.update(p => {
      if (p.badges.includes(badgeId)) return p;
      return { ...p, badges: [...p.badges, badgeId] };
    });
  }

  completeOnboarding(difficulty: 'beginner' | 'intermediate' | 'expert'): void {
    this._progress.update(p => ({ ...p, onboardingCompleted: true, preferredDifficulty: difficulty }));
  }

  reset(): void {
    this._progress.set({ ...DEFAULT_PROGRESS });
  }

  private updateStreak(): void {
    const today = new Date().toISOString().split('T')[0];
    this._progress.update(p => {
      if (p.lastActiveDate === today) return p;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const streak = p.lastActiveDate === yesterday ? p.streak + 1 : 1;
      const activeDays = [...new Set([...(p.activeDays ?? []), today])].slice(-30);
      return { ...p, streak, lastActiveDate: today, activeDays };
    });
  }

  private computeLevel(plantsCount: number): UserLevel {
    const thresholds = Object.entries(LEVEL_THRESHOLDS) as [UserLevel, number][];
    return thresholds.reduce<UserLevel>(
      (lvl, [key, min]) => (plantsCount >= min ? key : lvl),
      'seed'
    );
  }
}
