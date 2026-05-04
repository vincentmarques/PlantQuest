import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

interface HomeAction {
  path: string;
  faIcon: string;
  label: string;
  sub: string;
  modifier: string;
}

const ACTIONS: HomeAction[] = [
  { path: '/quiz',       faIcon: 'fa-circle-question', label: 'Quiz',    sub: 'Tester ses bases',       modifier: 'dark' },
  { path: '/collection', faIcon: 'fa-seedling',        label: 'Herbier', sub: 'Collection de plante',   modifier: 'lime' },
  { path: '/challenge',  faIcon: 'fa-trophy',          label: 'Trophée', sub: 'Retrouvez vos trophées', modifier: 'blue' },
];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="home">
      <div class="home__inner">

        <header class="home__header">
          <h1 class="home__title">Plant Quest</h1>
          <p class="home__subtitle">Votre aventure botanique commence ici</p>
        </header>

        <nav class="home__actions" aria-label="Sections principales">
          @for (action of actions; track action.path) {
            <a [routerLink]="action.path" class="home-card home-card--{{ action.modifier }}">
              <i class="fa-solid {{ action.faIcon }} home-card__icon" aria-hidden="true"></i>
              <span class="home-card__label">{{ action.label }}</span>
              <span class="home-card__sub">{{ action.sub }}</span>
            </a>
          }
        </nav>

      </div>

      <footer class="home__footer">
        <span>Application conçue par</span>
        <span class="home__footer-name">Vincent Marques</span>
      </footer>
    </div>
  `,
  styles: [`
    .home {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: var(--space-4);
    }

    .home__inner {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .home__header {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      text-align: center;
      padding-top: var(--space-8);
    }

    .home__title {
      font-family: var(--font-display);
      font-size: var(--text-3xl);
      font-weight: var(--weight-bold);
      color: var(--color-primary-900);
      margin: 0;
      line-height: var(--leading-tight);
    }

    .home__subtitle {
      font-size: var(--text-sm);
      color: var(--color-ink);
      margin: 0;
    }

    .home__actions {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .home-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-6);
      padding: var(--space-6);
      border-radius: var(--radius-xl);
      text-decoration: none;
      text-align: center;
      transition: transform var(--transition-base), box-shadow var(--transition-base);

      &:hover  { transform: translateY(-3px); box-shadow: var(--shadow-md); }
      &:active { transform: scale(0.98); }

      &--dark {
        background-color: var(--color-primary-900);
        color: #ebfef5;
      }

      &--lime {
        background-color: var(--color-lime);
        color: var(--color-lime-text);
      }

      &--blue {
        background-color: var(--color-periwinkle);
        color: var(--color-primary-900);
      }
    }

    .home-card__icon {
      font-size: 2rem;
      line-height: 1;
    }

    .home-card__label {
      font-family: var(--font-display);
      font-size: var(--text-lg);
      font-weight: var(--weight-bold);
      line-height: 1;
    }

    .home-card__sub {
      font-size: var(--text-xs);
      opacity: 0.75;
      margin-top: calc(-1 * var(--space-4));
    }

    .home__footer {
      display: flex;
      justify-content: center;
      gap: var(--space-2);
      font-size: var(--text-sm);
      color: var(--color-ink);
      padding: var(--space-4) 0 var(--space-2);
    }

    .home__footer-name {
      font-family: var(--font-display);
      font-weight: var(--weight-semibold);
    }
  `],
})
export class DashboardComponent {
  readonly actions = ACTIONS;
}
