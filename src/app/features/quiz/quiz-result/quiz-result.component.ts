import {
  Component,
  Input,
  Output,
  EventEmitter,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { QuizResult } from '../../../core/models/quiz.model';
import { Plant } from '../../../core/models/plant.model';

@Component({
  selector: 'app-quiz-result',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
  template: `
    <div class="result-screen stack stack--lg">

      <!-- Score héros -->
      <div class="result-screen__hero card card--elevated text-center stack">
        <span class="result-screen__stars" aria-hidden="true">{{ stars() }}</span>
        <div>
          <p class="result-screen__fraction">{{ result.score }} / {{ result.total }}</p>
          <p class="result-screen__label text-muted">{{ resultLabel() }}</p>
        </div>

        <div class="result-screen__bar-wrap">
          <div
            class="progress-bar progress-bar--lg"
            [ngClass]="barClass()"
            role="progressbar"
            [attr.aria-valuenow]="result.percentage"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div
              class="progress-bar__fill result-screen__bar-fill"
              [style.width.%]="result.percentage"
            ></div>
          </div>
          <span class="text-small text-muted">{{ result.percentage }}%</span>
        </div>

        <!-- Points gagnés -->
        <p class="result-screen__points">
          + {{ pointsEarned() }} points &nbsp; {{ levelUpMessage() }}
        </p>
      </div>

      <!-- Erreurs à retravailler -->
      @if (wrongPlants.length > 0) {
        <div class="stack--sm">
          <h3>À retravailler 🍂</h3>
          <div class="stack--sm">
            @for (plant of wrongPlants; track plant.id) {
              <div class="card card--flat result-screen__wrong-plant">
                <div>
                  <p class="result-screen__plant-name">{{ plant.commonName }}</p>
                  <p class="text-small text-muted"><em>{{ plant.scientificName }}</em></p>
                </div>
                <div class="flex flex--gap-sm">
                  @if (plant.edible) {
                    <span class="badge badge--success">Comestible</span>
                  }
                  @if (plant.toxic) {
                    <span class="badge badge--danger">Toxique</span>
                  }
                  <span class="badge badge--neutral">{{ plant.family }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="alert alert--success" role="status">
          <span class="alert__icon">🌿</span>
          <p class="alert__message">Parfait ! Vous avez tout bon. Remarquable !</p>
        </div>
      }

      <!-- Actions -->
      <div class="flex flex--gap-md flex--wrap">
        <button class="btn btn--primary" (click)="retry.emit()">Refaire un quiz</button>
        <button class="btn btn--ghost" (click)="goHome.emit()">Tableau de bord</button>
      </div>
    </div>
  `,
  styles: [`
    .result-screen__hero { padding: var(--space-8); }

    .result-screen__stars { font-size: 2.5rem; line-height: 1; letter-spacing: 0.25rem; }

    .result-screen__fraction {
      font-family: var(--font-display);
      font-size: var(--text-4xl);
      font-weight: var(--weight-bold);
      color: var(--color-primary-600);
    }

    .result-screen__label { font-size: var(--text-lg); margin-top: var(--space-1); }

    .result-screen__bar-wrap {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .progress-bar--lg { height: 12px; flex: 1; }

    .result-screen__bar-fill { transition: width 1s ease; }

    .result-screen__points {
      font-weight: var(--weight-semibold);
      color: var(--color-earth-500);
    }

    .result-screen__wrong-plant {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--space-3);
    }

    .result-screen__plant-name { font-weight: var(--weight-medium); }
  `],
})
export class QuizResultComponent {
  @Input({ required: true }) result!: QuizResult;
  @Input() wrongPlants: Plant[] = [];

  @Output() retry = new EventEmitter<void>();
  @Output() goHome = new EventEmitter<void>();

  readonly stars = computed(() => {
    const pct = this.result.percentage;
    if (pct === 100) return '⭐⭐⭐';
    if (pct >= 70)  return '⭐⭐';
    if (pct >= 40)  return '⭐';
    return '🌱';
  });

  readonly resultLabel = computed(() => {
    const pct = this.result.percentage;
    if (pct === 100) return 'Score parfait !';
    if (pct >= 80)   return 'Excellent !';
    if (pct >= 60)   return 'Très bien !';
    if (pct >= 40)   return 'Pas mal, continuez !';
    return 'À retravailler — vous y arriverez !';
  });

  readonly barClass = computed(() => {
    const pct = this.result.percentage;
    if (pct >= 70) return 'progress-bar--success';
    if (pct >= 40) return 'progress-bar--warning';
    return '';
  });

  readonly pointsEarned = computed(() => this.result.score * 5);

  levelUpMessage(): string {
    if (this.result.percentage === 100) return '🏆 Parfait !';
    if (this.result.percentage >= 80) return '🌿';
    return '';
  }
}
