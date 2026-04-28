import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopHeaderComponent } from './top-header/top-header.component';
import { NavbarComponent } from './navbar/navbar.component';
import { BottomNavComponent } from './bottom-nav/bottom-nav.component';
import { NotificationToastComponent } from '../shared/components/notification-toast/notification-toast.component';
import { OfflineBannerComponent } from '../shared/components/offline-banner/offline-banner.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, TopHeaderComponent, NavbarComponent, BottomNavComponent, NotificationToastComponent, OfflineBannerComponent],
  template: `
    <!-- Top header mobile -->
    <app-top-header class="layout__top-mobile" />

    <!-- Navbar desktop -->
    <app-navbar class="layout__nav-desktop" />

    <main id="main-content" class="layout__main" role="main" tabindex="-1">
      <router-outlet />
    </main>

    <!-- Bottom nav mobile -->
    <app-bottom-nav />

    <app-notification-toast />
    <app-offline-banner />
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .layout__top-mobile {
      @media (min-width: 768px) { display: none; }
    }

    .layout__nav-desktop {
      display: none;
      @media (min-width: 768px) { display: block; }
    }

    .layout__main {
      flex: 1;
      padding-block: var(--space-6) var(--space-8);
      // Espace pour la bottom nav sur mobile
      padding-bottom: calc(var(--bottom-nav-height) + var(--space-6));

      @media (min-width: 768px) {
        padding-bottom: var(--space-8);
      }
    }
  `],
})
export class LayoutComponent {}
