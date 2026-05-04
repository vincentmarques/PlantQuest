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
    <div class="question-screen">

      <!-- Top bar -->
      <div class="question-screen__topbar">
        <button class="topbar-btn" (click)="showQuitModal.set(true)" aria-label="Retour">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        <span class="topbar-title">Quiz</span>
        <button class="topbar-btn topbar-btn--skip" (click)="onSkip()" [disabled]="!!answeredId()">
          Passer
        </button>
      </div>

      <!-- Progress -->
      <div class="question-screen__progress">
        <div class="progress-track">
          <div class="progress-fill" [style.width.%]="progressPct()"></div>
        </div>
        <span class="progress-label">{{ index + 1 }}/{{ total }}</span>
      </div>

      <!-- Question text -->
      <div class="question-screen__body">
        <h2 class="question-text">{{ question.question }}</h2>

        @if (plant?.description) {
          <p class="question-desc">{{ plant!.description }}</p>
        }

        <!-- Image -->
        @if (plant?.images?.[0]) {
          <div class="question-image-wrap">
            <img [src]="plant!.images[0]" [alt]="plant!.commonName" class="question-image" />
          </div>
        }

        <!-- Options -->
        <div class="question-options">
          @for (opt of question.options; track opt.id) {
            <button
              class="answer-card"
              [ngClass]="optionClass(opt)"
              [disabled]="!!answeredId()"
              (click)="selectAnswer(opt)"
            >
              <span class="answer-card__label">{{ opt.label }}</span>
              @if (answeredId() && opt.id === question.correctOptionId) {
                <i class="fa-solid fa-check answer-card__icon answer-card__icon--correct"></i>
              }
              @if (answeredId() === opt.id && opt.id !== question.correctOptionId) {
                <i class="fa-solid fa-xmark answer-card__icon answer-card__icon--wrong"></i>
              }
            </button>
          }
        </div>
      </div>

      <!-- Quit modal -->
      @if (showQuitModal()) {
        <div class="quit-overlay" (click)="showQuitModal.set(false)">
          <div class="quit-modal" (click)="$event.stopPropagation()">
            <p class="quit-modal__title">Voulez-vous abandonner ?</p>
            <p class="quit-modal__sub">Toute la progression sera perdue</p>
            <div class="quit-modal__actions">
              <button class="quit-modal__btn quit-modal__btn--cancel" (click)="showQuitModal.set(false)">
                Continuer
              </button>
              <button class="quit-modal__btn quit-modal__btn--confirm" (click)="confirmQuit()">
                Abandonner
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .question-screen {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--color-bg);
      padding: var(--space-4);
      position: relative;
    }

    // ---------- Top bar ----------
    .question-screen__topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-4);
    }

    .topbar-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: var(--text-lg);
      color: var(--color-primary-900);
      padding: var(--space-2);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      min-width: 40px;
      &:hover { background: var(--color-surface-2); }

      &--skip {
        font-size: var(--text-sm);
        font-weight: var(--weight-medium);
        justify-content: flex-end;
        &:disabled { opacity: 0.4; cursor: default; }
      }
    }

    .topbar-title {
      font-family: var(--font-display);
      font-size: var(--text-xl);
      font-weight: var(--weight-bold);
      color: var(--color-primary-900);
    }

    // ---------- Progress ----------
    .question-screen__progress {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      margin-bottom: var(--space-4);
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
      transition: width var(--transition-base);
    }

    .progress-label {
      font-size: var(--text-base);
      font-weight: var(--weight-medium);
      color: var(--color-ink);
    }

    // ---------- Body ----------
    .question-screen__body {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      flex: 1;
    }

    .question-text {
      font-family: var(--font-display);
      font-size: var(--text-xl);
      color: var(--color-primary-900);
      margin: 0;
      line-height: var(--leading-snug);
    }

    .question-desc {
      font-size: var(--text-sm);
      color: var(--color-ink);
      line-height: var(--leading-snug);
      margin: 0;
    }

    .question-image-wrap {
      display: flex;
      justify-content: center;
    }

    .question-image {
      width: 227px;
      height: 227px;
      object-fit: cover;
      border-radius: var(--radius-xl);
    }

    // ---------- Answer cards ----------
    .question-options {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .answer-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-4);
      background: #e4facd;
      border: 1.5px solid var(--color-primary-900);
      border-radius: var(--radius-xl);
      cursor: pointer;
      text-align: left;
      transition: background var(--transition-fast), border-color var(--transition-fast), transform var(--transition-fast);

      &:not([disabled]):hover { transform: translateY(-1px); opacity: 0.9; }
      &[disabled] { cursor: default; }

      &--correct {
        background: var(--color-primary-200) !important;
        border-color: var(--color-primary-700) !important;
      }

      &--wrong {
        background: #fde8e6 !important;
        border-color: var(--color-error) !important;
      }

      &--missed {
        background: var(--color-primary-100) !important;
        border-color: var(--color-primary-500) !important;
        opacity: 0.7;
      }
    }

    .answer-card__label {
      font-size: var(--text-base);
      font-weight: var(--weight-medium);
      color: var(--color-ink);
      flex: 1;
    }

    .answer-card__icon {
      font-size: var(--text-base);
      flex-shrink: 0;
      &--correct { color: var(--color-primary-700); }
      &--wrong   { color: var(--color-error); }
    }

    // ---------- Quit modal ----------
    .quit-overlay {
      position: fixed;
      inset: 0;
      background: rgba(1, 90, 61, 0.5);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: var(--z-modal);
      padding: var(--space-6);
    }

    .quit-modal {
      background: var(--color-surface);
      border-radius: var(--radius-xl);
      padding: var(--space-8) var(--space-6);
      width: 100%;
      max-width: 320px;
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      text-align: center;
      box-shadow: var(--shadow-xl);
    }

    .quit-modal__title {
      font-family: var(--font-display);
      font-size: var(--text-lg);
      font-weight: var(--weight-bold);
      color: var(--color-primary-900);
      margin: 0;
    }

    .quit-modal__sub {
      font-size: var(--text-sm);
      color: var(--color-text-muted);
      margin: 0;
    }

    .quit-modal__actions {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      margin-top: var(--space-2);
    }

    .quit-modal__btn {
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-xl);
      border: none;
      font-size: var(--text-base);
      font-weight: var(--weight-medium);
      cursor: pointer;
      transition: opacity var(--transition-fast);
      &:hover { opacity: 0.85; }

      &--cancel {
        background: var(--color-surface-2);
        color: var(--color-ink);
      }

      &--confirm {
        background: var(--color-primary-900);
        color: #ebfef5;
      }
    }
  `],
})
export class QuestionComponent {
  @Input({ required: true }) question!: QuizQuestion;
  @Input({ required: true }) index!: number;
  @Input({ required: true }) total!: number;
  @Input() plant: Plant | undefined;
  @Input() correctCount = 0;

  @Output() answered = new EventEmitter<string>();
  @Output() skip = new EventEmitter<void>();
  @Output() quit = new EventEmitter<void>();

  readonly answeredId = signal<string | null>(null);
  readonly showQuitModal = signal(false);

  readonly isCorrect = computed(() => this.answeredId() === this.question.correctOptionId);

  readonly progressPct = computed(() =>
    this.total > 0 ? Math.round((this.index / this.total) * 100) : 0
  );

  selectAnswer(opt: QuizOption): void {
    if (this.answeredId()) return;
    this.answeredId.set(opt.id);
    this.answered.emit(opt.id);
  }

  onSkip(): void {
    if (this.answeredId()) return;
    this.skip.emit();
  }

  confirmQuit(): void {
    this.showQuitModal.set(false);
    this.quit.emit();
  }

  optionClass(opt: QuizOption): Record<string, boolean> {
    const answered = this.answeredId();
    if (!answered) return {};

    const isCorrect = opt.id === this.question.correctOptionId;
    const isSelected = opt.id === answered;

    return {
      'answer-card--correct': isCorrect && isSelected,
      'answer-card--wrong':   !isCorrect && isSelected,
      'answer-card--missed':  isCorrect && !isSelected,
    };
  }

  reset(): void {
    this.answeredId.set(null);
  }
}
