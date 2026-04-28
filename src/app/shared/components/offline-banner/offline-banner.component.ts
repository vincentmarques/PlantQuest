import { Component, signal, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-offline-banner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (offline()) {
      <div class="offline-banner" role="alert" aria-live="polite">
        <span aria-hidden="true">📡</span>
        <span>Mode hors-ligne — les données locales restent disponibles.</span>
      </div>
    }
  `,
  styles: [`
    .offline-banner {
      position: fixed;
      bottom: calc(var(--bottom-nav-height, 60px) + var(--space-3));
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: var(--space-2);
      background-color: var(--color-ink);
      color: #fff;
      font-size: var(--text-sm);
      padding: var(--space-2) var(--space-5);
      border-radius: var(--radius-full);
      box-shadow: var(--shadow-lg);
      z-index: var(--z-toast, 800);
      white-space: nowrap;
      animation: slideUp 0.3s ease;

      @media (min-width: 768px) {
        bottom: var(--space-6);
      }
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateX(-50%) translateY(12px); }
      to   { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
  `],
})
export class OfflineBannerComponent implements OnInit, OnDestroy {
  readonly offline = signal(!navigator.onLine);

  private readonly onOnline = () => this.offline.set(false);
  private readonly onOffline = () => this.offline.set(true);

  ngOnInit(): void {
    window.addEventListener('online', this.onOnline);
    window.addEventListener('offline', this.onOffline);
  }

  ngOnDestroy(): void {
    window.removeEventListener('online', this.onOnline);
    window.removeEventListener('offline', this.onOffline);
  }
}
