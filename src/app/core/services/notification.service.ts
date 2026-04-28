import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _notifications = signal<Notification[]>([]);
  readonly notifications = this._notifications.asReadonly();

  success(message: string, duration = 3000): void {
    this.push({ type: 'success', message, duration });
  }

  error(message: string, duration = 5000): void {
    this.push({ type: 'error', message, duration });
  }

  warning(message: string, duration = 4000): void {
    this.push({ type: 'warning', message, duration });
  }

  info(message: string, duration = 3000): void {
    this.push({ type: 'info', message, duration });
  }

  dismiss(id: string): void {
    this._notifications.update(list => list.filter(n => n.id !== id));
  }

  private push(opts: Omit<Notification, 'id'>): void {
    const id = crypto.randomUUID();
    this._notifications.update(list => [...list, { ...opts, id }]);
    setTimeout(() => this.dismiss(id), opts.duration);
  }
}
