import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { QuizQuestion, QuizOption } from '../../../core/models/quiz.model';
import { Plant } from '../../../core/models/plant.model';

@Component({
  selector: 'app-question',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
  template: `
    <div class="question stack">

      <!-- Progression -->
      <div class="question__progress">
        <div class="question__progress-info">
          <span class="text-small text-muted">Question {{ index + 1 }} / {{ total }}</span>
          <span class="text-small text-muted">{{ scoreLabel }}</span>
        </div>
        <div class="progress-bar" role="progressbar" [attr.aria-valuenow]="progressPct()" aria-valuemin="0" aria-valuemax="100">
          <div class="progress-bar__fill" [style.width.%]="progressPct()"></div>
        </div>
      </div>

      <!-- Contexte plante -->
      @if (plant) {
        <div class="question__context card card--flat">
          <p class="text-small text-muted">Indice</p>
          @if (plant.description) {
            <p class="question__description">{{ plant.description }}</p>
          }
          @if (plant.habitat.length) {
            <p class="text-small text-muted">
              Habitat : {{ plant.habitat.slice(0, 2).join(', ') }}
            </p>
          }
        </div>
      }

      <!-- Question -->
      <h2 class="question__text">{{ question.question }}</h2>

      <!-- Options -->
      <div class="question__options" [ngClass]="question.type === 'true-false' ? 'question__options--tf' : 'question__options--grid'">
        @for (opt of question.options; track opt.id) {
          <button
            class="card question__option"
            [ngClass]="optionClass(opt)"
            [disabled]="!!answeredId()"
            (click)="selectAnswer(opt)"
          >
            <span class="question__option-label">{{ opt.label }}</span>
            @if (answeredId() && opt.id === question.correctOptionId) {
              <span class="question__check" aria-hidden="true">✓</span>
            }
            @if (answeredId() === opt.id && opt.id !== question.correctOptionId) {
              <span class="question__cross" aria-hidden="true">✕</span>
            }
          </button>
        }
      </div>

      <!-- Explication (après réponse) -->
      @if (answeredId() && question.explanation) {
        <div
          class="alert"
          [ngClass]="isCorrect() ? 'alert--success' : 'alert--error'"
          role="alert"
        >
          <span class="alert__icon">{{ isCorrect() ? '🌿' : '🍂' }}</span>
          <p class="alert__message">{{ question.explanation }}</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .question__progress { display: flex; flex-direction: column; gap: var(--space-2); }
    .question__progress-info { display: flex; justify-content: space-between; }

    .question__context { padding: var(--space-4); }
    .question__description { margin-top: var(--space-1); line-height: var(--leading-snug); }

    .question__text {
      font-size: var(--text-xl);
      line-height: var(--leading-snug);
    }

    .question__options {
      &--grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--space-3);
      }

      &--tf {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--space-4);
      }
    }

    .question__option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3);
      padding: var(--space-4);
      cursor: pointer;
      text-align: left;
      font-weight: var(--weight-medium);
      border: 2px solid var(--color-border);
      transition: border-color var(--transition-fast), background-color var(--transition-fast), transform var(--transition-fast);

      &:not([disabled]):hover {
        border-color: var(--color-green-400);
        background-color: var(--color-green-100);
        transform: translateY(-1px);
      }

      &[disabled] { cursor: default; }

      &--correct {
        border-color: var(--color-success) !important;
        background-color: var(--color-green-100) !important;
        color: var(--color-green-700);
      }

      &--wrong {
        border-color: var(--color-error) !important;
        background-color: #fde8e6 !important;
        color: #922b21;
      }

      &--missed {
        border-color: var(--color-success) !important;
        background-color: var(--color-green-100) !important;
        opacity: 0.6;
      }
    }

    .question__option-label { flex: 1; }
    .question__check { color: var(--color-success); font-weight: var(--weight-bold); font-size: var(--text-lg); }
    .question__cross { color: var(--color-error); font-weight: var(--weight-bold); font-size: var(--text-lg); }
  `],
})
export class QuestionComponent {
  @Input({ required: true }) question!: QuizQuestion;
  @Input({ required: true }) index!: number;
  @Input({ required: true }) total!: number;
  @Input() plant: Plant | undefined;
  @Input() correctCount = 0;

  @Output() answered = new EventEmitter<string>();

  readonly answeredId = signal<string | null>(null);

  readonly isCorrect = computed(() => this.answeredId() === this.question.correctOptionId);

  readonly progressPct = computed(() =>
    this.total > 0 ? Math.round((this.index / this.total) * 100) : 0
  );

  get scoreLabel(): string {
    return `${this.correctCount} / ${this.index} ✓`;
  }

  selectAnswer(opt: QuizOption): void {
    if (this.answeredId()) return;
    this.answeredId.set(opt.id);
    this.answered.emit(opt.id);
  }

  optionClass(opt: QuizOption): Record<string, boolean> {
    const answered = this.answeredId();
    if (!answered) return { 'card--interactive': true };

    const isCorrect = opt.id === this.question.correctOptionId;
    const isSelected = opt.id === answered;

    return {
      'question__option--correct': isCorrect && isSelected,
      'question__option--wrong': !isCorrect && isSelected,
      'question__option--missed': isCorrect && !isSelected,
    };
  }

  reset(): void {
    this.answeredId.set(null);
  }
}
