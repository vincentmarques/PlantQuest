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
import { QuizSession, QuizResult, Difficulty } from '../../core/models/quiz.model';
import { Plant } from '../../core/models/plant.model';
import { QuizSetupComponent } from './quiz-setup/quiz-setup.component';
import { QuestionComponent } from './question/question.component';
import { QuizResultComponent } from './quiz-result/quiz-result.component';
import { LoaderComponent } from '../../shared/components/loader/loader.component';

type QuizState = 'setup' | 'playing' | 'feedback' | 'result';

const FEEDBACK_DELAY_MS = 1800;

@Component({
  selector: 'app-quiz',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [QuizSetupComponent, QuestionComponent, QuizResultComponent, LoaderComponent],
  template: `
    <div class="container quiz-page">
      @switch (state()) {

        @case ('setup') {
          <app-quiz-setup (started)="onStart($event)" />
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
  `],
})
export class QuizComponent {
  @ViewChild('questionRef') questionRef?: QuestionComponent;

  private readonly quizService = inject(QuizService);
  private readonly progressService = inject(UserProgressService);
  private readonly collectionService = inject(CollectionService);
  private readonly notifications = inject(NotificationService);
  readonly router = inject(Router);

  readonly state = signal<QuizState>('setup');
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

  onStart(difficulty: Difficulty): void {
    const s = this.quizService.generateSession(difficulty);
    this.session.set(s);
    this.currentIndex.set(0);
    this.correctCount.set(0);
    this.state.set('playing');
  }

  onAnswered(optionId: string): void {
    const q = this.currentQuestion();
    if (!q) return;

    // Record the answer
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

    // Update user progress
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
    this.state.set('setup');
  }
}
