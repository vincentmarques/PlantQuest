import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserProgressService } from '../../core/services/user-progress.service';
import { CollectionService } from '../../core/services/collection.service';
import { LEVEL_LABELS, LEVEL_THRESHOLDS, UserLevel } from '../../core/models/user-progress.model';

interface QuickAction {
  path: string;
  icon: string;
  label: string;
  sub: string;
  accent: boolean;
}

const ACTIONS: QuickAction[] = [
  { path: '/identify',   icon: '📷', label: 'Identifier', sub: 'Par photo',       accent: true  },
  { path: '/quiz',       icon: '🧠', label: 'Quiz',       sub: 'Tester ses bases', accent: false },
  { path: '/challenge',  icon: '🏆', label: 'Défis',      sub: 'Challenges',      accent: false },
  { path: '/collection', icon: '📖', label: 'Herbier',    sub: 'Ma collection',   accent: false },
];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="dashboard">

      <!-- Hero card -->
      <section class="container">
        <div class="hero-card card card--hero">
          <div class="hero-card__content">
            <p class="hero-card__eyebrow">Bonjour, explorateur 👋</p>
            <h1 class="hero-card__title">{{ levelLabel() }}</h1>
            <p class="hero-card__sub">{{ plantsCount() }} plante{{ plantsCount() > 1 ? 's' : '' }} apprise{{ plantsCount() > 1 ? 's' : '' }}</p>

            <!-- Progression vers prochain niveau -->
            <div class="hero-card__progress">
              <div class="hero-card__progress-bar">
                <div
                  class="hero-card__progress-fill"
                  [style.width.%]="levelProgressPct()"
                ></div>
              </div>
              <p class="hero-card__progress-label">{{ nextLevelLabel() }}</p>
            </div>
          </div>

          <div class="hero-card__stats">
            <div class="hero-card__stat">
              <span class="hero-card__stat-value">{{ streak() }}</span>
              <span class="hero-card__stat-label">🔥 Série</span>
            </div>
            <div class="hero-card__stat">
              <span class="hero-card__stat-value">{{ score() }}</span>
              <span class="hero-card__stat-label">⭐ Points</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Actions rapides -->
      <section class="container dashboard__section">
        <h2 class="dashboard__section-title">Par où commencer ?</h2>
        <div class="dashboard__actions">
          @for (action of actions; track action.path) {
            <a
              [routerLink]="action.path"
              class="action-card"
              [class.action-card--accent]="action.accent"
            >
              <span class="action-card__icon">{{ action.icon }}</span>
              <span class="action-card__label">{{ action.label }}</span>
              <span class="action-card__sub">{{ action.sub }}</span>
            </a>
          }
        </div>
      </section>

      <!-- Stats rapides -->
      <section class="container dashboard__section">
        <h2 class="dashboard__section-title">Mes statistiques</h2>
        <div class="dashboard__stats">
          <div class="stat-chip">
            <span class="stat-chip__label">Plantes apprises</span>
            <span class="stat-chip__value">{{ plantsCount() }}</span>
          </div>
          <div class="stat-chip">
            <span class="stat-chip__label">Dans l'herbier</span>
            <span class="stat-chip__value">{{ collectionCount() }}</span>
          </div>
          <div class="stat-chip">
            <span class="stat-chip__label">Série actuelle</span>
            <span class="stat-chip__value">{{ streak() }} 🔥</span>
          </div>
          <div class="stat-chip">
            <span class="stat-chip__label">Score total</span>
            <span class="stat-chip__value">{{ score() }}</span>
          </div>
        </div>
      </section>

    </div>
  `,
  styles: [`
    .dashboard {
      display: flex;
      flex-direction: column;
      gap: var(--space-8);
    }

    // ----- Hero card -----
    .hero-card {
      padding: var(--space-6);
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
      min-height: 220px;

      @media (min-width: 480px) {
        flex-direction: row;
        align-items: flex-end;
      }
    }

    .hero-card__content { flex: 1; display: flex; flex-direction: column; gap: var(--space-3); }

    .hero-card__eyebrow {
      font-size: var(--text-sm);
      opacity: 0.85;
    }

    .hero-card__title {
      font-family: var(--font-display);
      font-size: var(--text-3xl);
      font-weight: var(--weight-bold);
      color: #ffffff;
      line-height: var(--leading-tight);
    }

    .hero-card__sub { font-size: var(--text-sm); opacity: 0.8; }

    .hero-card__progress { display: flex; flex-direction: column; gap: var(--space-2); margin-top: var(--space-2); }

    .hero-card__progress-bar {
      height: 6px;
      background-color: rgba(255, 255, 255, 0.25);
      border-radius: var(--radius-full);
      overflow: hidden;
    }

    .hero-card__progress-fill {
      height: 100%;
      background-color: rgba(255, 255, 255, 0.85);
      border-radius: var(--radius-full);
      transition: width 0.8s ease;
    }

    .hero-card__progress-label { font-size: var(--text-xs); opacity: 0.7; }

    .hero-card__stats {
      display: flex;
      gap: var(--space-4);

      @media (min-width: 480px) {
        flex-direction: column;
        align-items: flex-end;
        gap: var(--space-3);
      }
    }

    .hero-card__stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      background-color: rgba(255, 255, 255, 0.18);
      border-radius: var(--radius-lg);
      padding: var(--space-3) var(--space-4);
      min-width: 72px;
    }

    .hero-card__stat-value {
      font-family: var(--font-display);
      font-size: var(--text-2xl);
      font-weight: var(--weight-bold);
      color: #ffffff;
    }

    .hero-card__stat-label { font-size: var(--text-xs); opacity: 0.8; white-space: nowrap; }

    // ----- Section -----
    .dashboard__section-title {
      font-size: var(--text-lg);
      font-weight: var(--weight-bold);
      margin-bottom: var(--space-4);
      color: var(--color-ink);
    }

    // ----- Action cards -----
    .dashboard__actions {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-3);

      @media (min-width: 640px) {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    .action-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      padding: var(--space-5) var(--space-3);
      background-color: var(--color-surface);
      border-radius: var(--radius-xl);
      border: var(--border-width) solid var(--color-border-light);
      box-shadow: var(--shadow-sm);
      text-decoration: none;
      text-align: center;
      transition: transform var(--transition-base), box-shadow var(--transition-base);

      &:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
      &:active { transform: translateY(0); }

      &--accent {
        background: linear-gradient(135deg, var(--color-green-500), var(--color-green-600));
        border-color: transparent;
        box-shadow: 0 6px 20px rgba(58, 170, 66, 0.35);

        .action-card__label { color: #fff; }
        .action-card__sub { color: rgba(255,255,255,0.75); }
      }
    }

    .action-card__icon { font-size: 1.8rem; line-height: 1; }
    .action-card__label { font-weight: var(--weight-semibold); font-size: var(--text-sm); color: var(--color-ink); }
    .action-card__sub { font-size: var(--text-xs); color: var(--color-text-muted); }

    // ----- Stats grid -----
    .dashboard__stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-3);

      @media (min-width: 640px) {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    .dashboard__section { display: flex; flex-direction: column; }
  `],
})
export class DashboardComponent {
  private readonly progressService = inject(UserProgressService);
  private readonly collectionService = inject(CollectionService);

  readonly actions = ACTIONS;
  readonly plantsCount = this.progressService.plantsLearnedCount;
  readonly streak = this.progressService.streak;
  readonly level = this.progressService.level;
  readonly score = this.progressService.score;
  readonly collectionCount = this.collectionService.count;

  readonly levelLabel = () => LEVEL_LABELS[this.level()];

  readonly levelProgressPct = () => {
    const count = this.plantsCount();
    const levels: [UserLevel, number][] = Object.entries(LEVEL_THRESHOLDS) as [UserLevel, number][];
    const sorted = levels.sort((a, b) => a[1] - b[1]);
    const currentIdx = sorted.findIndex(([key]) => key === this.level());
    const current = sorted[currentIdx]?.[1] ?? 0;
    const next = sorted[currentIdx + 1]?.[1];
    if (!next) return 100;
    return Math.round(((count - current) / (next - current)) * 100);
  };

  readonly nextLevelLabel = () => {
    const levels: [UserLevel, number][] = Object.entries(LEVEL_THRESHOLDS) as [UserLevel, number][];
    const sorted = levels.sort((a, b) => a[1] - b[1]);
    const currentIdx = sorted.findIndex(([key]) => key === this.level());
    const next = sorted[currentIdx + 1];
    if (!next) return 'Niveau maximum atteint 🌳';
    return `${next[1] - this.plantsCount()} plante${next[1] - this.plantsCount() > 1 ? 's' : ''} jusqu'au niveau suivant`;
  };
}
