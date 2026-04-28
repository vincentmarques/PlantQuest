import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CollectionService } from '../../core/services/collection.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-collection',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyStateComponent, RouterLink],
  template: `
    <div class="container stack">
      <h1>Mon Herbier</h1>

      @if (entries().length === 0) {
        <app-empty-state
          icon="📖"
          title="Votre herbier est vide"
          description="Identifiez des plantes et ajoutez-les à votre collection."
        >
          <a routerLink="/identify" class="btn btn--primary">Identifier ma première plante</a>
        </app-empty-state>
      } @else {
        <div class="grid grid--auto">
          @for (entry of entries(); track entry.plant.id) {
            <div class="card card--interactive">
              <p class="text-small text-muted">{{ entry.plant.family }}</p>
              <h3>{{ entry.plant.commonName }}</h3>
              <p class="text-muted text-small">{{ entry.plant.scientificName }}</p>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class CollectionComponent {
  private readonly collectionService = inject(CollectionService);
  readonly entries = this.collectionService.entries;
}
