import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="onboarding">
      <div class="container--narrow onboarding__content stack stack--lg">
        <header class="text-center stack">
          <span class="onboarding__logo" aria-hidden="true">🌱</span>
          <h1>Bienvenue sur PlantQuest</h1>
          <p class="text-muted">Apprenez à reconnaître les plantes par la pratique — identification, quiz et défis progressifs.</p>
        </header>

        <a routerLink="/dashboard" class="btn btn--primary btn--lg btn--full">
          Commencer l'aventure
        </a>
      </div>
    </div>
  `,
  styles: [`
    .onboarding {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--color-green-100);
      padding: var(--space-8) var(--space-4);
    }

    .onboarding__content {
      background-color: var(--color-surface);
      border-radius: var(--radius-xl);
      padding: var(--space-12) var(--space-8);
      box-shadow: var(--shadow-xl);
    }

    .onboarding__logo {
      font-size: 4rem;
      line-height: 1;
    }
  `],
})
export class OnboardingComponent {}
