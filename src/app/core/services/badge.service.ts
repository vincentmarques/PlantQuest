import { Injectable, inject, computed } from '@angular/core';
import { UserProgressService } from './user-progress.service';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const BADGE_CATALOG: BadgeDefinition[] = [
  { id: 'first-quiz',    name: 'Premier Quiz',      icon: '🧠', description: 'Complétez votre premier quiz' },
  { id: 'quiz-perfect',  name: 'Score Parfait',      icon: '⭐', description: '100% de bonnes réponses à un quiz' },
  { id: 'sprint-done',   name: 'Sprinter',           icon: '⚡', description: 'Terminez un Sprint Botanique' },
  { id: 'streak-5',      name: 'Série de 5',         icon: '🎯', description: '5 bonnes réponses consécutives' },
  { id: 'streak-10',     name: 'Série Parfaite',     icon: '💎', description: '10 bonnes réponses consécutives' },
  { id: 'daily-done',    name: 'Régulier',           icon: '📅', description: 'Relevez le défi du jour' },
  { id: 'toxicologist',  name: 'Toxicologue',        icon: '☠️', description: 'Identifiez toutes les plantes toxiques' },
  { id: 'collector-5',   name: 'Collecteur',         icon: '📖', description: '5 plantes dans l\'herbier' },
  { id: 'collector-10',  name: 'Grand Collecteur',   icon: '🌿', description: '10 plantes dans l\'herbier' },
  { id: 'week-streak',   name: 'Assidu',             icon: '🔥', description: 'Connectez-vous 7 jours de suite' },
  { id: 'first-plant',   name: 'Première Plante',    icon: '🌱', description: 'Identifiez votre première plante' },
  { id: 'naturalist-20', name: 'Naturaliste',        icon: '🔭', description: 'Apprenez 20 plantes' },
];

@Injectable({ providedIn: 'root' })
export class BadgeService {
  private readonly progressService = inject(UserProgressService);

  readonly unlockedBadges = this.progressService.badges;

  readonly unlockedDefinitions = computed(() =>
    BADGE_CATALOG.filter(b => this.unlockedBadges().includes(b.id))
  );

  readonly lockedDefinitions = computed(() =>
    BADGE_CATALOG.filter(b => !this.unlockedBadges().includes(b.id))
  );

  unlock(badgeId: string): boolean {
    if (this.unlockedBadges().includes(badgeId)) return false;
    this.progressService.unlockBadge(badgeId);
    return true;
  }

  checkProgressBadges(): string[] {
    const progress = this.progressService.progress();
    const newlyUnlocked: string[] = [];

    const check = (id: string, condition: boolean) => {
      if (condition && this.unlock(id)) newlyUnlocked.push(id);
    };

    check('first-plant',   progress.plantsLearned.length >= 1);
    check('collector-5',   progress.plantsLearned.length >= 5);
    check('collector-10',  progress.plantsLearned.length >= 10);
    check('naturalist-20', progress.plantsLearned.length >= 20);
    check('first-quiz',    progress.quizzesCompleted >= 1);
    check('week-streak',   progress.streak >= 7);

    return newlyUnlocked;
  }

  getBadge(id: string): BadgeDefinition | undefined {
    return BADGE_CATALOG.find(b => b.id === id);
  }
}
