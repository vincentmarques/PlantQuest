import { Component, Output, EventEmitter, signal, ChangeDetectionStrategy } from '@angular/core';
import { NgClass } from '@angular/common';
import { Difficulty } from '../../../core/models/quiz.model';

interface DifficultyOption {
  value: Difficulty;
  label: string;
  description: string;
  icon: string;
  count: number;
  color: string;
}

const OPTIONS: DifficultyOption[] = [
  {
    value: 'beginner',
    label: 'Débutant',
    description: 'Plantes communes et faciles à identifier',
    icon: '🌱',
    count: 5,
    color: 'success',
  },
  {
    value: 'intermediate',
    label: 'Intermédiaire',
    description: 'Mix de plantes faciles et moyennement connues',
    icon: '🌿',
    count: 10,
    color: 'warning',
  },
  {
    value: 'expert',
    label: 'Expert',
    description: 'Toutes les plantes, y compris les plus difficiles',
    icon: '🌳',
    count: 15,
    color: 'danger',
  },
];

@Component({
  selector: 'app-quiz-setup',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
  template: `
    <div class="quiz-setup stack stack--lg">
      <header class="stack--sm">
        <h1>Mode Quiz 🧠</h1>
        <p class="text-muted">
          Testez vos connaissances botaniques. Choisissez un niveau pour commencer.
        </p>
      </header>

      <div class="stack">
        @for (opt of options; track opt.value) {
          <button
            class="card card--interactive quiz-setup__card"
            [ngClass]="{ 'quiz-setup__card--selected': selected() === opt.value }"
            (click)="selected.set(opt.value)"
            [attr.aria-pressed]="selected() === opt.value"
          >
            <span class="quiz-setup__icon">{{ opt.icon }}</span>
            <div class="quiz-setup__info">
              <div class="flex flex--between">
                <span class="quiz-setup__label">{{ opt.label }}</span>
                <span class="badge" [ngClass]="'badge--' + opt.color">
                  {{ opt.count }} questions
                </span>
              </div>
              <p class="text-muted text-small">{{ opt.description }}</p>
            </div>
          </button>
        }
      </div>

      <button
        class="btn btn--primary btn--lg btn--full"
        [disabled]="!selected()"
        (click)="start()"
      >
        Lancer le quiz
      </button>
    </div>
  `,
  styles: [`
    .quiz-setup__card {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      text-align: left;
      width: 100%;
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast);

      &--selected {
        border-color: var(--color-green-400);
        box-shadow: 0 0 0 2px var(--color-green-200);
      }
    }

    .quiz-setup__icon { font-size: 2rem; flex-shrink: 0; line-height: 1; }
    .quiz-setup__info { flex: 1; display: flex; flex-direction: column; gap: var(--space-1); }
    .quiz-setup__label { font-weight: var(--weight-semibold); font-size: var(--text-lg); }
  `],
})
export class QuizSetupComponent {
  @Output() started = new EventEmitter<Difficulty>();

  readonly options = OPTIONS;
  readonly selected = signal<Difficulty | null>(null);

  start(): void {
    const d = this.selected();
    if (d) this.started.emit(d);
  }
}
