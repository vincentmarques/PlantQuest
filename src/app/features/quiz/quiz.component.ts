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
import { QuizSetupComponent } from './quiz-setup/quiz-setup.component';
import { QuestionComponent } from './question/question.component';
import { QuizResultComponent } from './quiz-result/quiz-result.component';
import { LoaderComponent } from '../../shared/components/loader/loader.component';

type QuizState = 'category' | 'setup' | 'playing' | 'feedback' | 'result';

const FEEDBACK_DELAY_MS = 1800;

@Component({
  selector: 'app-quiz',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [QuizSetupComponent, QuestionComponent, QuizResultComponent, LoaderComponent],
  template: `
    <div class="container quiz-page">
      @switch (state()) {

        @case ('category') {
          <div class="quiz-categories">
            <header class="quiz-categories__header">
              <h1 class="quiz-categories__title">Quiz</h1>
              <p class="quiz-categories__sub">Choisissez une catégorie</p>
            </header>

            <div class="quiz-categories__list">
              @for (cat of categories; track cat.key) {
                <button class="cat-card cat-card--{{ cat.key }}" (click)="onSelectCategory(cat.key)">
                  <span class="cat-card__icon" aria-hidden="true">{{ cat.icon }}</span>
                  <span class="cat-card__label">{{ cat.label }}</span>
                  <span class="cat-card__sub">{{ cat.sub }}</span>
                </button>
              }
            </div>
          </div>
        }

        @case ('setup') {
          <div class="quiz-setup-wrapper">
            <button class="quiz-back-btn" (click)="state.set('category')">← Catégories</button>
            <app-quiz-setup (started)="onStart($event)" />
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
            />
          }
        }

        @case ('feedback') {
          <div class="quiz-page__feedback flex flex--center flex--column" style="gap: var(--space-4); min-height: 200px;">
            <app-loader size="lg" label="Question suivante…" />
            <p class="text-muted">
              {{ isLastQuestion() ? 'Calcul du score…' : 'Question suivante…' }}
            </p>
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
    </div>
  `,
  styles: [`
    .quiz-page { max-width: 680px; }
    .quiz-page__feedback { padding: var(--space-16) 0; }

    // ----- Category selection -----
    .quiz-categories {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
      padding-top: var(--space-6);
    }

    .quiz-categories__header {
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .quiz-categories__title {
      font-family: var(--font-display);
      font-size: var(--text-2xl);
      font-weight: var(--weight-bold);
      color: var(--color-primary-900);
      margin: 0;
    }

    .quiz-categories__sub {
      font-size: var(--text-sm);
      color: var(--color-text-muted);
      margin: 0;
    }

    .quiz-categories__list {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .cat-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-3);
      padding: var(--space-8) var(--space-6);
      border-radius: var(--radius-xl);
      border: none;
      cursor: pointer;
      text-align: center;
      transition: transform var(--transition-base), box-shadow var(--transition-base);

      &:hover  { transform: translateY(-3px); box-shadow: var(--shadow-md); }
      &:active { transform: scale(0.98); }

      &--arbres {
        background-color: var(--color-primary-900);
        color: #fff;
        .cat-card__sub { color: rgba(255,255,255,0.7); }
      }

      &--fleurs-herbes {
        background-color: var(--color-lime);
        color: var(--color-lime-text);
        .cat-card__sub { color: rgba(0,92,69,0.7); }
      }

      &--potager {
        background-color: var(--color-periwinkle);
        color: var(--color-primary-900);
        .cat-card__sub { color: rgba(1,90,61,0.7); }
      }
    }

    .cat-card__icon  { font-size: 2rem; line-height: 1; }
    .cat-card__label { font-family: var(--font-display); font-size: var(--text-lg); font-weight: var(--weight-bold); }
    .cat-card__sub   { font-size: var(--text-xs); }

    // ----- Back button -----
    .quiz-back-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-4);
      margin-bottom: var(--space-4);
      background: none;
      border: none;
      cursor: pointer;
      font-size: var(--text-sm);
      color: var(--color-text-muted);
      border-radius: var(--radius-md);
      transition: color var(--transition-fast), background var(--transition-fast);

      &:hover { color: var(--color-primary-600); background-color: var(--color-surface-2); }
    }

    .quiz-setup-wrapper { display: flex; flex-direction: column; }
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

  readonly state = signal<QuizState>('category');
  readonly selectedCategory = signal<PlantCategory | null>(null);
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

  onSelectCategory(category: PlantCategory): void {
    this.selectedCategory.set(category);
    this.state.set('setup');
  }

  onStart(difficulty: Difficulty): void {
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
    this.state.set('category');
  }
}
