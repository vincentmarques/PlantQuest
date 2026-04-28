import {
  Component,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Router } from '@angular/router';
import { ChallengeService, CHALLENGE_CATALOG } from '../../core/services/challenge.service';
import { BadgeService } from '../../core/services/badge.service';
import { UserProgressService } from '../../core/services/user-progress.service';
import { NotificationService } from '../../core/services/notification.service';
import { Challenge, ChallengeSession } from '../../core/models/challenge.model';
import { QuizQuestion } from '../../core/models/quiz.model';
import { ChallengeCardComponent } from './challenge-card/challenge-card.component';
import { ChallengeSessionComponent, SessionOutcome } from './challenge-session/challenge-session.component';
import { ChallengeResultComponent } from './challenge-result/challenge-result.component';
import { BadgeDefinition } from '../../core/services/badge.service';

type ChallengeState = 'list' | 'playing' | 'result';

@Component({
  selector: 'app-challenge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ChallengeCardComponent, ChallengeSessionComponent, ChallengeResultComponent],
  template: `
    <div class="container challenge-page">
      @switch (state()) {

        @case ('list') {
          <div class="stack stack--lg">
            <header class="stack--sm">
              <h1>Défis 🏆</h1>
              <p class="text-muted">
                Testez-vous en conditions réelles. Débloquez les défis en apprenant plus de plantes.
              </p>
            </header>

            <!-- Défi du jour mis en avant -->
            <section class="stack--sm">
              <h2>📅 Défi du Jour</h2>
              <app-challenge-card
                [challenge]="dailyChallenge"
                [status]="dailyStatus()"
                (start)="onStart($event)"
              />
            </section>

            <!-- Tous les défis -->
            <section class="stack--sm">
              <h2>Tous les défis</h2>
              <div class="grid grid--2">
                @for (challenge of regularChallenges; track challenge.id) {
                  <app-challenge-card
                    [challenge]="challenge"
                    [status]="getStatus(challenge)"
                    (start)="onStart($event)"
                  />
                }
              </div>
            </section>

            <!-- Badges -->
            @if (unlockedBadges().length > 0) {
              <section class="stack--sm">
                <h2>Mes Badges</h2>
                <div class="flex flex--gap-md flex--wrap">
                  @for (badge of unlockedBadges(); track badge.id) {
                    <div class="card card--flat challenge-page__badge">
                      <span style="font-size: 1.5rem">{{ badge.icon }}</span>
                      <p class="text-small">{{ badge.name }}</p>
                    </div>
                  }
                </div>
              </section>
            }
          </div>
        }

        @case ('playing') {
          <div class="stack--sm" style="max-width: 680px;">
            <button class="btn btn--ghost btn--sm" (click)="onAbandon()">
              ← Abandonner
            </button>
            <app-challenge-session
              [challenge]="activeChallenge()!"
              [questions]="activeQuestions()"
              (completed)="onSessionCompleted($event)"
            />
          </div>
        }

        @case ('result') {
          <div style="max-width: 680px;">
            <app-challenge-result
              [challenge]="activeChallenge()!"
              [outcome]="lastOutcome()!"
              [newBadges]="newlyUnlockedBadges()"
              (retry)="onRetry()"
              (backToList)="state.set('list')"
            />
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .challenge-page { }
    .challenge-page__badge {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-4);
    }
  `],
})
export class ChallengeComponent {
  private readonly challengeService = inject(ChallengeService);
  private readonly badgeService = inject(BadgeService);
  private readonly progressService = inject(UserProgressService);
  private readonly notifications = inject(NotificationService);
  readonly router = inject(Router);

  readonly state = signal<ChallengeState>('list');
  readonly activeChallenge = signal<Challenge | null>(null);
  readonly activeQuestions = signal<QuizQuestion[]>([]);
  readonly lastOutcome = signal<SessionOutcome | null>(null);
  readonly newlyUnlockedBadges = signal<BadgeDefinition[]>([]);

  readonly plantsLearnedCount = computed(() => this.progressService.plantsLearnedCount());
  readonly unlockedBadges = this.badgeService.unlockedDefinitions;

  readonly dailyChallenge = this.challengeService.dailyChallenge;
  readonly regularChallenges = CHALLENGE_CATALOG.filter(c => c.type !== 'daily');

  readonly dailyStatus = computed(() =>
    this.challengeService.getStatus(this.dailyChallenge, this.plantsLearnedCount())
  );

  getStatus(challenge: Challenge) {
    return this.challengeService.getStatus(challenge, this.plantsLearnedCount());
  }

  onStart(challenge: Challenge): void {
    const questions = this.challengeService.generateQuestions(challenge);
    if (!questions.length) {
      this.notifications.error('Pas assez de plantes disponibles pour ce défi.');
      return;
    }
    this.activeChallenge.set(challenge);
    this.activeQuestions.set(questions);
    this.newlyUnlockedBadges.set([]);
    this.state.set('playing');
  }

  onSessionCompleted(outcome: SessionOutcome): void {
    this.lastOutcome.set(outcome);

    const challenge = this.activeChallenge()!;

    if (outcome.success) {
      // Record completion
      const session: ChallengeSession = {
        challengeId: challenge.id,
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        correct: outcome.correct,
        total: outcome.total,
        success: true,
      };
      this.challengeService.recordCompletion(session);

      // Points
      const points = outcome.correct * 8 + (challenge.type === 'streak' ? 30 : 20);
      this.progressService.addScore(points);
      this.progressService.incrementChallengesCompleted();

      // Badges
      const unlocked: BadgeDefinition[] = [];
      const tryUnlock = (id: string) => {
        if (this.badgeService.unlock(id)) {
          const def = this.badgeService.getBadge(id);
          if (def) unlocked.push(def);
        }
      };

      if (challenge.type === 'sprint') tryUnlock('sprint-done');
      if (challenge.type === 'streak' && challenge.target >= 5) tryUnlock('streak-5');
      if (challenge.type === 'streak' && challenge.target >= 10) tryUnlock('streak-10');
      if (challenge.type === 'daily') tryUnlock('daily-done');
      if (challenge.id === 'thematic-toxic') tryUnlock('toxicologist');

      // Progress-based badges
      const progressBadges = this.badgeService.checkProgressBadges();
      progressBadges.forEach(id => {
        const def = this.badgeService.getBadge(id);
        if (def) unlocked.push(def);
      });

      this.newlyUnlockedBadges.set(unlocked);

      if (unlocked.length > 0) {
        this.notifications.success(`Badge débloqué : ${unlocked.map(b => b.icon + ' ' + b.name).join(', ')}`);
      } else {
        this.notifications.success(`Défi relevé ! +${points} points`);
      }
    }

    this.state.set('result');
  }

  onRetry(): void {
    const challenge = this.activeChallenge();
    if (challenge) this.onStart(challenge);
  }

  onAbandon(): void {
    this.activeChallenge.set(null);
    this.activeQuestions.set([]);
    this.state.set('list');
  }
}
