import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-streak-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="widget card">
      <div class="widget__header">
        <span class="widget__icon">🔥</span>
        <div>
          <h3 class="widget__title">Série quotidienne</h3>
          <p class="widget__value">{{ streak() }} jour{{ streak() !== 1 ? 's' : '' }}</p>
        </div>
      </div>

      <div class="streak-cal">
        @for (day of last7Days(); track day.iso) {
          <div class="streak-cal__day" [class.streak-cal__day--active]="day.active" [title]="day.label">
            <span class="streak-cal__dot"></span>
            <span class="streak-cal__label">{{ day.short }}</span>
          </div>
        }
      </div>

      @if (streak() === 0) {
        <p class="widget__hint">Commencez dès aujourd'hui !</p>
      } @else if (streak() >= 7) {
        <p class="widget__hint">🏆 Une semaine d'affilée, bravo !</p>
      } @else {
        <p class="widget__hint">Continuez, {{ streak() }}/7 jours</p>
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

    .streak-cal {
      display: flex;
      justify-content: space-between;
      gap: var(--space-1);
    }

    .streak-cal__day {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-1);
      flex: 1;
    }

    .streak-cal__dot {
      width: 28px;
      height: 28px;
      border-radius: var(--radius-full);
      background-color: var(--color-surface-2);
      border: 2px solid var(--color-border);
      transition: background-color var(--transition-fast);

      .streak-cal__day--active & {
        background-color: var(--color-green-500);
        border-color: var(--color-green-500);
        box-shadow: 0 2px 8px rgba(58, 170, 66, 0.4);
      }
    }

    .streak-cal__label {
      font-size: 10px;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  `],
})
export class StreakWidgetComponent {
  readonly streak = input.required<number>();
  readonly activeDays = input<string[]>([]);

  readonly last7Days = computed(() => {
    const active = new Set(this.activeDays());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const iso = d.toISOString().split('T')[0];
      const short = d.toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 2);
      return { iso, short, label: d.toLocaleDateString('fr-FR'), active: active.has(iso) };
    });
  });
}
