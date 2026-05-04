import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationToastComponent } from '../shared/components/notification-toast/notification-toast.component';
import { OfflineBannerComponent } from '../shared/components/offline-banner/offline-banner.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, NotificationToastComponent, OfflineBannerComponent],
  template: `
    <main id="main-content" role="main" tabindex="-1">
      <router-outlet />
    </main>
    <app-notification-toast />
    <app-offline-banner />
  `,
  styles: [`
    :host { display: block; min-height: 100vh; background: var(--color-bg); }
    main { min-height: 100vh; }
  `],
})
export class LayoutComponent {}
