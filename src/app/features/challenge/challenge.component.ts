import { Component, ChangeDetectionStrategy } from '@angular/core';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-challenge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyStateComponent],
  template: `
    <div class="container">
      <h1>Défis</h1>
      <app-empty-state
        icon="🏆"
        title="Défis & Challenges"
        description="Cette fonctionnalité sera disponible à l'étape 7."
      />
    </div>
  `,
})
export class ChallengeComponent {}
