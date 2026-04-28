import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { NotificationToastComponent } from '../shared/components/notification-toast/notification-toast.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, NavbarComponent, NotificationToastComponent],
  template: `
    <app-navbar />
    <main class="layout__main">
      <router-outlet />
    </main>
    <app-notification-toast />
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .layout__main {
      flex: 1;
      padding-block: var(--space-8);
    }
  `],
})
export class LayoutComponent {}
