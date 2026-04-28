import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { UserProgressService } from '../../core/services/user-progress.service';
import { CollectionService } from '../../core/services/collection.service';
import { RouterLink } from '@angular/router';
import { LEVEL_LABELS } from '../../core/models/user-progress.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <div class="container stack stack--lg">
      <header class="stack">
        <h1>Bonjour, explorateur 🌿</h1>
        <p class="text-muted">Continuez votre apprentissage de la flore.</p>
      </header>

      <!-- Stats rapides -->
      <div class="grid grid--3">
        <div class="card card--flat stack--sm">
          <p class="text-muted text-small">Plantes apprises</p>
          <p class="dashboard__stat">{{ plantsCount() }}</p>
        </div>
        <div class="card card--flat stack--sm">
          <p class="text-muted text-small">Série actuelle</p>
          <p class="dashboard__stat">{{ streak() }} 🔥</p>
        </div>
        <div class="card card--flat stack--sm">
          <p class="text-muted text-small">Niveau</p>
          <p class="dashboard__stat">{{ levelLabel() }}</p>
        </div>
      </div>

      <!-- Actions rapides -->
      <section class="stack">
        <h2>Par où commencer ?</h2>
        <div class="grid grid--2">
          <a routerLink="/identify" class="card card--interactive">
            <span class="dashboard__action-icon">📷</span>
            <h3>Identifier une plante</h3>
            <p class="text-muted text-small">Prenez une photo et découvrez l'espèce.</p>
          </a>
          <a routerLink="/quiz" class="card card--interactive">
            <span class="dashboard__action-icon">🧠</span>
            <h3>Faire un quiz</h3>
            <p class="text-muted text-small">Testez vos connaissances sur les plantes.</p>
          </a>
          <a routerLink="/challenge" class="card card--interactive">
            <span class="dashboard__action-icon">🏆</span>
            <h3>Relever un défi</h3>
            <p class="text-muted text-small">Challenges chronométrés et séries parfaites.</p>
          </a>
          <a routerLink="/collection" class="card card--interactive">
            <span class="dashboard__action-icon">📖</span>
            <h3>Mon herbier</h3>
            <p class="text-muted text-small">{{ collectionCount() }} plante(s) dans votre collection.</p>
          </a>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard__stat {
      font-family: var(--font-display);
      font-size: var(--text-3xl);
      font-weight: var(--weight-bold);
      color: var(--color-green-600);
    }

    .dashboard__action-icon {
      font-size: var(--text-3xl);
      line-height: 1;
    }
  `],
})
export class DashboardComponent {
  private readonly progressService = inject(UserProgressService);
  private readonly collectionService = inject(CollectionService);

  readonly plantsCount = this.progressService.plantsLearnedCount;
  readonly streak = this.progressService.streak;
  readonly level = this.progressService.level;
  readonly collectionCount = this.collectionService.count;
  readonly levelLabel = () => LEVEL_LABELS[this.level()];
}
