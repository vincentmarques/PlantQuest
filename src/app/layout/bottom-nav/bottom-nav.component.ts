import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard',  icon: '🏠', label: 'Accueil' },
  { path: '/quiz',       icon: '❓', label: 'Quiz'    },
  { path: '/collection', icon: '🌿', label: 'Herbier' },
  { path: '/challenge',  icon: '🏆', label: 'Trophée' },
];

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="bottom-nav" aria-label="Navigation principale">
      @for (item of items; track item.path) {
        <a
          class="bottom-nav__item"
          [routerLink]="item.path"
          routerLinkActive="bottom-nav__item--active"
          #rla="routerLinkActive"
          [attr.aria-label]="item.label"
          [attr.aria-current]="rla.isActive ? 'page' : null"
        >
          <span class="bottom-nav__icon" aria-hidden="true">{{ item.icon }}</span>
          <span class="bottom-nav__label">{{ item.label }}</span>
          <span class="bottom-nav__dot" aria-hidden="true"></span>
        </a>
      }
    </nav>
  `,
  styles: [`
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: var(--bottom-nav-height);
      background-color: var(--color-surface);
      border-top: var(--border-width) solid var(--color-border-light);
      box-shadow: 0 -4px 24px rgba(20, 60, 20, 0.08);
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding-inline: var(--space-2);
      padding-bottom: env(safe-area-inset-bottom, 0px);
      z-index: var(--z-sticky);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);

      @media (min-width: 768px) { display: none; }
    }

    .bottom-nav__item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-lg);
      text-decoration: none;
      color: var(--color-stone-400);
      transition: color var(--transition-fast);
      position: relative;
      flex: 1;

      &--active {
        color: var(--color-primary-500);

        .bottom-nav__dot  { opacity: 1; transform: scale(1); }
        .bottom-nav__icon { transform: scale(1.15); }
      }
    }

    .bottom-nav__icon {
      font-size: 1.4rem;
      line-height: 1;
      transition: transform var(--transition-spring);
    }

    .bottom-nav__label {
      font-size: 0.6rem;
      font-weight: var(--weight-semibold);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .bottom-nav__dot {
      position: absolute;
      top: 4px;
      left: 50%;
      transform: translateX(-50%) scale(0);
      width: 4px;
      height: 4px;
      border-radius: var(--radius-full);
      background-color: var(--color-primary-500);
      opacity: 0;
      transition: opacity var(--transition-fast), transform var(--transition-spring);
    }
  `],
})
export class BottomNavComponent {
  readonly items = NAV_ITEMS;
}
