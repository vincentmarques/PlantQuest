import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserProgressService } from '../../core/services/user-progress.service';
import { LEVEL_LABELS } from '../../core/models/user-progress.model';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/dashboard',  label: 'Tableau de bord', icon: '🌿' },
  { path: '/identify',   label: 'Identifier',      icon: '📷' },
  { path: '/quiz',       label: 'Quiz',             icon: '🧠' },
  { path: '/challenge',  label: 'Défis',            icon: '🏆' },
  { path: '/collection', label: 'Herbier',          icon: '📖' },
];

@Component({
  selector: 'app-navbar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="navbar">
      <div class="container navbar__inner">
        <!-- Logo -->
        <a class="navbar__brand" routerLink="/dashboard" aria-label="PlantQuest — Accueil">
          <span class="navbar__brand-icon" aria-hidden="true">🌱</span>
          <span class="navbar__brand-name">PlantQuest</span>
        </a>

        <!-- Navigation desktop -->
        <nav class="navbar__nav" aria-label="Navigation principale">
          @for (item of navItems; track item.path) {
            <a
              class="navbar__link"
              [routerLink]="item.path"
              routerLinkActive="navbar__link--active"
              #rlaD="routerLinkActive"
              [attr.aria-label]="item.label"
              [attr.aria-current]="rlaD.isActive ? 'page' : null"
            >
              <span aria-hidden="true">{{ item.icon }}</span>
              <span class="navbar__link-label">{{ item.label }}</span>
            </a>
          }
        </nav>

        <!-- Progression utilisateur (desktop) -->
        <div class="navbar__user">
          <span class="badge badge--success">
            {{ levelLabel() }}
          </span>
          <span class="navbar__score">{{ score() }} pts</span>
        </div>

        <!-- Bouton menu mobile -->
        <button
          class="btn btn--icon btn--ghost navbar__menu-btn"
          (click)="toggleMenu()"
          [attr.aria-expanded]="menuOpen()"
          aria-controls="mobile-menu"
          aria-label="Menu"
        >
          {{ menuOpen() ? '✕' : '☰' }}
        </button>
      </div>

      <!-- Menu mobile -->
      @if (menuOpen()) {
        <nav id="mobile-menu" class="navbar__mobile-menu" aria-label="Navigation mobile">
          @for (item of navItems; track item.path) {
            <a
              class="navbar__mobile-link"
              [routerLink]="item.path"
              routerLinkActive="navbar__mobile-link--active"
              #rlaM="routerLinkActive"
              [attr.aria-current]="rlaM.isActive ? 'page' : null"
              (click)="closeMenu()"
            >
              <span aria-hidden="true">{{ item.icon }}</span>
              {{ item.label }}
            </a>
          }
          <div class="navbar__mobile-user">
            <span class="badge badge--success">{{ levelLabel() }}</span>
            <span class="text-muted text-small">{{ score() }} points</span>
          </div>
        </nav>
      }
    </header>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: var(--z-sticky);
      background-color: var(--color-surface);
      border-bottom: var(--border-width) solid var(--color-border);
      box-shadow: var(--shadow-sm);
    }

    .navbar__inner {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      height: 64px;
    }

    .navbar__brand {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      text-decoration: none;
      flex-shrink: 0;
    }

    .navbar__brand-icon { font-size: var(--text-xl); }

    .navbar__brand-name {
      font-family: var(--font-display);
      font-size: var(--text-lg);
      font-weight: var(--weight-bold);
      color: var(--color-green-600);
    }

    .navbar__nav {
      display: none;
      align-items: center;
      gap: var(--space-1);
      margin-left: var(--space-4);
      flex: 1;

      @media (min-width: 768px) { display: flex; }
    }

    .navbar__link {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-3);
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--color-text-muted);
      text-decoration: none;
      transition: background-color var(--transition-fast), color var(--transition-fast);
      white-space: nowrap;

      &:hover, &--active {
        background-color: var(--color-green-100);
        color: var(--color-green-600);
      }
    }

    .navbar__link-label {
      @media (max-width: 1023px) { display: none; }
    }

    .navbar__user {
      display: none;
      align-items: center;
      gap: var(--space-3);
      margin-left: auto;

      @media (min-width: 768px) { display: flex; }
    }

    .navbar__score {
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      color: var(--color-earth-500);
    }

    .navbar__menu-btn {
      margin-left: auto;

      @media (min-width: 768px) { display: none; }
    }

    .navbar__mobile-menu {
      display: flex;
      flex-direction: column;
      padding: var(--space-4);
      border-top: var(--border-width) solid var(--color-border);
      background-color: var(--color-surface);
      animation: slideDown var(--transition-base);

      @media (min-width: 768px) { display: none; }
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .navbar__mobile-link {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      font-weight: var(--weight-medium);
      color: var(--color-text);
      text-decoration: none;
      transition: background-color var(--transition-fast), color var(--transition-fast);

      &:hover, &--active {
        background-color: var(--color-green-100);
        color: var(--color-green-600);
      }
    }

    .navbar__mobile-user {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-4) var(--space-4) var(--space-2);
      margin-top: var(--space-2);
      border-top: var(--border-width) solid var(--color-border);
    }
  `],
})
export class NavbarComponent {
  private readonly progress = inject(UserProgressService);

  readonly navItems = NAV_ITEMS;
  readonly menuOpen = signal(false);
  readonly score = this.progress.score;
  readonly level = this.progress.level;

  readonly levelLabel = () => LEVEL_LABELS[this.level()];

  toggleMenu(): void {
    this.menuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }
}
