import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Plant } from '../../../core/models/plant.model';

@Component({
  selector: 'app-plant-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="plant-detail stack">
      <!-- En-tête -->
      <div class="plant-detail__header stack--sm">
        <button class="btn btn--ghost btn--sm" (click)="close.emit()">
          ← Retour au résultat
        </button>
        <h1>{{ plant.commonName }}</h1>
        <p class="text-muted"><em>{{ plant.scientificName }}</em></p>

        <div class="flex flex--gap-sm flex--wrap">
          @if (plant.edible) {
            <span class="badge badge--success">Comestible</span>
          }
          @if (plant.toxic) {
            <span class="badge badge--danger">⚠ Toxique</span>
          }
          <span class="badge badge--neutral">{{ difficultyLabel() }}</span>
          @for (tag of plant.tags; track tag) {
            <span class="tag">{{ tag }}</span>
          }
        </div>
      </div>

      <!-- Informations générales -->
      <div class="grid grid--2">

        <div class="card stack--sm">
          <h3>Famille botanique</h3>
          <p>{{ plant.family || 'Non renseignée' }}</p>
        </div>

        <div class="card stack--sm">
          <h3>Floraison</h3>
          <p>
            @if (plant.floweringSeason && plant.floweringSeason.length > 0) {
              {{ plant.floweringSeason.join(' · ') }}
            } @else {
              Non renseignée
            }
          </p>
        </div>
      </div>

      <!-- Description -->
      @if (plant.description) {
        <div class="card stack--sm">
          <h3>Description</h3>
          <p>{{ plant.description }}</p>
        </div>
      }

      <!-- Habitat -->
      @if (plant.habitat && plant.habitat.length > 0) {
        <div class="card stack--sm">
          <h3>Habitat</h3>
          <div class="flex flex--gap-sm flex--wrap">
            @for (h of plant.habitat; track h) {
              <span class="tag">{{ h }}</span>
            }
          </div>
        </div>
      }

      <!-- Avertissements -->
      @if (plant.toxic) {
        <div class="alert alert--error" role="alert">
          <span class="alert__icon">⚠</span>
          <p class="alert__message">
            <strong>Plante toxique.</strong> Ne pas consommer. Tenir hors de portée des enfants et des animaux.
            En cas d'ingestion accidentelle, contactez le 15 (SAMU) ou le Centre Antipoison.
          </p>
        </div>
      }

      @if (plant.edible) {
        <div class="alert alert--info" role="note">
          <span class="alert__icon">ℹ</span>
          <p class="alert__message">
            Plante identifiée comme comestible. Assurez-vous de l'identification avec certitude avant toute consommation.
          </p>
        </div>
      }

      <button class="btn btn--primary" (click)="addToCollection.emit()">
        + Ajouter à mon herbier
      </button>
    </div>
  `,
  styles: [`
    .plant-detail__header { padding-bottom: var(--space-4); border-bottom: var(--border-width) solid var(--color-border); }
  `],
})
export class PlantDetailComponent {
  @Input({ required: true }) plant!: Plant;
  @Output() close = new EventEmitter<void>();
  @Output() addToCollection = new EventEmitter<void>();

  difficultyLabel(): string {
    const labels: Record<string, string> = { easy: 'Facile', medium: 'Intermédiaire', hard: 'Difficile' };
    return labels[this.plant.difficulty] ?? this.plant.difficulty;
  }
}
