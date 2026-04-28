import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Challenge } from '../../../core/models/challenge.model';

@Component({
  selector: 'app-next-challenge-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="widget card">
      <div class="widget__header">
        <span class="widget__icon">🏆</span>
        <div>
          <h3 class="widget__title">Prochain défi</h3>
        </div>
      </div>

      @if (challenge()) {
        <div class="challenge-preview">
          <span class="challenge-preview__icon">{{ challenge()!.icon }}</span>
          <div class="challenge-preview__body">
            <p class="challenge-preview__title">{{ challenge()!.title }}</p>
            <p class="challenge-preview__desc">{{ challenge()!.description }}</p>
          </div>
        </div>
        <a routerLink="/challenge" class="btn btn--primary btn--sm btn--full">Relever le défi →</a>
      } @else {
        <p class="widget__hint">Tous les défis sont complétés ! 🌟</p>
        <a routerLink="/challenge" class="btn btn--ghost btn--sm">Voir les défis</a>
      }
    </div>
  `,
  styles: [`
    .widget {
      padding: var(--space-5);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .widget__header {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .widget__icon { font-size: 1.75rem; line-height: 1; }

    .widget__title {
      margin: 0;
      font-size: var(--text-sm);
      color: var(--color-text-muted);
      font-weight: var(--weight-medium);
    }

    .widget__hint {
      margin: 0;
      font-size: var(--text-xs);
      color: var(--color-text-muted);
    }

    .challenge-preview {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      background-color: var(--color-surface-2);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
    }

    .challenge-preview__icon { font-size: 1.5rem; line-height: 1; flex-shrink: 0; }

    .challenge-preview__body { display: flex; flex-direction: column; gap: var(--space-1); min-width: 0; }

    .challenge-preview__title {
      margin: 0;
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      color: var(--color-ink);
    }

    .challenge-preview__desc {
      margin: 0;
      font-size: var(--text-xs);
      color: var(--color-text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `],
})
export class NextChallengeWidgetComponent {
  readonly challenge = input<Challenge | null>(null);
}
