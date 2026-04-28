import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { UserProgressService } from '../../core/services/user-progress.service';
import { QuizService } from '../../core/services/quiz.service';
import { BadgeService } from '../../core/services/badge.service';
import { QuizQuestion } from '../../core/models/quiz.model';

type Difficulty = 'beginner' | 'intermediate' | 'expert';
type Step = 'intro' | 'level' | 'quiz' | 'done';

interface LevelOption {
  id: Difficulty;
  icon: string;
  label: string;
  description: string;
}

const LEVELS: LevelOption[] = [
  {
    id: 'beginner',
    icon: '🌱',
    label: 'Débutant',
    description: 'Je démarre de zéro — quiz de 5 questions, plantes faciles.',
  },
  {
    id: 'intermediate',
    icon: '🌿',
    label: 'Intermédiaire',
    description: 'Je connais quelques plantes — quiz de 10 questions, difficulté mixte.',
  },
  {
    id: 'expert',
    icon: '🌳',
    label: 'Expert',
    description: 'Je suis botaniste amateur — 15 questions, toutes difficultés.',
  },
];

const FEATURES = [
  { icon: '📷', title: 'Identification par photo', desc: 'Photographiez une plante et obtenez son identification instantanée.' },
  { icon: '🧠', title: 'Quiz interactifs', desc: 'Testez vos connaissances avec des quiz variés et progressifs.' },
  { icon: '🏆', title: 'Défis chronométrés', desc: 'Relevez des challenges pour gagner des badges et des points.' },
  { icon: '📖', title: 'Herbier personnel', desc: 'Constituez votre collection de plantes avec notes et photos.' },
];

@Component({
  selector: 'app-onboarding',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  template: `
    <div class="onboarding" role="main">
      <div class="onboarding__card">

        <!-- Indicateur d'étapes -->
        <div class="onboarding__steps" role="progressbar" [attr.aria-valuenow]="stepIndex()" aria-valuemin="0" aria-valuemax="3" [attr.aria-label]="'Étape ' + (stepIndex() + 1) + ' sur 3'">
          @for (s of [0,1,2]; track s) {
            <div class="onboarding__dot" [class.onboarding__dot--active]="s <= stepIndex()"></div>
          }
        </div>

        <!-- Étape 1 : Intro -->
        @if (step() === 'intro') {
          <div class="onboarding__step" aria-labelledby="ob-title-intro">
            <div class="onboarding__hero" aria-hidden="true">🌿</div>
            <h1 class="onboarding__title" id="ob-title-intro">Bienvenue sur<br><span class="onboarding__brand">PlantQuest</span></h1>
            <p class="onboarding__sub">Apprenez à reconnaître les plantes par la pratique — identification, quiz et défis progressifs.</p>

            <ul class="feature-list" aria-label="Fonctionnalités">
              @for (f of features; track f.icon) {
                <li class="feature-item">
                  <span class="feature-item__icon" aria-hidden="true">{{ f.icon }}</span>
                  <div>
                    <p class="feature-item__title">{{ f.title }}</p>
                    <p class="feature-item__desc">{{ f.desc }}</p>
                  </div>
                </li>
              }
            </ul>

            <button class="btn btn--primary btn--lg btn--full" (click)="goTo('level')">
              Commencer l'aventure →
            </button>
          </div>
        }

        <!-- Étape 2 : Niveau -->
        @if (step() === 'level') {
          <div class="onboarding__step" aria-labelledby="ob-title-level">
            <div class="onboarding__hero" aria-hidden="true">🎯</div>
            <h2 class="onboarding__title" id="ob-title-level">Quel est votre niveau ?</h2>
            <p class="onboarding__sub">Choisissez le niveau qui vous correspond. Vous pourrez le changer à tout moment.</p>

            <div class="level-list" role="radiogroup" aria-labelledby="ob-title-level">
              @for (lvl of levels; track lvl.id) {
                <button
                  class="level-card"
                  [class.level-card--selected]="selectedLevel() === lvl.id"
                  role="radio"
                  [attr.aria-checked]="selectedLevel() === lvl.id"
                  (click)="selectedLevel.set(lvl.id)"
                >
                  <span class="level-card__icon" aria-hidden="true">{{ lvl.icon }}</span>
                  <div class="level-card__body">
                    <p class="level-card__label">{{ lvl.label }}</p>
                    <p class="level-card__desc">{{ lvl.description }}</p>
                  </div>
                  <span class="level-card__check" aria-hidden="true">{{ selectedLevel() === lvl.id ? '✓' : '' }}</span>
                </button>
              }
            </div>

            <div class="onboarding__nav">
              <button class="btn btn--ghost" (click)="goTo('intro')">← Retour</button>
              <button class="btn btn--primary" (click)="goTo('quiz')" [disabled]="!selectedLevel()">
                Continuer →
              </button>
            </div>
          </div>
        }

        <!-- Étape 3 : Quiz de calibration -->
        @if (step() === 'quiz') {
          <div class="onboarding__step" aria-labelledby="ob-title-quiz">
            <div class="onboarding__hero" aria-hidden="true">🧠</div>
            <h2 class="onboarding__title" id="ob-title-quiz">Mini-quiz de calibration</h2>
            <p class="onboarding__sub">3 questions rapides pour démarrer avec quelques points.</p>

            <div class="calib-progress" role="progressbar" [attr.aria-valuenow]="quizIndex()" aria-valuemin="0" aria-valuemax="3">
              <div class="calib-progress__fill" [style.width.%]="(quizIndex() / 3) * 100"></div>
            </div>

            @if (currentQuestion()) {
              <div class="calib-question">
                <p class="calib-question__text">{{ currentQuestion()!.question }}</p>
                <div class="calib-options" role="group" [attr.aria-label]="'Réponses à la question ' + (quizIndex() + 1)">
                  @for (opt of currentQuestion()!.options; track opt.id) {
                    <button
                      class="calib-option"
                      [class.calib-option--correct]="answered() && opt.id === currentQuestion()!.correctOptionId"
                      [class.calib-option--wrong]="answered() && selectedAnswer() === opt.id && opt.id !== currentQuestion()!.correctOptionId"
                      [disabled]="answered()"
                      (click)="onCalibAnswer(opt.id)"
                    >
                      {{ opt.label }}
                    </button>
                  }
                </div>
              </div>
            } @else {
              <div class="calib-done">
                <p class="calib-done__score">{{ calibScore() }}/3 bonnes réponses</p>
                <p class="calib-done__msg">{{ calibScore() === 3 ? 'Excellent ! 🏆' : calibScore() >= 2 ? 'Bien joué ! 🌿' : 'Ne vous inquiétez pas, on va apprendre ensemble !' }}</p>
                <button class="btn btn--primary btn--lg btn--full" (click)="finish()">
                  Entrer dans PlantQuest 🌱
                </button>
              </div>
            }

            <div class="onboarding__nav">
              <button class="btn btn--ghost btn--sm" (click)="goTo('level')">← Retour</button>
              <span class="text-small text-muted">{{ quizIndex() }}/3</span>
            </div>
          </div>
        }

      </div>
    </div>
  `,
  styles: [`
    .onboarding {
      min-height: 100dvh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(160deg, var(--color-green-50) 0%, var(--color-green-100) 100%);
      padding: var(--space-6) var(--space-4);
    }

    .onboarding__card {
      width: 100%;
      max-width: 520px;
      background-color: var(--color-surface);
      border-radius: var(--radius-2xl);
      padding: var(--space-8) var(--space-8);
      box-shadow: var(--shadow-xl);
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .onboarding__steps {
      display: flex;
      gap: var(--space-2);
      justify-content: center;
    }

    .onboarding__dot {
      width: 8px;
      height: 8px;
      border-radius: var(--radius-full);
      background-color: var(--color-border);
      transition: background-color var(--transition-base), transform var(--transition-base);

      &--active {
        background-color: var(--color-green-500);
        transform: scale(1.3);
      }
    }

    .onboarding__step {
      display: flex;
      flex-direction: column;
      gap: var(--space-5);
    }

    .onboarding__hero {
      font-size: 3rem;
      line-height: 1;
      text-align: center;
    }

    .onboarding__title {
      text-align: center;
      font-size: var(--text-2xl);
      font-weight: var(--weight-bold);
      line-height: var(--leading-tight);
      margin: 0;
      color: var(--color-ink);
    }

    .onboarding__brand {
      color: var(--color-green-600);
      font-family: var(--font-display);
    }

    .onboarding__sub {
      text-align: center;
      color: var(--color-text-muted);
      font-size: var(--text-sm);
      margin: 0;
    }

    .onboarding__nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-3);
      margin-top: var(--space-2);
    }

    // ----- Feature list -----
    .feature-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      background-color: var(--color-surface-2);
      border-radius: var(--radius-lg);
    }

    .feature-item__icon { font-size: 1.4rem; line-height: 1; flex-shrink: 0; margin-top: 2px; }

    .feature-item__title {
      margin: 0;
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      color: var(--color-ink);
    }

    .feature-item__desc {
      margin: 0;
      font-size: var(--text-xs);
      color: var(--color-text-muted);
      margin-top: 2px;
    }

    // ----- Level selector -----
    .level-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .level-card {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-4);
      background-color: var(--color-surface-2);
      border-radius: var(--radius-xl);
      border: 2px solid transparent;
      text-align: left;
      cursor: pointer;
      transition: border-color var(--transition-fast), background-color var(--transition-fast);
      width: 100%;

      &:hover { border-color: var(--color-green-300); background-color: var(--color-green-50); }
      &:focus-visible { outline: 2px solid var(--color-green-500); outline-offset: 2px; }

      &--selected {
        border-color: var(--color-green-500);
        background-color: var(--color-green-50);
      }
    }

    .level-card__icon { font-size: 1.8rem; line-height: 1; flex-shrink: 0; }

    .level-card__body { flex: 1; min-width: 0; }

    .level-card__label {
      margin: 0;
      font-size: var(--text-base);
      font-weight: var(--weight-semibold);
      color: var(--color-ink);
    }

    .level-card__desc {
      margin: 0;
      font-size: var(--text-xs);
      color: var(--color-text-muted);
      margin-top: 2px;
    }

    .level-card__check {
      color: var(--color-green-500);
      font-weight: var(--weight-bold);
      font-size: var(--text-lg);
      min-width: 20px;
      text-align: center;
    }

    // ----- Calibration quiz -----
    .calib-progress {
      height: 6px;
      background-color: var(--color-surface-2);
      border-radius: var(--radius-full);
      overflow: hidden;
    }

    .calib-progress__fill {
      height: 100%;
      background-color: var(--color-green-500);
      border-radius: var(--radius-full);
      transition: width 0.4s ease;
    }

    .calib-question { display: flex; flex-direction: column; gap: var(--space-4); }

    .calib-question__text {
      font-size: var(--text-base);
      font-weight: var(--weight-medium);
      color: var(--color-ink);
      margin: 0;
      line-height: var(--leading-normal);
    }

    .calib-options {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .calib-option {
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-lg);
      border: 2px solid var(--color-border);
      background-color: var(--color-surface);
      text-align: left;
      font-size: var(--text-sm);
      color: var(--color-ink);
      cursor: pointer;
      transition: border-color var(--transition-fast), background-color var(--transition-fast);

      &:hover:not(:disabled) { border-color: var(--color-green-400); background-color: var(--color-green-50); }
      &:focus-visible { outline: 2px solid var(--color-green-500); outline-offset: 2px; }
      &:disabled { cursor: default; }

      &--correct {
        border-color: var(--color-green-500);
        background-color: var(--color-green-50);
        color: var(--color-green-700);
        font-weight: var(--weight-semibold);
      }

      &--wrong {
        border-color: var(--color-error);
        background-color: #fdf0ee;
        color: var(--color-error);
      }
    }

    .calib-done {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-6);
      background-color: var(--color-green-50);
      border-radius: var(--radius-xl);
      text-align: center;
    }

    .calib-done__score {
      margin: 0;
      font-size: var(--text-2xl);
      font-weight: var(--weight-bold);
      color: var(--color-ink);
    }

    .calib-done__msg {
      margin: 0;
      font-size: var(--text-sm);
      color: var(--color-text-muted);
    }
  `],
})
export class OnboardingComponent {
  private readonly router = inject(Router);
  private readonly progressService = inject(UserProgressService);
  private readonly quizService = inject(QuizService);
  private readonly badgeService = inject(BadgeService);

  readonly features = FEATURES;
  readonly levels = LEVELS;

  readonly step = signal<Step>('intro');
  readonly selectedLevel = signal<Difficulty | null>(null);

  // Calibration quiz
  private calibQuestions: QuizQuestion[] = [];
  readonly quizIndex = signal(0);
  readonly calibScore = signal(0);
  readonly answered = signal(false);
  readonly selectedAnswer = signal<string | null>(null);

  readonly stepIndex = () => ({ intro: 0, level: 1, quiz: 2, done: 2 }[this.step()]);

  readonly currentQuestion = () => this.calibQuestions[this.quizIndex()] ?? null;

  goTo(target: Step): void {
    if (target === 'quiz') {
      this.initCalib();
    }
    this.step.set(target);
  }

  private initCalib(): void {
    const session = this.quizService.generateSession('beginner');
    this.calibQuestions = session.questions.slice(0, 3);
    this.quizIndex.set(0);
    this.calibScore.set(0);
    this.answered.set(false);
    this.selectedAnswer.set(null);
  }

  onCalibAnswer(optionId: string): void {
    if (this.answered()) return;
    const q = this.currentQuestion();
    if (!q) return;

    this.selectedAnswer.set(optionId);
    this.answered.set(true);

    if (optionId === q.correctOptionId) {
      this.calibScore.update(n => n + 1);
    }

    setTimeout(() => {
      const next = this.quizIndex() + 1;
      if (next >= 3) {
        this.quizIndex.set(3);
      } else {
        this.quizIndex.set(next);
        this.answered.set(false);
        this.selectedAnswer.set(null);
      }
    }, 900);
  }

  finish(): void {
    const difficulty = this.selectedLevel() ?? 'beginner';
    this.progressService.completeOnboarding(difficulty);
    this.progressService.addScore(this.calibScore() * 5);
    if (this.calibScore() > 0) {
      this.badgeService.checkProgressBadges();
    }
    this.router.navigate(['/dashboard']);
  }
}
