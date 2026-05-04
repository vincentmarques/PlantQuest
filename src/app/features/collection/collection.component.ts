import {
  Component,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CollectionService } from '../../core/services/collection.service';
import { NotificationService } from '../../core/services/notification.service';
import { PlantCategory, CATEGORIES, getPlantCategory } from '../../core/models/plant-category.model';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { PlantCardComponent } from './plant-card/plant-card.component';
import { PlantNoteComponent } from './plant-note/plant-note.component';
import { CollectionEntry } from '../../core/models/plant.model';

type SortKey = 'date-desc' | 'date-asc' | 'name' | 'mastery-desc';

@Component({
  selector: 'app-collection',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    RouterLink,
    EmptyStateComponent,
    PlantCardComponent,
    PlantNoteComponent,
  ],
  template: `
    <div class="collection">
      <!-- Header -->
      <div class="collection__header container">
        <div class="collection__title-row">
          <div>
            <h1 class="collection__title">Mon Herbier</h1>
            <p class="text-muted">
              {{ collectionService.count() }} plante{{ collectionService.count() !== 1 ? 's' : '' }} collectée{{ collectionService.count() !== 1 ? 's' : '' }}
            </p>
          </div>
          <div class="collection__view-toggle">
            <button
              class="btn btn--sm btn--icon"
              [class.btn--primary]="viewMode() === 'grid'"
              [class.btn--ghost]="viewMode() !== 'grid'"
              (click)="viewMode.set('grid')"
              title="Vue grille"
            >⊞</button>
            <button
              class="btn btn--sm btn--icon"
              [class.btn--primary]="viewMode() === 'list'"
              [class.btn--ghost]="viewMode() !== 'list'"
              (click)="viewMode.set('list')"
              title="Vue liste"
            >☰</button>
          </div>
        </div>

        <!-- Onglets catégorie -->
        <div class="collection__tabs" role="tablist" aria-label="Catégories">
          <button
            role="tab"
            class="collection__tab"
            [class.collection__tab--active]="!selectedCategory()"
            [attr.aria-selected]="!selectedCategory()"
            (click)="selectedCategory.set(null)"
          >Toutes</button>
          @for (cat of categories; track cat.key) {
            <button
              role="tab"
              class="collection__tab"
              [class.collection__tab--active]="selectedCategory() === cat.key"
              [attr.aria-selected]="selectedCategory() === cat.key"
              (click)="selectedCategory.set(cat.key)"
            >
              <span aria-hidden="true">{{ cat.icon }}</span> {{ cat.label }}
            </button>
          }
        </div>

        <!-- Barre de recherche + filtres -->
        <div class="collection__filters">
          <div class="collection__search-wrap">
            <span class="collection__search-icon">🔍</span>
            <input
              class="input collection__search"
              type="search"
              placeholder="Rechercher une plante…"
              [(ngModel)]="searchQuery"
            />
          </div>

          <select class="input collection__select" [(ngModel)]="sortKey">
            <option value="date-desc">Plus récentes</option>
            <option value="date-asc">Plus anciennes</option>
            <option value="name">Nom A–Z</option>
            <option value="mastery-desc">Maîtrise ↓</option>
          </select>
        </div>

        @if (activeFilterCount() > 0) {
          <div class="collection__filter-status">
            <span class="text-small text-muted">{{ filteredEntries().length }} résultat{{ filteredEntries().length !== 1 ? 's' : '' }}</span>
            <button class="btn btn--sm btn--ghost" (click)="clearFilters()">✕ Réinitialiser</button>
          </div>
        }
      </div>

      <!-- Contenu -->
      <div class="container">
        @if (collectionService.count() === 0) {
          <app-empty-state
            icon="🌿"
            title="Votre herbier est vide"
            description="Identifiez des plantes et ajoutez-les à votre collection."
          >
            <a routerLink="/identify" class="btn btn--primary">Identifier ma première plante</a>
          </app-empty-state>
        } @else if (filteredEntries().length === 0) {
          <app-empty-state
            icon="🔍"
            title="Aucun résultat"
            description="Aucune plante ne correspond à vos critères."
          >
            <button class="btn btn--ghost" (click)="clearFilters()">Réinitialiser</button>
          </app-empty-state>
        } @else {
          <div [class]="viewMode() === 'grid' ? 'grid grid--auto' : 'collection__list'">
            @for (entry of filteredEntries(); track entry.plant.id) {
              <app-plant-card
                [entry]="entry"
                [viewMode]="viewMode()"
                (openDetail)="onOpenDetail($event)"
                (editNote)="onEditNote($event)"
                (remove)="onRemove($event)"
              />
            }
          </div>
        }
      </div>

      <!-- Modal note -->
      @if (noteTarget()) {
        <div class="collection__modal-backdrop" (click)="closeNote()">
          <div class="collection__modal card" (click)="$event.stopPropagation()">
            <app-plant-note
              [plantName]="noteTarget()!.plant.commonName"
              [initialNote]="noteTarget()!.note ?? ''"
              (save)="onSaveNote($event)"
              (cancel)="closeNote()"
            />
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .collection {
      padding-bottom: var(--space-16);
    }

    .collection__header {
      padding-top: var(--space-8);
      padding-bottom: var(--space-6);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .collection__title-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--space-4);
    }

    .collection__title { margin: 0; }

    .collection__view-toggle {
      display: flex;
      gap: var(--space-1);
      flex-shrink: 0;
    }

    // ----- Category tabs -----
    .collection__tabs {
      display: flex;
      gap: var(--space-2);
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      &::-webkit-scrollbar { display: none; }
    }

    .collection__tab {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      padding: var(--space-2) var(--space-4);
      border-radius: var(--radius-full);
      border: var(--border-width) solid var(--color-border);
      background-color: var(--color-surface);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--color-text-muted);
      cursor: pointer;
      white-space: nowrap;
      transition: all var(--transition-fast);
      flex-shrink: 0;

      &:hover { border-color: var(--color-primary-400); color: var(--color-primary-600); }

      &--active {
        background-color: var(--color-primary-900);
        border-color: var(--color-primary-900);
        color: #fff;
      }
    }

    // ----- Filters -----
    .collection__filters {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
    }

    .collection__search-wrap {
      position: relative;
      flex: 1 1 200px;
    }

    .collection__search-icon {
      position: absolute;
      left: var(--space-3);
      top: 50%;
      transform: translateY(-50%);
      font-size: var(--text-sm);
      pointer-events: none;
    }

    .collection__search {
      width: 100%;
      padding-left: var(--space-8);
    }

    .collection__select {
      flex: 0 1 160px;
    }

    .collection__filter-status {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .collection__list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .collection__modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: var(--z-modal);
      padding: var(--space-4);
    }

    .collection__modal {
      width: 100%;
      max-width: 480px;
      padding: var(--space-6);
    }
  `],
})
export class CollectionComponent {
  readonly collectionService = inject(CollectionService);
  private readonly notifications = inject(NotificationService);

  readonly categories = CATEGORIES;
  readonly viewMode = signal<'grid' | 'list'>('grid');
  readonly selectedCategory = signal<PlantCategory | null>(null);
  readonly noteTarget = signal<CollectionEntry | null>(null);

  searchQuery = '';
  sortKey: SortKey = 'date-desc';

  readonly filteredEntries = computed(() => {
    let entries = [...this.collectionService.entries()];

    const category = this.selectedCategory();
    if (category) {
      entries = entries.filter(e => getPlantCategory(e.plant.id) === category);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      entries = entries.filter(
        e =>
          e.plant.commonName.toLowerCase().includes(q) ||
          e.plant.scientificName.toLowerCase().includes(q) ||
          e.plant.family.toLowerCase().includes(q)
      );
    }

    switch (this.sortKey) {
      case 'date-asc':
        entries.sort((a, b) => a.addedAt.localeCompare(b.addedAt));
        break;
      case 'name':
        entries.sort((a, b) => a.plant.commonName.localeCompare(b.plant.commonName));
        break;
      case 'mastery-desc':
        entries.sort((a, b) => b.masteryLevel - a.masteryLevel);
        break;
      default:
        entries.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
    }

    return entries;
  });

  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.searchQuery.trim()) count++;
    if (this.selectedCategory()) count++;
    return count;
  });

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory.set(null);
  }

  onOpenDetail(_plantId: string): void {}

  onEditNote(plantId: string): void {
    const entry = this.collectionService.getEntry(plantId);
    if (entry) this.noteTarget.set(entry);
  }

  onSaveNote(note: string): void {
    const target = this.noteTarget();
    if (!target) return;
    this.collectionService.updateNote(target.plant.id, note);
    this.notifications.success('Note enregistrée');
    this.noteTarget.set(null);
  }

  closeNote(): void {
    this.noteTarget.set(null);
  }

  onRemove(plantId: string): void {
    this.collectionService.remove(plantId);
    this.notifications.info('Plante retirée de l\'herbier');
  }
}
