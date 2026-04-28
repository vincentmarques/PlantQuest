import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserProgressService } from '../../core/services/user-progress.service';
import { LEVEL_LABELS } from '../../core/models/user-progress.model';

@Component({
  selector: 'app-top-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <header class="top-header">
      <div class="top-header__inner container">

        <!-- Avatar + greeting -->
        <div class="top-header__left">
          <div class="avatar avatar--sm top-header__avatar">🌿</div>
          <div class="top-header__greeting">
            <p class="top-header__level">{{ levelLabel() }}</p>
            <p class="top-header__score">{{ score() }} pts</p>
          </div>
        </div>

        <!-- Logo centré -->
        <a class="top-header__logo" routerLink="/dashboard" aria-label="PlantQuest">
          PlantQuest
        </a>

        <!-- Actions -->
        <div class="top-header__actions">
          <a routerLink="/collection" class="btn btn--icon btn--ghost top-header__action" aria-label="Mon herbier">
            📖
          </a>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .top-header {
      position: sticky;
      top: 0;
      z-index: var(--z-sticky);
      background-color: rgba(255, 255, 255, 0.90);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: var(--border-width) solid var(--color-border-light);
    }

    .top-header__inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 60px;
    }

    .top-header__left {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .top-header__avatar {
      background-color: var(--color-green-100);
      font-size: 1rem;
    }

    .top-header__greeting {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .top-header__level {
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      color: var(--color-green-600);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .top-header__score {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
    }

    .top-header__logo {
      font-family: var(--font-display);
      font-size: var(--text-lg);
      font-weight: var(--weight-bold);
      color: var(--color-green-600);
      text-decoration: none;
      letter-spacing: -0.01em;
    }

    .top-header__actions {
      display: flex;
      gap: var(--space-2);
    }

    .top-header__action {
      font-size: 1.1rem;
    }
  `],
})
export class TopHeaderComponent {
  private readonly progress = inject(UserProgressService);
  readonly score = this.progress.score;
  readonly level = this.progress.level;
  readonly levelLabel = () => LEVEL_LABELS[this.level()];
}
