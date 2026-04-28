import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty-state">
      @if (icon) {
        <span class="empty-state__icon" aria-hidden="true">{{ icon }}</span>
      }
      <h3 class="empty-state__title">{{ title }}</h3>
      @if (description) {
        <p class="empty-state__description text-muted">{{ description }}</p>
      }
      <ng-content />
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-4);
      padding: var(--space-16) var(--space-8);
      text-align: center;
    }

    .empty-state__icon {
      font-size: 3rem;
      line-height: 1;
    }

    .empty-state__title {
      font-size: var(--text-xl);
      color: var(--color-text);
    }

    .empty-state__description {
      max-width: 40ch;
    }
  `],
})
export class EmptyStateComponent {
  @Input() icon = '';
  @Input() title = '';
  @Input() description = '';
}
