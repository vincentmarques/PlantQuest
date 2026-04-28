import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { BadgeDefinition } from '../../../core/services/badge.service';

@Component({
  selector: 'app-badges-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="widget card">
      <div class="widget__header">
        <span class="widget__icon">🏅</span>
        <div>
          <h3 class="widget__title">Badges débloqués</h3>
          <p class="widget__value">{{ unlocked().length }} / {{ total() }}</p>
        </div>
      </div>

      @if (recent().length > 0) {
        <div class="badges-row">
          @for (badge of recent(); track badge.id) {
            <div class="badge-chip" [title]="badge.description">
              <span class="badge-chip__icon">{{ badge.icon }}</span>
              <span class="badge-chip__name">{{ badge.name }}</span>
            </div>
          }
        </div>
      } @else {
        <p class="widget__hint">Aucun badge encore — lancez un quiz !</p>
      }

      <div class="badges-progress">
        <div class="badges-progress__bar">
          <div class="badges-progress__fill" [style.width.%]="pct()"></div>
        </div>
        <span class="widget__hint">{{ pct() }}% de la collection</span>
      </div>
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

    .widget__value {
      margin: 0;
      font-size: var(--text-xl);
      font-weight: var(--weight-bold);
      color: var(--color-ink);
    }

    .widget__hint {
      margin: 0;
      font-size: var(--text-xs);
      color: var(--color-text-muted);
    }

    .badges-row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    .badge-chip {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      background-color: var(--color-surface-2);
      border-radius: var(--radius-full);
      padding: var(--space-1) var(--space-3);
      border: 1px solid var(--color-border);
    }

    .badge-chip__icon { font-size: 1rem; }
    .badge-chip__name { font-size: var(--text-xs); font-weight: var(--weight-medium); color: var(--color-ink); }

    .badges-progress { display: flex; flex-direction: column; gap: var(--space-1); }

    .badges-progress__bar {
      height: 6px;
      background-color: var(--color-surface-2);
      border-radius: var(--radius-full);
      overflow: hidden;
    }

    .badges-progress__fill {
      height: 100%;
      background-color: var(--color-earth-400);
      border-radius: var(--radius-full);
      transition: width 0.6s ease;
    }
  `],
})
export class BadgesWidgetComponent {
  readonly unlocked = input.required<BadgeDefinition[]>();
  readonly total = input.required<number>();

  get recent(): () => BadgeDefinition[] {
    return () => this.unlocked().slice(-4);
  }

  pct(): number {
    const t = this.total();
    return t > 0 ? Math.round((this.unlocked().length / t) * 100) : 0;
  }
}
