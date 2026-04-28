import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CollectionEntry } from '../../../core/models/plant.model';

@Component({
  selector: 'app-review-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="widget card">
      <div class="widget__header">
        <span class="widget__icon">🔁</span>
        <div>
          <h3 class="widget__title">Plantes à réviser</h3>
          <p class="widget__value">{{ toReview().length }}</p>
        </div>
      </div>

      @if (toReview().length > 0) {
        <ul class="review-list">
          @for (entry of toReview().slice(0, 4); track entry.plant.id) {
            <li class="review-item">
              <div class="review-item__info">
                <span class="review-item__name">{{ entry.plant.commonName }}</span>
                <span class="review-item__scientific">{{ entry.plant.scientificName }}</span>
              </div>
              <div class="review-item__mastery">
                @for (star of stars; track $index) {
                  <span class="review-star" [class.review-star--on]="$index < entry.masteryLevel">★</span>
                }
              </div>
            </li>
          }
        </ul>
        <a routerLink="/quiz" class="btn btn--ghost btn--sm">Lancer une révision →</a>
      } @else if (entries().length === 0) {
        <p class="widget__hint">Ajoutez des plantes à votre herbier pour les réviser.</p>
        <a routerLink="/identify" class="btn btn--ghost btn--sm">Identifier une plante</a>
      } @else {
        <p class="widget__hint">Toutes vos plantes sont bien maîtrisées ! 🌟</p>
      }
    </div>
  `,
  styles: [`
    .widget {
      padding: var(--space-5);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .widget__header {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .widget__icon { font-size: 1.75rem; line-height: 1; }

    .widget__title {
      margin: 0;
      font-size: var(--text-sm);
      color: var(--color-text-muted);
      font-weight: var(--weight-medium);
    }

    .widget__value {
      margin: 0;
      font-size: var(--text-xl);
      font-weight: var(--weight-bold);
      color: var(--color-ink);
    }

    .widget__hint {
      margin: 0;
      font-size: var(--text-xs);
      color: var(--color-text-muted);
    }

    .review-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .review-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3);
      padding: var(--space-2) var(--space-3);
      background-color: var(--color-surface-2);
      border-radius: var(--radius-md);
    }

    .review-item__info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .review-item__name {
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--color-ink);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .review-item__scientific {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
      font-style: italic;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .review-item__mastery { display: flex; gap: 1px; flex-shrink: 0; }

    .review-star {
      font-size: 0.7rem;
      color: var(--color-stone-200);

      &--on { color: var(--color-earth-400); }
    }
  `],
})
export class ReviewWidgetComponent {
  readonly entries = input<CollectionEntry[]>([]);

  readonly stars = [0, 1, 2, 3, 4];

  get toReview(): () => CollectionEntry[] {
    return () => this.entries().filter(e => e.masteryLevel < 3).sort((a, b) => a.masteryLevel - b.masteryLevel);
  }
}
