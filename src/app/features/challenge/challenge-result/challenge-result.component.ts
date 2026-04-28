import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
  signal,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { Challenge } from '../../../core/models/challenge.model';
import { SessionOutcome } from '../challenge-session/challenge-session.component';
import { BadgeDefinition } from '../../../core/services/badge.service';

@Component({
  selector: 'app-challenge-result',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
  template: `
    <div class="challenge-result stack stack--lg">

      <!-- Hero victoire / défaite -->
      <div
        class="challenge-result__hero card card--elevated text-center stack"
        [ngClass]="outcome.success ? 'challenge-result__hero--win' : 'challenge-result__hero--lose'"
      >
        <span class="challenge-result__emoji" [ngClass]="animate() ? 'challenge-result__emoji--bounce' : ''">
          {{ outcome.success ? '🏆' : '🍂' }}
        </span>

        <div>
          <h2 class="challenge-result__headline">
            {{ outcome.success ? 'Défi relevé !' : 'Pas cette fois…' }}
          </h2>
          <p class="text-muted">
            {{ challenge.title }}
          </p>
        </div>

        <!-- Stats -->
        <div class="challenge-result__stats">
          <div class="challenge-result__stat">
            <span class="challenge-result__stat-value">{{ outcome.correct }}</span>
            <span class="text-small text-muted">bonnes réponses</span>
          </div>
          <div class="challenge-result__stat">
            <span class="challenge-result__stat-value">{{ outcome.total }}</span>
            <span class="text-small text-muted">questions</span>
          </div>
          @if (outcome.timeUsed !== undefined && challenge.type === 'sprint') {
            <div class="challenge-result__stat">
              <span class="challenge-result__stat-value">{{ outcome.timeUsed }}s</span>
              <span class="text-small text-muted">utilisées</span>
            </div>
          }
          @if (outcome.streak !== undefined && challenge.type === 'streak') {
            <div class="challenge-result__stat">
              <span class="challenge-result__stat-value">{{ outcome.streak }}</span>
              <span class="text-small text-muted">série max</span>
            </div>
          }
        </div>

        <!-- Points -->
        @if (outcome.success) {
          <p class="challenge-result__points">
            + {{ pointsEarned }} points 🌿
          </p>
        }
      </div>

      <!-- Badges débloqués -->
      @if (newBadges.length > 0) {
        <div class="stack--sm">
          <h3>Badge{{ newBadges.length > 1 ? 's' : '' }} débloqué{{ newBadges.length > 1 ? 's' : '' }} !</h3>
          <div class="flex flex--gap-md flex--wrap">
            @for (badge of newBadges; track badge.id) {
              <div class="card card--flat challenge-result__badge">
                <span style="font-size: 2rem">{{ badge.icon }}</span>
                <div>
                  <p class="challenge-result__badge-name">{{ badge.name }}</p>
                  <p class="text-small text-muted">{{ badge.description }}</p>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Message encouragement -->
      @if (!outcome.success) {
        <div class="alert alert--info" role="note">
          <span class="alert__icon">💡</span>
          <p class="alert__message">{{ encouragement }}</p>
        </div>
      }

      <!-- Actions -->
      <div class="flex flex--gap-md flex--wrap">
        <button class="btn btn--primary" (click)="retry.emit()">Réessayer</button>
        <button class="btn btn--ghost" (click)="backToList.emit()">Tous les défis</button>
      </div>
    </div>
  `,
  styles: [`
    .challenge-result__hero {
      padding: var(--space-8);

      &--win { border-top: 4px solid var(--color-success); }
      &--lose { border-top: 4px solid var(--color-error); }
    }

    .challenge-result__emoji {
      font-size: 4rem;
      line-height: 1;
      display: block;

      &--bounce { animation: victoryBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
    }

    @keyframes victoryBounce {
      0%   { transform: scale(0.3) rotate(-10deg); opacity: 0; }
      60%  { transform: scale(1.2) rotate(5deg); }
      100% { transform: scale(1) rotate(0deg); opacity: 1; }
    }

    .challenge-result__headline {
      font-size: var(--text-2xl);
      color: var(--color-green-700);
    }

    .challenge-result__stats {
      display: flex;
      justify-content: center;
      gap: var(--space-8);
      flex-wrap: wrap;
    }

    .challenge-result__stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-1);
    }

    .challenge-result__stat-value {
      font-family: var(--font-display);
      font-size: var(--text-3xl);
      font-weight: var(--weight-bold);
      color: var(--color-green-600);
    }

    .challenge-result__points {
      font-weight: var(--weight-semibold);
      color: var(--color-earth-500);
      font-size: var(--text-lg);
    }

    .challenge-result__badge {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-4);
    }

    .challenge-result__badge-name { font-weight: var(--weight-semibold); }
  `],
})
export class ChallengeResultComponent implements OnInit {
  @Input({ required: true }) challenge!: Challenge;
  @Input({ required: true }) outcome!: SessionOutcome;
  @Input() newBadges: BadgeDefinition[] = [];

  @Output() retry = new EventEmitter<void>();
  @Output() backToList = new EventEmitter<void>();

  readonly animate = signal(false);

  get pointsEarned(): number {
    const base = this.outcome.correct * 8;
    const bonus = this.challenge.type === 'sprint' ? 20 : this.challenge.type === 'streak' ? 30 : 10;
    return base + (this.outcome.success ? bonus : 0);
  }

  get encouragement(): string {
    const msgs = [
      'Révisez les plantes dans votre herbier puis réessayez !',
      'Faites quelques quiz pour vous entraîner d\'abord.',
      'Chaque erreur est une occasion d\'apprendre. Allez-y !',
    ];
    return msgs[Math.floor(Math.random() * msgs.length)];
  }

  ngOnInit(): void {
    if (this.outcome.success) {
      setTimeout(() => this.animate.set(true), 100);
    }
  }
}
