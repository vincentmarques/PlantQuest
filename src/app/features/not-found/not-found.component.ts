import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="container flex flex--center flex--column" style="min-height: 60vh; gap: var(--space-6);">
      <span style="font-size: 4rem;">🍂</span>
      <h1>Page introuvable</h1>
      <p class="text-muted">Cette page n'existe pas ou a été déplacée.</p>
      <a routerLink="/dashboard" class="btn btn--primary">Retour à l'accueil</a>
    </div>
  `,
})
export class NotFoundComponent {}
