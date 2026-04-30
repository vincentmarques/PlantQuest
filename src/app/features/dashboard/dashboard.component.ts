import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserProgressService } from '../../core/services/user-progress.service';
import { CollectionService } from '../../core/services/collection.service';
import { BadgeService, BADGE_CATALOG } from '../../core/services/badge.service';
import { ChallengeService, CHALLENGE_CATALOG } from '../../core/services/challenge.service';
import { LEVEL_LABELS, LEVEL_THRESHOLDS, UserLevel } from '../../core/models/user-progress.model';
import { StreakWidgetComponent } from './widgets/streak-widget.component';
import { BadgesWidgetComponent } from './widgets/badges-widget.component';
import { NextChallengeWidgetComponent } from './widgets/next-challenge-widget.component';
import { ReviewWidgetComponent } from './widgets/review-widget.component';

interface QuickAction {
  path: string;
  icon: string;
  label: string;
  sub: string;
  accent: boolean;
}

const ACTIONS: QuickAction[] = [
  { path: '/identify',   icon: '📷', label: 'Identifier', sub: 'Par photo',        accent: true  },
  { path: '/quiz',       icon: '🧠', label: 'Quiz',       sub: 'Tester ses bases',  accent: false },
  { path: '/challenge',  icon: '🏆', label: 'Défis',      sub: 'Challenges',        accent: false },
  { path: '/collection', icon: '📖', label: 'Herbier',    sub: 'Ma collection',     accent: false },
];

const MOTIVATION: Record<UserLevel, string[]> = {
  seed:   ["Chaque expert a été débutant. Bienvenue !", "Votre aventure botanique commence ici."],
  sprout: ["Les racines poussent. Continuez !", "Vous avez planté les premières graines du savoir."],
  shrub:  ["Votre herbier prend de l’ampleur.", "Vous reconnaissez déjà plus de plantes que la plupart !"],
  tree:   ["Un vrai naturaliste en devenir !", "Vos connaissances poussent comme un arbre majestueux."],
  forest: ["Vous êtes la forêt. Transmettez votre savoir 🌳", "Le sommet — mais il y a toujours plus à explorer."],
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    StreakWidgetComponent,
    BadgesWidgetComponent,
    NextChallengeWidgetComponent,
    ReviewWidgetComponent,
  ],
  template: `
    <div class="dashboard">

      <!-- Hero card -->
      <section class="container">
        <div class="hero-card card">
          <div class="hero-card__content">
            <p class="hero-card__eyebrow">{{ motivationMsg() }}</p>
            <h1 class="hero-card__title">{{ levelLabel() }}</h1>
            <p class="hero-card__sub">{{ plantsCount() }} plante{{ plantsCount() > 1 ? 's' : '' }} apprise{{ plantsCount() > 1 ? 's' : '' }}</p>

            <div class="hero-card__progress">
              <div class="hero-card__progress-bar">
                <div class="hero-card__progress-fill" [style.width.%]="levelProgressPct()"></div>
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
            <a [routerLink]="action.path" class="action-card" [class.action-card--accent]="action.accent">
              <span class="action-card__icon">{{ action.icon }}</span>
              <span class="action-card__label">{{ action.label }}</span>
              <span class="action-card__sub">{{ action.sub }}</span>
            </a>
          }
        </div>
      </section>

      <!-- Widgets -->
      <section class="container dashboard__section">
        <h2 class="dashboard__section-title">Mes progrès</h2>
        <div class="dashboard__widgets">
          <app-streak-widget [streak]="streak()" [activeDays]="activeDays()" />
          <app-badges-widget [unlocked]="unlockedBadges()" [total]="totalBadges" />
          <app-next-challenge-widget [challenge]="nextChallenge()" />
          <app-review-widget [entries]="collectionEntries()" />
        </div>
      </section>

      <!-- Statistiques CSS -->
      <section class="container dashboard__section">
        <h2 class="dashboard__section-title">Statistiques</h2>
        <div class="stats-grid">

          <div class="card stat-card">
            <h4 class="stat-card__title">Plantes par difficulté</h4>
            @for (row of plantsByDifficulty(); track row.label) {
              <div class="stat-bar">
                <div class="stat-bar__label">
                  <span>{{ row.label }}</span>
                  <span class="text-muted">{{ row.count }}</span>
                </div>
                <div class="stat-bar__track">
                  <div class="stat-bar__fill" [class]="'stat-bar__fill--' + row.key" [style.width.%]="row.pct"></div>
                </div>
              </div>
            }
          </div>

          <div class="card stat-card">
            <h4 class="stat-card__title">Activité</h4>
            <div class="activity-grid">
              <div class="activity-item">
                <span class="activity-item__value">{{ quizzesCompleted() }}</span>
                <span class="activity-item__label">Quiz terminés</span>
              </div>
              <div class="activity-item">
                <span class="activity-item__value">{{ challengesCompleted() }}</span>
                <span class="activity-item__label">Défis réussis</span>
              </div>
              <div class="activity-item">
                <span class="activity-item__value">{{ collectionCount() }}</span>
                <span class="activity-item__label">Plantes herbier</span>
              </div>
              <div class="activity-item">
                <span class="activity-item__value">{{ score() }}</span>
                <span class="activity-item__label">Points totaux</span>
              </div>
            </div>
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
      padding-bottom: var(--space-16);
    }

    // ----- Hero card -----
    .hero-card {
      padding: var(--space-6);
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
      background: linear-gradient(135deg, var(--color-primary-600), var(--color-primary-500));
      color: #fff;
      min-height: 200px;

      @media (min-width: 480px) {
        flex-direction: row;
        align-items: flex-end;
      }
    }

    .hero-card__content { flex: 1; display: flex; flex-direction: column; gap: var(--space-3); }

    .hero-card__eyebrow { font-size: var(--text-sm); opacity: 0.85; margin: 0; }

    .hero-card__title {
      font-family: var(--font-display);
      font-size: var(--text-3xl);
      font-weight: var(--weight-bold);
      color: #fff;
      line-height: var(--leading-tight);
      margin: 0;
    }

    .hero-card__sub { font-size: var(--text-sm); opacity: 0.8; margin: 0; }

    .hero-card__progress { display: flex; flex-direction: column; gap: var(--space-2); margin-top: var(--space-2); }

    .hero-card__progress-bar {
      height: 6px;
      background-color: rgba(255,255,255,0.25);
      border-radius: var(--radius-full);
      overflow: hidden;
    }

    .hero-card__progress-fill {
      height: 100%;
      background-color: rgba(255,255,255,0.85);
      border-radius: var(--radius-full);
      transition: width 0.8s ease;
    }

    .hero-card__progress-label { font-size: var(--text-xs); opacity: 0.7; margin: 0; }

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
      background-color: rgba(255,255,255,0.18);
      border-radius: var(--radius-lg);
      padding: var(--space-3) var(--space-4);
      min-width: 72px;
    }

    .hero-card__stat-value {
      font-family: var(--font-display);
      font-size: var(--text-2xl);
      font-weight: var(--weight-bold);
      color: #fff;
    }

    .hero-card__stat-label { font-size: var(--text-xs); opacity: 0.8; white-space: nowrap; }

    // ----- Section -----
    .dashboard__section { display: flex; flex-direction: column; }

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

      @media (min-width: 640px) { grid-template-columns: repeat(4, 1fr); }
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
        background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
        border-color: transparent;
        box-shadow: 0 6px 20px rgba(58, 170, 66, 0.35);

        .action-card__label { color: #fff; }
        .action-card__sub { color: rgba(255,255,255,0.75); }
      }
    }

    .action-card__icon { font-size: 1.8rem; line-height: 1; }
    .action-card__label { font-weight: var(--weight-semibold); font-size: var(--text-sm); color: var(--color-ink); }
    .action-card__sub { font-size: var(--text-xs); color: var(--color-text-muted); }

    // ----- Widgets -----
    .dashboard__widgets {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-4);

      @media (min-width: 640px) { grid-template-columns: repeat(2, 1fr); }
    }

    // ----- Stats -----
    .stats-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--space-4);

      @media (min-width: 640px) { grid-template-columns: repeat(2, 1fr); }
    }

    .stat-card {
      padding: var(--space-5);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .stat-card__title {
      margin: 0;
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stat-bar { display: flex; flex-direction: column; gap: var(--space-1); }

    .stat-bar__label {
      display: flex;
      justify-content: space-between;
      font-size: var(--text-sm);
      color: var(--color-ink);
    }

    .stat-bar__track {
      height: 8px;
      background-color: var(--color-surface-2);
      border-radius: var(--radius-full);
      overflow: hidden;
    }

    .stat-bar__fill {
      height: 100%;
      border-radius: var(--radius-full);
      transition: width 0.6s ease;
      background-color: var(--color-primary-400);

      &--medium { background-color: var(--color-earth-400); }
      &--hard   { background-color: var(--color-error); }
    }

    .activity-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-3);
    }

    .activity-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-1);
      padding: var(--space-3);
      background-color: var(--color-surface-2);
      border-radius: var(--radius-lg);
    }

    .activity-item__value {
      font-size: var(--text-2xl);
      font-weight: var(--weight-bold);
      color: var(--color-ink);
    }

    .activity-item__label {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
      text-align: center;
    }
  `],
})
export class DashboardComponent {
  private readonly progressService = inject(UserProgressService);
  private readonly collectionService = inject(CollectionService);
  private readonly badgeService = inject(BadgeService);
  private readonly challengeService = inject(ChallengeService);

  readonly actions = ACTIONS;
  readonly totalBadges = BADGE_CATALOG.length;

  readonly plantsCount = this.progressService.plantsLearnedCount;
  readonly streak = this.progressService.streak;
  readonly activeDays = this.progressService.activeDays;
  readonly level = this.progressService.level;
  readonly score = this.progressService.score;
  readonly collectionCount = this.collectionService.count;
  readonly collectionEntries = this.collectionService.entries;
  readonly unlockedBadges = this.badgeService.unlockedDefinitions;

  readonly quizzesCompleted = computed(() => this.progressService.progress().quizzesCompleted);
  readonly challengesCompleted = computed(() => this.progressService.progress().challengesCompleted);

  readonly levelLabel = computed(() => LEVEL_LABELS[this.level()]);

  readonly motivationMsg = computed(() => {
    const msgs = MOTIVATION[this.level()];
    return msgs[this.plantsCount() % msgs.length];
  });

  readonly levelProgressPct = computed(() => {
    const count = this.plantsCount();
    const sorted = (Object.entries(LEVEL_THRESHOLDS) as [UserLevel, number][]).sort((a, b) => a[1] - b[1]);
    const idx = sorted.findIndex(([key]) => key === this.level());
    const current = sorted[idx]?.[1] ?? 0;
    const next = sorted[idx + 1]?.[1];
    if (!next) return 100;
    return Math.round(((count - current) / (next - current)) * 100);
  });

  readonly nextLevelLabel = computed(() => {
    const sorted = (Object.entries(LEVEL_THRESHOLDS) as [UserLevel, number][]).sort((a, b) => a[1] - b[1]);
    const idx = sorted.findIndex(([key]) => key === this.level());
    const next = sorted[idx + 1];
    if (!next) return 'Niveau maximum atteint 🌳';
    const diff = next[1] - this.plantsCount();
    return `${diff} plante${diff > 1 ? 's' : ''} jusqu'au niveau suivant`;
  });

  readonly nextChallenge = computed(() => {
    const count = this.plantsCount();
    return CHALLENGE_CATALOG.find(c => this.challengeService.getStatus(c, count) === 'available') ?? null;
  });

  readonly plantsByDifficulty = computed(() => {
    const learned = new Set(this.progressService.plantsLearned());
    const counts = { easy: 0, medium: 0, hard: 0 };
    for (const id of learned) {
      const key = id.includes('hard') ? 'hard' : id.includes('medium') ? 'medium' : 'easy';
      counts[key]++;
    }
    const total = learned.size || 1;
    return [
      { key: 'easy',   label: 'Facile',       count: counts.easy,   pct: Math.round((counts.easy / total) * 100) },
      { key: 'medium', label: 'Intermédiaire', count: counts.medium, pct: Math.round((counts.medium / total) * 100) },
      { key: 'hard',   label: 'Difficile',     count: counts.hard,   pct: Math.round((counts.hard / total) * 100) },
    ];
  });
}
