import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  computed,
  Signal,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { PlantIdentificationResult } from '../../../core/models/plant.model';

@Component({
  selector: 'app-identification-result',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
  template: `
    <div class="result stack">

      <!-- En-tête résultat -->
      <div class="result__header card card--elevated">

        <!-- Photo soumise + image de référence -->
        <div class="result__photos">
          @if (previewUrl) {
            <div class="result__photo-wrap">
              <img [src]="previewUrl" alt="Votre photo" class="result__photo" />
              <span class="result__photo-label badge badge--neutral">Votre photo</span>
            </div>
          }
        </div>

        <!-- Identité -->
        <div class="result__identity stack--sm">
          <h2 class="result__common-name">{{ result.plant.commonName }}</h2>
          <p class="result__scientific-name text-muted">
            <em>{{ result.plant.scientificName }}</em>
          </p>

          @if (result.plant.family) {
            <p class="text-small text-muted">Famille : {{ result.plant.family }}</p>
          }

          <!-- Score de confiance -->
          <div class="result__confidence">
            <div class="result__confidence-label">
              <span class="text-small">Confiance</span>
              <span class="text-small" [ngClass]="confidenceClass()">
                {{ confidencePercent() }}%
              </span>
            </div>
            <div
              class="progress-bar"
              [ngClass]="confidenceBarClass()"
              role="progressbar"
              [attr.aria-valuenow]="confidencePercent()"
              aria-valuemin="0"
              aria-valuemax="100"
            >
              <div class="progress-bar__fill" [style.width.%]="confidencePercent()"></div>
            </div>
          </div>

          <!-- Badges caractéristiques -->
          @if (result.plant.edible !== undefined || result.plant.toxic !== undefined) {
            <div class="flex flex--gap-sm flex--wrap">
              @if (result.plant.edible) {
                <span class="badge badge--success">Comestible</span>
              }
              @if (result.plant.toxic) {
                <span class="badge badge--danger">⚠ Toxique</span>
              }
              @if (!result.plant.edible && !result.plant.toxic) {
                <span class="badge badge--neutral">Non comestible</span>
              }
            </div>
          }
        </div>

        <!-- Actions -->
        <div class="result__actions">
          <button
            class="btn btn--primary"
            (click)="addToCollection.emit()"
            [disabled]="inCollection()"
          >
            {{ inCollection() ? collectionLabel : addLabel }}
          </button>
          <button class="btn btn--ghost" (click)="viewDetail.emit()">
            Voir la fiche complète
          </button>
        </div>
      </div>

      <!-- Plantes similaires -->
      @if (result.similarPlants && result.similarPlants.length > 0) {
        <div class="stack--sm">
          <h3>Plantes similaires</h3>
          <div class="stack--sm">
            @for (similar of result.similarPlants.slice(0, 3); track similar.scientificName) {
              <div class="card card--flat result__similar">
                <div>
                  <p class="result__similar-name">{{ similar.commonName }}</p>
                  <p class="text-small text-muted"><em>{{ similar.scientificName }}</em></p>
                </div>
                <span class="badge badge--neutral">{{ (similar.confidence * 100).toFixed(0) }}%</span>
              </div>
            }
          </div>
        </div>
      }

      <!-- Avertissement toxicité -->
      @if (result.plant.toxic) {
        <div class="alert alert--error" role="alert">
          <span class="alert__icon">⚠</span>
          <p class="alert__message">
            <strong>Attention :</strong> Cette plante est identifiée comme toxique.
            Ne la consommez pas sans confirmation d'un expert botaniste.
          </p>
        </div>
      }

      <button class="btn btn--ghost" (click)="restart.emit()">
        ← Nouvelle identification
      </button>
    </div>
  `,
  styles: [`
    .result__header {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .result__photos {
      display: flex;
      gap: var(--space-4);
      flex-wrap: wrap;
    }

    .result__photo-wrap {
      position: relative;
      flex: 1;
      min-width: 140px;
    }

    .result__photo {
      width: 100%;
      max-height: 220px;
      object-fit: cover;
      border-radius: var(--radius-md);
    }

    .result__photo-label {
      position: absolute;
      bottom: var(--space-2);
      left: var(--space-2);
    }

    .result__identity { flex: 1; }

    .result__common-name {
      font-size: var(--text-2xl);
      color: var(--color-green-700);
    }

    .result__scientific-name { font-size: var(--text-base); }

    .result__confidence { display: flex; flex-direction: column; gap: var(--space-2); }

    .result__confidence-label {
      display: flex;
      justify-content: space-between;
    }

    .confidence--high   { color: var(--color-success); font-weight: var(--weight-semibold); }
    .confidence--medium { color: var(--color-warning); font-weight: var(--weight-semibold); }
    .confidence--low    { color: var(--color-error);   font-weight: var(--weight-semibold); }

    .result__actions {
      display: flex;
      gap: var(--space-3);
      flex-wrap: wrap;
    }

    .result__similar {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .result__similar-name { font-weight: var(--weight-medium); }
  `],
})
export class IdentificationResultComponent {
  @Input({ required: true }) result!: PlantIdentificationResult;
  @Input() previewUrl: string | null = null;
  @Input({ required: true }) inCollection!: Signal<boolean>;

  readonly collectionLabel = '✓ Dans l’herbier';
  readonly addLabel = '+ Ajouter à l’herbier';

  @Output() addToCollection = new EventEmitter<void>();
  @Output() viewDetail = new EventEmitter<void>();
  @Output() restart = new EventEmitter<void>();

  readonly confidencePercent = computed(() => Math.round(this.result.confidence * 100));

  readonly confidenceClass = computed(() => {
    const p = this.confidencePercent();
    if (p >= 70) return 'confidence--high';
    if (p >= 40) return 'confidence--medium';
    return 'confidence--low';
  });

  readonly confidenceBarClass = computed(() => {
    const p = this.confidencePercent();
    if (p >= 70) return 'progress-bar--success';
    if (p >= 40) return 'progress-bar--warning';
    return '';
  });
}
