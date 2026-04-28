import { Component, ChangeDetectionStrategy } from '@angular/core';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-identify',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyStateComponent],
  template: `
    <div class="container">
      <h1>Identifier une plante</h1>
      <app-empty-state
        icon="📷"
        title="Identification par photo"
        description="Cette fonctionnalité sera disponible à l'étape 5."
      />
    </div>
  `,
})
export class IdentifyComponent {}
