import {
  Component,
  Input,
  Output,
  EventEmitter,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { QuizResult } from '../../../core/models/quiz.model';
import { Plant } from '../../../core/models/plant.model';

@Component({
  selector: 'app-quiz-result',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="result-screen">

      <!-- Header -->
      <div class="result-screen__header">
        <span class="result-screen__header-title">Quiz</span>
      </div>

      <!-- Progress bar (100% filled on result) -->
      <div class="result-screen__progress">
        <div class="progress-track">
          <div class="progress-fill" style="width:100%"></div>
        </div>
        <span class="progress-label">{{ result.total }}/{{ result.total }}</span>
      </div>

      <!-- Praise message -->
      <p class="result-screen__praise">{{ praiseMessage() }}</p>

      <!-- Score circle -->
      <div class="result-screen__score-circle">
        <span class="result-screen__fraction">{{ result.score }}/{{ result.total }}</span>
      </div>

      <!-- Wrong answers -->
      @if (wrongPlants.length > 0) {
        <div class="result-screen__errors">
          <p class="result-screen__errors-title">Vos erreurs étaient</p>
          <div class="errors-list">
            @for (plant of wrongPlants; track plant.id) {
              <div class="error-row">
                <span class="error-row__wrong">
                  {{ plant.commonName }}
                  <i class="fa-solid fa-xmark error-row__x"></i>
                </span>
                <i class="fa-solid fa-arrow-right error-row__arrow"></i>
                <span class="error-row__correct">
                  {{ plant.scientificName }}
                  <i class="fa-solid fa-check error-row__check"></i>
                </span>
              </div>
            }
          </div>
        </div>
      } @else {
        <p class="result-screen__perfect">Parfait ! Vous avez tout bon. Remarquable !</p>
      }

      <!-- Actions -->
      <div class="result-screen__actions">
        <button class="result-btn result-btn--secondary" (click)="goHome.emit()">Accueil</button>
        <button class="result-btn result-btn--primary" (click)="retry.emit()">Refaire</button>
      </div>

    </div>
  `,
  styles: [`
    .result-screen {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      padding: var(--space-4);
      background: var(--color-bg);
      gap: var(--space-6);
    }

    .result-screen__header {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-4) 0;
    }

    .result-screen__header-title {
      font-family: var(--font-display);
      font-size: var(--text-xl);
      font-weight: var(--weight-bold);
      color: var(--color-primary-900);
    }

    .result-screen__progress {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .progress-track {
      height: 6px;
      background: var(--color-lime);
      border-radius: var(--radius-full);
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--color-primary-900);
      border-radius: var(--radius-full);
    }

    .progress-label {
      font-size: var(--text-base);
      font-weight: var(--weight-medium);
      color: var(--color-ink);
    }

    .result-screen__praise {
      font-family: var(--font-display);
      font-size: var(--text-xl);
      color: var(--color-primary-900);
      text-align: center;
      margin: 0;
      line-height: var(--leading-snug);
    }

    .result-screen__score-circle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 176px;
      height: 126px;
      border: 3px solid var(--color-primary-200);
      border-radius: var(--radius-xl);
      align-self: center;
    }

    .result-screen__fraction {
      font-family: var(--font-display);
      font-size: var(--text-4xl);
      font-weight: var(--weight-bold);
      color: var(--color-primary-900);
      line-height: 1;
    }

    .result-screen__errors {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .result-screen__errors-title {
      font-size: var(--text-base);
      font-weight: var(--weight-medium);
      color: var(--color-ink);
      text-align: center;
      margin: 0;
    }

    .errors-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .error-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-3);
      font-size: var(--text-sm);
    }

    .error-row__wrong {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      color: var(--color-ink);
    }

    .error-row__x { color: var(--color-error); font-size: 0.75rem; }
    .error-row__arrow { color: var(--color-stone-400); font-size: 0.75rem; }

    .error-row__correct {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      color: var(--color-ink);
    }

    .error-row__check { color: var(--color-primary-600); font-size: 0.75rem; }

    .result-screen__perfect {
      text-align: center;
      color: var(--color-primary-700);
      font-size: var(--text-base);
      margin: 0;
    }

    .result-screen__actions {
      margin-top: auto;
      display: flex;
      gap: var(--space-4);
      justify-content: center;
    }

    .result-btn {
      padding: var(--space-3) var(--space-6);
      border-radius: var(--radius-xl);
      border: none;
      font-size: var(--text-base);
      font-weight: var(--weight-medium);
      cursor: pointer;
      transition: opacity var(--transition-fast), transform var(--transition-fast);
      &:hover { opacity: 0.85; }
      &:active { transform: scale(0.97); }

      &--primary {
        background: var(--color-primary-900);
        color: #ebfef5;
      }

      &--secondary {
        background: var(--color-periwinkle);
        color: var(--color-primary-900);
      }
    }
  `],
})
export class QuizResultComponent {
  @Input({ required: true }) result!: QuizResult;
  @Input() wrongPlants: Plant[] = [];

  @Output() retry = new EventEmitter<void>();
  @Output() goHome = new EventEmitter<void>();

  readonly praiseMessage = computed(() => {
    const pct = this.result.percentage;
    if (pct === 100) return 'Parfait ! Score absolu !';
    if (pct >= 80)   return 'Bravo ! Vous avez fait un très bon score';
    if (pct >= 60)   return 'Très bien ! Continuez comme ça';
    if (pct >= 40)   return 'Pas mal, encore un effort !';
    return 'Courage, vous progresserez !';
  });
}
