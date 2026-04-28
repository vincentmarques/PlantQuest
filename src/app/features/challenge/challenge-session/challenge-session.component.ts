import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { Challenge } from '../../../core/models/challenge.model';
import { QuizQuestion } from '../../../core/models/quiz.model';
import { Plant } from '../../../core/models/plant.model';
import { QuizService } from '../../../core/services/quiz.service';
import { QuestionComponent } from '../../quiz/question/question.component';

export interface SessionOutcome {
  success: boolean;
  correct: number;
  total: number;
  timeUsed?: number;
  streak?: number;
}

@Component({
  selector: 'app-challenge-session',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, QuestionComponent],
  template: `
    <div class="session stack">

      <!-- Barre d'état du défi -->
      <div class="session__status card card--flat">
        <div class="session__status-inner">
          <!-- Titre + type -->
          <div>
            <p class="text-small text-muted">{{ challenge.icon }} {{ challenge.title }}</p>
          </div>

          <!-- Indicateurs selon le type -->
          @if (challenge.type === 'sprint') {
            <div class="session__timer" [ngClass]="timerUrgent() ? 'session__timer--urgent' : ''">
              <span class="session__timer-value">{{ timeLeft() }}</span>
              <span class="text-small text-muted">s</span>
            </div>
          }

          @if (challenge.type === 'streak') {
            <div class="session__streak">
              @for (i of streakDots(); track i) {
                <span class="session__dot" [ngClass]="i <= currentStreak() ? 'session__dot--active' : ''">●</span>
              }
            </div>
          }

          <!-- Compteur de questions -->
          <div class="text-right">
            <p class="text-small text-muted">{{ currentIndex() + 1 }} / {{ questions.length }}</p>
            <p class="text-small" style="color: var(--color-green-500)">{{ correctCount() }} ✓</p>
          </div>
        </div>

        <!-- Barre de progression temps (sprint) -->
        @if (challenge.type === 'sprint' && challenge.timeLimit) {
          <div class="progress-bar" [ngClass]="timerUrgent() ? '' : 'progress-bar--success'">
            <div
              class="progress-bar__fill"
              [style.width.%]="(timeLeft() / challenge.timeLimit!) * 100"
              [style.transition]="'width 1s linear'"
            ></div>
          </div>
        }
      </div>

      <!-- Question active -->
      @if (currentQuestion()) {
        <app-question
          [question]="currentQuestion()!"
          [index]="currentIndex()"
          [total]="questions.length"
          [plant]="currentPlant()"
          [correctCount]="correctCount()"
          (answered)="onAnswered($event)"
        />
      }
    </div>
  `,
  styles: [`
    .session__status-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4);
      margin-bottom: var(--space-3);
    }

    .session__timer {
      display: flex;
      align-items: baseline;
      gap: var(--space-1);

      &--urgent .session__timer-value {
        color: var(--color-error);
        animation: pulse 0.5s ease-in-out infinite alternate;
      }
    }

    .session__timer-value {
      font-family: var(--font-display);
      font-size: var(--text-3xl);
      font-weight: var(--weight-bold);
      color: var(--color-green-600);
      transition: color var(--transition-fast);
    }

    .session__streak {
      display: flex;
      gap: var(--space-2);
      font-size: var(--text-lg);
    }

    .session__dot {
      color: var(--color-sand);
      transition: color var(--transition-spring), transform var(--transition-spring);

      &--active {
        color: var(--color-green-500);
        transform: scale(1.2);
      }
    }

    @keyframes pulse {
      from { transform: scale(1); }
      to   { transform: scale(1.08); }
    }
  `],
})
export class ChallengeSessionComponent implements OnInit, OnDestroy {
  @Input({ required: true }) challenge!: Challenge;
  @Input({ required: true }) questions!: QuizQuestion[];

  @Output() completed = new EventEmitter<SessionOutcome>();

  private readonly quizService = inject(QuizService);
  private timerId: ReturnType<typeof setInterval> | null = null;
  private startedAt = Date.now();

  readonly currentIndex = signal(0);
  readonly correctCount = signal(0);
  readonly currentStreak = signal(0);
  readonly timeLeft = signal(0);
  private _awaitingNext = false;

  readonly currentQuestion = computed(() => this.questions[this.currentIndex()] ?? null);

  readonly currentPlant = computed((): Plant | undefined =>
    this.currentQuestion()
      ? this.quizService.getPlantById(this.currentQuestion()!.plantId)
      : undefined
  );

  readonly timerUrgent = computed(() => this.timeLeft() <= 10);

  readonly streakDots = computed(() =>
    Array.from({ length: this.challenge.target }, (_, i) => i + 1)
  );

  ngOnInit(): void {
    if (this.challenge.type === 'sprint' && this.challenge.timeLimit) {
      this.timeLeft.set(this.challenge.timeLimit);
      this.startTimer();
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  onAnswered(optionId: string): void {
    if (this._awaitingNext) return;

    const q = this.currentQuestion();
    if (!q) return;

    const correct = optionId === q.correctOptionId;

    if (correct) {
      this.correctCount.update(n => n + 1);
      this.currentStreak.update(n => n + 1);
    } else {
      this.currentStreak.set(0);
    }

    // Streak mode: one wrong answer = instant defeat
    if (this.challenge.type === 'streak' && !correct) {
      this.stopTimer();
      setTimeout(() => this.emit(false), 900);
      return;
    }

    // Check win condition for streak
    if (this.challenge.type === 'streak' && this.currentStreak() >= this.challenge.target) {
      this.stopTimer();
      setTimeout(() => this.emit(true), 900);
      return;
    }

    this._awaitingNext = true;
    const delay = this.challenge.type === 'sprint' ? 600 : 1500;

    setTimeout(() => {
      this._awaitingNext = false;
      const next = this.currentIndex() + 1;
      if (next >= this.questions.length) {
        this.stopTimer();
        const success = this.challenge.type === 'thematic' || this.challenge.type === 'daily'
          ? this.correctCount() >= Math.ceil(this.questions.length * 0.6)
          : this.correctCount() >= this.challenge.target;
        this.emit(success);
      } else {
        this.currentIndex.set(next);
      }
    }, delay);
  }

  private startTimer(): void {
    this.timerId = setInterval(() => {
      this.timeLeft.update(t => {
        if (t <= 1) {
          this.stopTimer();
          // Time's up — emit result based on what was answered so far
          const success = this.correctCount() >= this.challenge.target;
          setTimeout(() => this.emit(success), 300);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private emit(success: boolean): void {
    this.completed.emit({
      success,
      correct: this.correctCount(),
      total: this.questions.length,
      timeUsed: Math.round((Date.now() - this.startedAt) / 1000),
      streak: this.currentStreak(),
    });
  }
}
