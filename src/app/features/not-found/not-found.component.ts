import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="error-page" role="main" aria-labelledby="error-title">
      <div class="error-page__card card">
        <div class="error-page__illustration" aria-hidden="true">🍂</div>
        <div class="error-page__code">404</div>
        <h1 class="error-page__title" id="error-title">Page introuvable</h1>
        <p class="error-page__desc">Cette page n'existe pas ou a été déplacée. Pas de panique — la nature est pleine de chemins alternatifs !</p>
        <div class="error-page__actions">
          <a routerLink="/dashboard" class="btn btn--primary">Retour à l'accueil</a>
          <a routerLink="/identify" class="btn btn--ghost">Identifier une plante</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .error-page {
      min-height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-8) var(--space-4);
    }

    .error-page__card {
      max-width: 420px;
      width: 100%;
      text-align: center;
      padding: var(--space-12) var(--space-8);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-4);
    }

    .error-page__illustration {
      font-size: 5rem;
      line-height: 1;
      animation: sway 3s ease-in-out infinite;
    }

    @keyframes sway {
      0%, 100% { transform: rotate(-5deg); }
      50%       { transform: rotate(5deg); }
    }

    .error-page__code {
      font-size: var(--text-4xl, 3rem);
      font-weight: var(--weight-bold);
      color: var(--color-stone-200);
      font-family: var(--font-display);
      line-height: 1;
    }

    .error-page__title {
      font-size: var(--text-2xl);
      font-weight: var(--weight-bold);
      color: var(--color-ink);
      margin: 0;
    }

    .error-page__desc {
      color: var(--color-text-muted);
      font-size: var(--text-sm);
      margin: 0;
      max-width: 320px;
    }

    .error-page__actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
      justify-content: center;
      margin-top: var(--space-2);
    }
  `],
})
export class NotFoundComponent {}
