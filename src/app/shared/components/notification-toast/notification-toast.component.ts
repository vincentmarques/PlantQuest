import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { NgClass } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';

const ICONS: Record<string, string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
  template: `
    <div class="toast-container" aria-live="polite">
      @for (notif of notifications(); track notif.id) {
        <div
          class="alert"
          [ngClass]="'alert--' + notif.type"
          role="alert"
        >
          <span class="alert__icon">{{ icon(notif.type) }}</span>
          <p class="alert__message">{{ notif.message }}</p>
          <button
            class="btn btn--icon btn--sm toast-close"
            (click)="dismiss(notif.id)"
            aria-label="Fermer"
          >✕</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: var(--space-6);
      right: var(--space-4);
      z-index: var(--z-toast);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      max-width: min(400px, calc(100vw - var(--space-8)));
      pointer-events: none;
    }

    .alert {
      pointer-events: all;
      animation: slideIn var(--transition-spring);
    }

    @keyframes slideIn {
      from { transform: translateX(110%); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }

    .toast-close {
      margin-left: auto;
      flex-shrink: 0;
      opacity: 0.7;
    }

    .toast-close:hover { opacity: 1; }
  `],
})
export class NotificationToastComponent {
  private readonly notificationService = inject(NotificationService);
  readonly notifications = this.notificationService.notifications;

  icon(type: string): string {
    return ICONS[type] ?? 'ℹ';
  }

  dismiss(id: string): void {
    this.notificationService.dismiss(id);
  }
}
