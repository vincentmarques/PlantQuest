import {
  Component,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CollectionService } from '../../core/services/collection.service';
import { NotificationService } from '../../core/services/notification.service';
import { PlantCategory, CATEGORIES, getPlantCategory } from '../../core/models/plant-category.model';
import { CollectionEntry } from '../../core/models/plant.model';
import { Plant } from '../../core/models/plant.model';

interface CategorySection {
  key: PlantCategory;
  label: string;
  description: string;
  entries: CollectionEntry[];
}

interface AddPlantForm {
  commonName: string;
  scientificName: string;
  family: string;
  description: string;
  category: PlantCategory;
  imageUrl: string;
}

const CATEGORY_DESCRIPTIONS: Record<PlantCategory, string> = {
  'arbres':        'Végétaux hauts et robustes possédant un tronc en bois et des branches ramifiées.',
  'fleurs-herbes': 'Plantes souples et non ligneuses poussant à l\'état sauvage en forêt ou en prairie.',
  'potager':       'Plantes cultivées par l\'humain pour leurs vertus aromatiques, médicinales ou alimentaires.',
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

@Component({
  selector: 'app-collection',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="herbier">

      <!-- Header -->
      <div class="herbier__header">
        <button class="herbier__back" (click)="router.navigate(['/dashboard'])" aria-label="Retour">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
        <h1 class="herbier__title">Herbier</h1>
        <button class="herbier__add-btn" (click)="openAddSheet()" aria-label="Ajouter une plante">
          <i class="fa-solid fa-circle-plus"></i>
        </button>
      </div>

      <!-- Category toggle filters -->
      <div class="herbier__filters">
        <button
          class="toggle-btn"
          [class.toggle-btn--active]="selectedCategory() === null"
          (click)="selectedCategory.set(null)"
        >Toutes</button>
        @for (cat of categories; track cat.key) {
          <button
            class="toggle-btn"
            [class.toggle-btn--active]="selectedCategory() === cat.key"
            (click)="selectedCategory.set(cat.key)"
          >{{ cat.label }}</button>
        }
      </div>

      <!-- Sections par catégorie -->
      <div class="herbier__content">
        @for (section of visibleSections(); track section.key) {
          <div class="category-section">
            <div class="category-section__header">
              <h2 class="category-section__title">{{ section.label }}</h2>
              <p class="category-section__desc">{{ section.description }}</p>
            </div>
            @for (entry of section.entries; track entry.plant.id) {
              <div class="herbal-card" (click)="openPlantDetail(entry)">
                @if (entry.imageUrl) {
                  <img [src]="entry.imageUrl" [alt]="entry.plant.commonName" class="herbal-card__img" />
                } @else {
                  <div class="herbal-card__img-placeholder">
                    <i class="fa-solid fa-seedling"></i>
                  </div>
                }
                <div class="herbal-card__info">
                  <span class="herbal-card__name">{{ entry.plant.commonName }}</span>
                  <span class="herbal-card__family">{{ entry.plant.family }}</span>
                </div>
              </div>
            }
          </div>
        }

        @if (collectionService.count() === 0) {
          <div class="herbier__empty">
            <i class="fa-solid fa-seedling herbier__empty-icon"></i>
            <p class="herbier__empty-title">Votre herbier est vide</p>
            <p class="herbier__empty-sub">Ajoutez votre première plante en appuyant sur +</p>
          </div>
        }
      </div>

      <!-- Add Plant bottom sheet -->
      @if (showAddSheet()) {
        <div class="sheet-overlay" (click)="closeAddSheet()">
          <div class="add-sheet" (click)="$event.stopPropagation()">
            <div class="add-sheet__header">
              <h2 class="add-sheet__title">Ajouter une plante</h2>
              <button class="add-sheet__close" (click)="closeAddSheet()">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <!-- Photo -->
            <div class="add-sheet__photo-wrap">
              <label class="add-photo-btn" for="plant-photo-input">
                @if (addForm.imageUrl) {
                  <img [src]="addForm.imageUrl" alt="Photo plante" class="add-photo-btn__preview" />
                } @else {
                  <i class="fa-solid fa-camera"></i>
                  <span>Ajouter une photo</span>
                }
              </label>
              <input
                id="plant-photo-input"
                type="file"
                accept="image/*"
                class="sr-only"
                (change)="onPhotoSelected($event)"
              />
            </div>

            <!-- Form fields -->
            <div class="add-sheet__fields">
              <div class="field">
                <label class="field__label" for="common-name">Nom commun</label>
                <input
                  id="common-name"
                  class="field__input"
                  type="text"
                  placeholder="Ex: Magnolia"
                  [(ngModel)]="addForm.commonName"
                />
              </div>

              <div class="field">
                <label class="field__label" for="scientific-name">Nom latin</label>
                <input
                  id="scientific-name"
                  class="field__input"
                  type="text"
                  placeholder="Ex: Magnolia grandiflora"
                  [(ngModel)]="addForm.scientificName"
                />
              </div>

              <div class="field">
                <label class="field__label" for="family">Famille</label>
                <input
                  id="family"
                  class="field__input"
                  type="text"
                  placeholder="Ex: Magnoliacées"
                  [(ngModel)]="addForm.family"
                />
              </div>

              <div class="field">
                <label class="field__label" for="category">Catégorie</label>
                <select id="category" class="field__input" [(ngModel)]="addForm.category">
                  @for (cat of categories; track cat.key) {
                    <option [value]="cat.key">{{ cat.label }}</option>
                  }
                </select>
              </div>

              <div class="field">
                <label class="field__label" for="description">Description</label>
                <textarea
                  id="description"
                  class="field__input field__input--textarea"
                  placeholder="Décrivez la plante…"
                  [(ngModel)]="addForm.description"
                  rows="4"
                ></textarea>
              </div>
            </div>

            <div class="add-sheet__footer">
              <button
                class="add-btn"
                [disabled]="!addForm.commonName.trim()"
                (click)="submitAddPlant()"
              >Ajouter</button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .herbier {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--color-bg);
      padding: var(--space-4);
    }

    // ---------- Header ----------
    .herbier__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-4) 0;
      margin-bottom: var(--space-2);
    }

    .herbier__back, .herbier__add-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: var(--text-lg);
      color: var(--color-primary-900);
      padding: var(--space-2);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      min-width: 36px;
      &:hover { background: var(--color-surface-2); }
    }

    .herbier__title {
      font-family: var(--font-display);
      font-size: var(--text-xl);
      font-weight: var(--weight-bold);
      color: var(--color-primary-900);
      margin: 0;
    }

    // ---------- Filters ----------
    .herbier__filters {
      display: flex;
      gap: var(--space-3);
      flex-wrap: wrap;
      margin-bottom: var(--space-4);
    }

    .toggle-btn {
      padding: var(--space-2) var(--space-3);
      border: 1.5px solid var(--color-primary-900);
      border-radius: var(--radius-md);
      background: transparent;
      color: var(--color-primary-900);
      font-size: var(--text-sm);
      cursor: pointer;
      transition: background var(--transition-fast), color var(--transition-fast);
      white-space: nowrap;

      &--active {
        background: var(--color-primary-900);
        color: #ebfef5;
      }

      &:hover:not(.toggle-btn--active) { background: var(--color-primary-100); }
    }

    // ---------- Content ----------
    .herbier__content {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
    }

    .category-section {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .category-section__header {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .category-section__title {
      font-family: var(--font-display);
      font-size: var(--text-xl);
      color: var(--color-primary-900);
      margin: 0;
    }

    .category-section__desc {
      font-size: var(--text-sm);
      color: #2c5116;
      margin: 0;
      line-height: var(--leading-snug);
    }

    // ---------- Herbal card ----------
    .herbal-card {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-2);
      background: #e4facd;
      border-radius: var(--radius-xl);
      cursor: pointer;
      transition: opacity var(--transition-fast), transform var(--transition-fast);

      &:hover { opacity: 0.9; transform: translateY(-1px); }
      &:active { transform: scale(0.98); }
    }

    .herbal-card__img {
      width: 64px;
      height: 64px;
      object-fit: cover;
      border-radius: var(--radius-xl);
      flex-shrink: 0;
    }

    .herbal-card__img-placeholder {
      width: 64px;
      height: 64px;
      border-radius: var(--radius-xl);
      background: var(--color-primary-100);
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-primary-700);
      font-size: var(--text-xl);
    }

    .herbal-card__info {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
      color: var(--color-primary-900);
    }

    .herbal-card__name {
      font-size: var(--text-xl);
      font-weight: var(--weight-medium);
      line-height: 1;
    }

    .herbal-card__family {
      font-size: var(--text-base);
    }

    // ---------- Empty state ----------
    .herbier__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-16) 0;
      text-align: center;
    }

    .herbier__empty-icon {
      font-size: 3rem;
      color: var(--color-primary-300);
    }

    .herbier__empty-title {
      font-family: var(--font-display);
      font-size: var(--text-lg);
      color: var(--color-primary-900);
      margin: 0;
    }

    .herbier__empty-sub {
      font-size: var(--text-sm);
      color: var(--color-text-muted);
      margin: 0;
    }

    // ---------- Add sheet overlay ----------
    .sheet-overlay {
      position: fixed;
      inset: 0;
      background: rgba(1, 90, 61, 0.5);
      backdrop-filter: blur(4px);
      z-index: var(--z-modal);
      display: flex;
      align-items: flex-end;
    }

    .add-sheet {
      background: var(--color-bg);
      border-radius: var(--radius-xl) var(--radius-xl) 0 0;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      padding: var(--space-4);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      box-shadow: var(--shadow-xl);
    }

    .add-sheet__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .add-sheet__title {
      font-family: var(--font-display);
      font-size: var(--text-xl);
      color: var(--color-primary-900);
      margin: 0;
    }

    .add-sheet__close {
      background: none;
      border: none;
      cursor: pointer;
      font-size: var(--text-lg);
      color: var(--color-primary-900);
      padding: var(--space-2);
      border-radius: var(--radius-md);
      &:hover { background: var(--color-surface-2); }
    }

    // ---------- Photo picker ----------
    .add-sheet__photo-wrap {
      display: flex;
      justify-content: center;
    }

    .add-photo-btn {
      width: 180px;
      height: 180px;
      background: var(--color-periwinkle);
      border-radius: var(--radius-xl);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      cursor: pointer;
      color: var(--color-primary-900);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      transition: opacity var(--transition-fast);
      overflow: hidden;

      i { font-size: var(--text-xl); }
      &:hover { opacity: 0.9; }
    }

    .add-photo-btn__preview {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .sr-only {
      position: absolute;
      width: 1px; height: 1px;
      padding: 0; margin: -1px;
      overflow: hidden;
      clip: rect(0,0,0,0);
      white-space: nowrap;
      border: 0;
    }

    // ---------- Form fields ----------
    .add-sheet__fields {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .field__label {
      font-size: var(--text-sm);
      color: var(--color-primary-900);
      font-weight: var(--weight-medium);
    }

    .field__input {
      padding: var(--space-3);
      border: 1.5px solid var(--color-primary-900);
      border-radius: var(--radius-sm);
      background: var(--color-surface);
      color: var(--color-ink);
      font-size: var(--text-sm);
      width: 100%;
      box-sizing: border-box;
      font-family: var(--font-body);

      &:focus { outline: none; border-color: var(--color-primary-600); box-shadow: 0 0 0 2px var(--color-primary-100); }

      &--textarea {
        resize: vertical;
        min-height: 100px;
      }
    }

    // ---------- Footer ----------
    .add-sheet__footer {
      display: flex;
      justify-content: flex-end;
      padding-bottom: var(--space-4);
    }

    .add-btn {
      padding: var(--space-3) var(--space-6);
      background: var(--color-primary-900);
      color: #ebfef5;
      border: none;
      border-radius: var(--radius-xl);
      font-size: var(--text-base);
      font-weight: var(--weight-medium);
      cursor: pointer;
      transition: opacity var(--transition-fast), transform var(--transition-fast);

      &:disabled { opacity: 0.4; cursor: not-allowed; }
      &:not(:disabled):hover { opacity: 0.9; }
      &:not(:disabled):active { transform: scale(0.97); }
    }
  `],
})
export class CollectionComponent {
  readonly collectionService = inject(CollectionService);
  private readonly notifications = inject(NotificationService);
  readonly router = inject(Router);

  readonly categories = CATEGORIES;
  readonly selectedCategory = signal<PlantCategory | null>(null);
  readonly showAddSheet = signal(false);

  addForm: AddPlantForm = this.emptyForm();

  readonly visibleSections = computed((): CategorySection[] => {
    const filter = this.selectedCategory();
    const entries = this.collectionService.entries();

    const allSections = CATEGORIES.map(cat => ({
      key: cat.key,
      label: cat.label,
      description: CATEGORY_DESCRIPTIONS[cat.key],
      entries: entries.filter(e => getPlantCategory(e.plant.id, e.plant.tags) === cat.key),
    })).filter(s => s.entries.length > 0);

    if (filter) {
      return allSections.filter(s => s.key === filter);
    }
    return allSections;
  });

  openAddSheet(): void {
    this.addForm = this.emptyForm();
    this.showAddSheet.set(true);
  }

  closeAddSheet(): void {
    this.showAddSheet.set(false);
  }

  onPhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      this.addForm = { ...this.addForm, imageUrl: e.target?.result as string };
    };
    reader.readAsDataURL(file);
  }

  submitAddPlant(): void {
    const f = this.addForm;
    if (!f.commonName.trim()) return;

    const id = slugify(f.commonName) || `plant-${Date.now()}`;
    const plant: Plant = {
      id,
      commonName: f.commonName.trim(),
      scientificName: f.scientificName.trim() || f.commonName.trim(),
      family: f.family.trim() || 'Inconnue',
      description: f.description.trim(),
      habitat: [],
      edible: false,
      toxic: false,
      floweringSeason: [],
      images: f.imageUrl ? [f.imageUrl] : [],
      difficulty: 'easy',
      tags: [f.category],
    };

    this.collectionService.add(plant, f.imageUrl || undefined);
    this.notifications.success(`${plant.commonName} ajouté à l'herbier`);
    this.closeAddSheet();
  }

  openPlantDetail(_entry: CollectionEntry): void {
    // Placeholder pour la vue détail
  }

  private emptyForm(): AddPlantForm {
    return {
      commonName: '',
      scientificName: '',
      family: '',
      description: '',
      category: 'arbres',
      imageUrl: '',
    };
  }
}
