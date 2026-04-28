import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollectionEntry } from '../../../core/models/plant.model';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-plant-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, BadgeComponent],
  template: `
    <div class="plant-card card card--interactive" [class.plant-card--list]="viewMode() === 'list'" (click)="openDetail.emit(entry().plant.id)">
      <div class="plant-card__image">
        @if (entry().imageUrl) {
          <img [src]="entry().imageUrl" [alt]="entry().plant.commonName" loading="lazy" />
        } @else {
          <div class="plant-card__image-placeholder">
            <span class="plant-card__image-icon">🌿</span>
          </div>
        }
        <div class="plant-card__mastery" [attr.aria-label]="'Maîtrise : ' + entry().masteryLevel + '/5'">
          @for (star of stars; track $index) {
            <span class="plant-card__star" [class.plant-card__star--filled]="$index < entry().masteryLevel">★</span>
          }
        </div>
      </div>

      <div class="plant-card__body">
        <div class="plant-card__tags">
          <app-badge variant="neutral">{{ entry().plant.family }}</app-badge>
          @if (entry().plant.edible) {
            <app-badge variant="success">Comestible</app-badge>
          }
          @if (entry().plant.toxic) {
            <app-badge variant="danger">Toxique</app-badge>
          }
        </div>

        <h3 class="plant-card__name">{{ entry().plant.commonName }}</h3>
        <p class="plant-card__scientific text-small text-muted">{{ entry().plant.scientificName }}</p>

        <div class="plant-card__meta">
          <span class="text-small text-muted">Ajouté le {{ formatDate(entry().addedAt) }}</span>
          @if (entry().note) {
            <span class="plant-card__note-indicator" title="Note personnelle">📝</span>
          }
        </div>
      </div>

      <div class="plant-card__actions" (click)="$event.stopPropagation()">
        <button class="btn btn--sm btn--ghost" (click)="editNote.emit(entry().plant.id)" title="Ajouter une note">
          📝
        </button>
        <button class="btn btn--sm btn--ghost" (click)="remove.emit(entry().plant.id)" title="Retirer de la collection">
          🗑️
        </button>
      </div>
    </div>
  `,
  styles: [`
    .plant-card {
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
      transition: transform var(--transition-fast), box-shadow var(--transition-fast);

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);

        .plant-card__actions { opacity: 1; }
      }

      &--list {
        flex-direction: row;
        align-items: center;
        gap: var(--space-4);

        .plant-card__image {
          width: 80px;
          height: 80px;
          flex-shrink: 0;
          border-radius: var(--radius-md);
        }

        .plant-card__body {
          flex: 1;
          min-width: 0;
        }

        .plant-card__tags { display: none; }
      }
    }

    .plant-card__image {
      position: relative;
      width: 100%;
      aspect-ratio: 4/3;
      background-color: var(--color-surface-2);
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .plant-card__image-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--color-green-50), var(--color-green-100));
    }

    .plant-card__image-icon {
      font-size: 2.5rem;
      opacity: 0.6;
    }

    .plant-card__mastery {
      position: absolute;
      bottom: var(--space-2);
      right: var(--space-2);
      background: rgba(0,0,0,0.55);
      border-radius: var(--radius-full);
      padding: 2px var(--space-2);
      display: flex;
      gap: 1px;
    }

    .plant-card__star {
      font-size: 0.75rem;
      color: rgba(255,255,255,0.35);

      &--filled { color: var(--color-earth-300); }
    }

    .plant-card__body {
      padding: var(--space-4);
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .plant-card__tags {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-1);
    }

    .plant-card__name {
      font-size: var(--text-base);
      font-weight: var(--weight-semibold);
      margin: 0;
      color: var(--color-text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .plant-card__scientific {
      margin: 0;
      font-style: italic;
    }

    .plant-card__meta {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin-top: var(--space-1);
    }

    .plant-card__note-indicator { font-size: 0.8rem; }

    .plant-card__actions {
      position: absolute;
      top: var(--space-2);
      right: var(--space-2);
      display: flex;
      gap: var(--space-1);
      opacity: 0;
      transition: opacity var(--transition-fast);
    }
  `],
})
export class PlantCardComponent {
  readonly entry = input.required<CollectionEntry>();
  readonly viewMode = input<'grid' | 'list'>('grid');

  readonly openDetail = output<string>();
  readonly editNote = output<string>();
  readonly remove = output<string>();

  readonly stars = [0, 1, 2, 3, 4];

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
