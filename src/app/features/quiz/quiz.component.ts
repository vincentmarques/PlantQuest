import {
  Component,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { QuizService } from '../../core/services/quiz.service';
import { UserProgressService } from '../../core/services/user-progress.service';
import { CollectionService } from '../../core/services/collection.service';
import { NotificationService } from '../../core/services/notification.service';
import { PlantCategory, CATEGORIES } from '../../core/models/plant-category.model';
import { QuizSession, QuizResult, Difficulty } from '../../core/models/quiz.model';
import { Plant } from '../../core/models/plant.model';
import { QuestionComponent } from './question/question.component';
import { QuizResultComponent } from './quiz-result/quiz-result.component';
import { LoaderComponent } from '../../shared/components/loader/loader.component';

type QuizState = 'setup' | 'playing' | 'feedback' | 'result';

interface DifficultyOption { value: Difficulty; label: string; }

const DIFFICULTIES: DifficultyOption[] = [
  { value: 'beginner',     label: 'Facile'  },
  { value: 'intermediate', label: 'Moyen'   },
  { value: 'expert',       label: 'Difficile' },
];

const FEEDBACK_DELAY_MS = 1800;

@Component({
  selector: 'app-quiz',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [QuestionComponent, QuizResultComponent, LoaderComponent],
  template: `
    @switch (state()) {

      @case ('setup') {
        <div class="quiz-setup">
          <header class="quiz-setup__header">
            <button class="quiz-setup__back" (click)="router.navigate(['/dashboard'])">
              <i class="fa-solid fa-chevron-left"></i>
            </button>
            <h1 class="quiz-setup__title">Quiz</h1>
          </header>

          <section class="quiz-setup__section">
            <h2 class="quiz-setup__section-label">Niveau</h2>
            <div class="toggle-group">
              @for (d of difficulties; track d.value) {
                <button
                  class="toggle-btn"
                  [class.toggle-btn--active]="selectedDifficulty() === d.value"
                  (click)="selectedDifficulty.set(d.value)"
                >{{ d.label }}</button>
              }
            </div>
          </section>

          <section class="quiz-setup__section">
            <h2 class="quiz-setup__section-label">Catégories</h2>
            <div class="toggle-group toggle-group--wrap">
              <button
                class="toggle-btn"
                [class.toggle-btn--active]="selectedCategory() === null"
                (click)="selectedCategory.set(null)"
              >Toutes</button>
              @for (cat of categories; track cat.key) {
                <button
                  class="toggle-btn"
                  [class.toggle-btn--active]="selectedCategory() === cat.key"
                  (click)="selectedCategory.set(cat.key)"
                >{{ cat.label }}</button>
              }
            </div>
          </section>

          <div class="quiz-setup__footer">
            <button
              class="btn-start"
              [disabled]="!selectedDifficulty()"
              (click)="onStart()"
            >Commencer</button>
          </div>
        </div>
      }

      @case ('playing') {
        @if (currentQuestion()) {
          <app-question
            #questionRef
            [question]="currentQuestion()!"
            [index]="currentIndex()"
            [total]="session()!.questions.length"
            [plant]="currentPlant()"
            [correctCount]="correctCount()"
            (answered)="onAnswered($event)"
            (skip)="onSkip()"
            (quit)="onQuit()"
          />
        }
      }

      @case ('feedback') {
        <div class="quiz-feedback">
          <app-loader size="lg" />
          <p>{{ isLastQuestion() ? 'Calcul du score…' : 'Question suivante…' }}</p>
        </div>
      }

      @case ('result') {
        <app-quiz-result
          [result]="quizResult()!"
          [wrongPlants]="wrongPlants()"
          (retry)="onRestart()"
          (goHome)="router.navigate(['/dashboard'])"
        />
      }

    }
  `,
  styles: [`
    // ---------- Setup ----------
    .quiz-setup {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      padding: var(--space-4);
      background: var(--color-bg);
    }

    .quiz-setup__header {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      padding: var(--space-4) 0 var(--space-6);
    }

    .quiz-setup__back {
      position: absolute;
      left: 0;
      background: none;
      border: none;
      cursor: pointer;
      font-size: var(--text-lg);
      color: var(--color-primary-900);
      padding: var(--space-2);
      border-radius: var(--radius-md);
      &:hover { background: var(--color-surface-2); }
    }

    .quiz-setup__title {
      font-family: var(--font-display);
      font-size: var(--text-2xl);
      font-weight: var(--weight-bold);
      color: var(--color-primary-900);
      margin: 0;
    }

    .quiz-setup__section {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      margin-bottom: var(--space-6);
    }

    .quiz-setup__section-label {
      font-family: var(--font-display);
      font-size: var(--text-lg);
      color: var(--color-primary-900);
      margin: 0;
    }

    .toggle-group {
      display: flex;
      gap: var(--space-3);
      &--wrap { flex-wrap: wrap; }
    }

    .toggle-btn {
      padding: var(--space-2) var(--space-3);
      border: 1.5px solid var(--color-primary-900);
      border-radius: var(--radius-md);
      background: transparent;
      color: var(--color-primary-900);
      font-size: var(--text-base);
      cursor: pointer;
      transition: background var(--transition-fast), color var(--transition-fast);
      white-space: nowrap;

      &--active {
        background: var(--color-primary-900);
        color: #ebfef5;
      }

      &:hover:not(.toggle-btn--active) {
        background: var(--color-primary-100);
      }
    }

    .quiz-setup__footer {
      margin-top: auto;
      padding-top: var(--space-8);
    }

    .btn-start {
      width: 100%;
      padding: var(--space-4);
      border: none;
      border-radius: var(--radius-xl);
      background: var(--color-primary-900);
      color: #ebfef5;
      font-size: var(--text-lg);
      font-family: var(--font-display);
      font-weight: var(--weight-bold);
      cursor: pointer;
      transition: opacity var(--transition-fast), transform var(--transition-fast);

      &:disabled { opacity: 0.4; cursor: not-allowed; }
      &:not(:disabled):hover { opacity: 0.9; }
      &:not(:disabled):active { transform: scale(0.98); }
    }

    // ---------- Feedback ----------
    .quiz-feedback {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-4);
      color: var(--color-text-muted);
    }
  `],
})
export class QuizComponent {
  @ViewChild('questionRef') questionRef?: QuestionComponent;

  private readonly quizService = inject(QuizService);
  private readonly progressService = inject(UserProgressService);
  private readonly collectionService = inject(CollectionService);
  private readonly notifications = inject(NotificationService);
  readonly router = inject(Router);

  readonly categories = CATEGORIES;
  readonly difficulties = DIFFICULTIES;

  readonly state = signal<QuizState>('setup');
  readonly selectedCategory = signal<PlantCategory | null>(null);
  readonly selectedDifficulty = signal<Difficulty | null>(null);
  readonly session = signal<QuizSession | null>(null);
  readonly currentIndex = signal(0);
  readonly correctCount = signal(0);
  readonly quizResult = signal<QuizResult | null>(null);

  readonly currentQuestion = computed(() => {
    const s = this.session();
    const i = this.currentIndex();
    return s?.questions[i] ?? null;
  });

  readonly currentPlant = computed((): Plant | undefined => {
    const q = this.currentQuestion();
    return q ? this.quizService.getPlantById(q.plantId) : undefined;
  });

  readonly isLastQuestion = computed(() => {
    const s = this.session();
    return s ? this.currentIndex() === s.questions.length - 1 : false;
  });

  readonly wrongPlants = computed((): Plant[] => {
    const result = this.quizResult();
    if (!result) return [];
    return result.wrongPlantIds
      .map(id => this.quizService.getPlantById(id))
      .filter((p): p is Plant => !!p);
  });

  onStart(): void {
    const difficulty = this.selectedDifficulty();
    if (!difficulty) return;
    const s = this.quizService.generateSession(difficulty, this.selectedCategory() ?? undefined);
    this.session.set(s);
    this.currentIndex.set(0);
    this.correctCount.set(0);
    this.state.set('playing');
  }

  onAnswered(optionId: string): void {
    const q = this.currentQuestion();
    if (!q) return;

    this.session.update(s => {
      if (!s) return s;
      return { ...s, answers: { ...s.answers, [q.id]: optionId } };
    });

    if (optionId === q.correctOptionId) {
      this.correctCount.update(n => n + 1);
    }

    this.state.set('feedback');
    this.scheduleNext();
  }

  onSkip(): void {
    this.state.set('feedback');
    this.scheduleNext();
  }

  onQuit(): void {
    this.session.set(null);
    this.currentIndex.set(0);
    this.correctCount.set(0);
    this.selectedDifficulty.set(null);
    this.state.set('setup');
  }

  private scheduleNext(): void {
    setTimeout(() => {
      const s = this.session()!;
      const nextIndex = this.currentIndex() + 1;

      if (nextIndex >= s.questions.length) {
        this.finalizeQuiz();
      } else {
        this.currentIndex.set(nextIndex);
        this.state.set('playing');
      }
    }, FEEDBACK_DELAY_MS);
  }

  private finalizeQuiz(): void {
    const s = this.session();
    if (!s) return;

    const completed = { ...s, completedAt: new Date().toISOString() };
    this.session.set(completed);

    const result = this.quizService.scoreSession(completed);
    this.quizResult.set(result);

    this.progressService.addScore(result.score * 5);
    this.progressService.incrementQuizzesCompleted();
    result.session.questions
      .filter(q => completed.answers[q.id] === q.correctOptionId)
      .forEach(q => {
        this.progressService.markPlantLearned(q.plantId);
        const entry = this.collectionService.getEntry(q.plantId);
        if (entry) {
          this.collectionService.updateMastery(q.plantId, entry.masteryLevel + 1);
        }
      });

    if (result.percentage === 100) {
      this.progressService.unlockBadge('quiz-perfect');
      this.notifications.success('Score parfait ! Badge débloqué 🏆');
    } else if (result.percentage >= 80) {
      this.notifications.success(`Bravo ! ${result.score}/${result.total} — +${result.score * 5} points`);
    }

    this.state.set('result');
  }

  onRestart(): void {
    this.session.set(null);
    this.quizResult.set(null);
    this.currentIndex.set(0);
    this.correctCount.set(0);
    this.selectedDifficulty.set(null);
    this.state.set('setup');
  }
}
