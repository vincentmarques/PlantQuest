import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { NgClass } from '@angular/common';
import { Challenge, ChallengeStatus } from '../../../core/models/challenge.model';

@Component({
  selector: 'app-challenge-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
  template: `
    <div
      class="challenge-card card"
      [ngClass]="{
        'card--interactive': status === 'available',
        'challenge-card--locked': status === 'locked',
        'challenge-card--done': status === 'completed'
      }"
      [attr.aria-disabled]="status !== 'available'"
    >
      <div class="challenge-card__top">
        <span class="challenge-card__icon" aria-hidden="true">{{ challenge.icon }}</span>
        <span class="badge" [ngClass]="statusBadgeClass">{{ statusLabel }}</span>
      </div>

      <div class="challenge-card__body">
        <h3 class="challenge-card__title">{{ challenge.title }}</h3>
        <p class="challenge-card__desc text-muted text-small">{{ challenge.description }}</p>
      </div>

      <div class="challenge-card__meta">
        @if (challenge.timeLimit) {
          <span class="tag">⏱ {{ challenge.timeLimit }}s</span>
        }
        <span class="tag">🎯 {{ challenge.target }} questions</span>
        @if ((challenge.unlocksAt ?? 0) > 0 && status === 'locked') {
          <span class="tag">🔒 {{ challenge.unlocksAt }} plantes requises</span>
        }
      </div>

      @if (status === 'available') {
        <button class="btn btn--primary btn--full" (click)="start.emit(challenge)">
          Relever le défi
        </button>
      } @else if (status === 'completed') {
        <button class="btn btn--ghost btn--full" (click)="start.emit(challenge)">
          Rejouer
        </button>
      } @else {
        <button class="btn btn--ghost btn--full" disabled>
          🔒 Verrouillé
        </button>
      }
    </div>
  `,
  styles: [`
    .challenge-card {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      height: 100%;

      &--locked {
        opacity: 0.6;
        filter: grayscale(0.4);
      }

      &--done { border-left: 4px solid var(--color-success); }
    }

    .challenge-card__top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .challenge-card__icon { font-size: 2.2rem; line-height: 1; }

    .challenge-card__body { flex: 1; }
    .challenge-card__title { font-size: var(--text-lg); margin-bottom: var(--space-1); }

    .challenge-card__meta {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }
  `],
})
export class ChallengeCardComponent {
  @Input({ required: true }) challenge!: Challenge;
  @Input() status: ChallengeStatus = 'available';
  @Output() start = new EventEmitter<Challenge>();

  get statusLabel(): string {
    return { locked: 'Verrouillé', available: 'Disponible', completed: 'Complété' }[this.status];
  }

  get statusBadgeClass(): string {
    return { locked: 'badge--neutral', available: 'badge--info', completed: 'badge--success' }[this.status];
  }
}
