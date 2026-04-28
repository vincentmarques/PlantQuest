import { Component, ChangeDetectionStrategy } from '@angular/core';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-quiz',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyStateComponent],
  template: `
    <div class="container">
      <h1>Quiz</h1>
      <app-empty-state
        icon="🧠"
        title="Mode Quiz"
        description="Cette fonctionnalité sera disponible à l'étape 6."
      />
    </div>
  `,
})
export class QuizComponent {}
