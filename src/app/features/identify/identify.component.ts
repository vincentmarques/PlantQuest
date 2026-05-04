import {
  Component,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
  OnDestroy,
} from '@angular/core';
import { PlantApiService } from '../../core/services/plant-api.service';
import { CollectionService } from '../../core/services/collection.service';
import { NotificationService } from '../../core/services/notification.service';
import { UserProgressService } from '../../core/services/user-progress.service';
import { PlantIdentificationResult, Plant } from '../../core/models/plant.model';
import { ImageUploaderComponent } from './image-uploader/image-uploader.component';
import { IdentificationResultComponent } from './identification-result/identification-result.component';
import { PlantDetailComponent } from './plant-detail/plant-detail.component';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { compressToBase64, createObjectUrl, revokeObjectUrl } from '../../shared/utils/image.utils';

type IdentifyState = 'idle' | 'identifying' | 'result' | 'detail' | 'error';

@Component({
  selector: 'app-identify',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ImageUploaderComponent,
    IdentificationResultComponent,
    PlantDetailComponent,
    LoaderComponent,
  ],
  template: `
    <div class="container identify-page">

      @switch (state()) {

        <!-- État idle : upload -->
        @case ('idle') {
          <div class="identify-page__intro stack">
            <header class="stack--sm">
              <h1>Identifier une plante</h1>
              <p class="text-muted">
                Prenez ou téléversez une photo — l'IA analyse et reconnaît l'espèce en quelques secondes.
              </p>
            </header>
            <app-image-uploader (fileSelected)="onFileSelected($event)" />
          </div>
        }

        <!-- État identifying : animation de scan -->
        @case ('identifying') {
          <div class="identify-page__scanning stack">
            <div class="scan-container">
              <img
                [src]="previewUrl()"
                alt="Analyse en cours…"
                class="scan-image"
              />
              <div class="scan-line" aria-hidden="true"></div>
              <div class="scan-overlay" aria-hidden="true"></div>
            </div>
            <div class="flex flex--center flex--column" style="gap: var(--space-3)">
              <app-loader size="lg" label="Analyse de la plante en cours…" />
              <p class="text-muted">Analyse en cours…</p>
            </div>
          </div>
        }

        <!-- État result : résultat -->
        @case ('result') {
          <app-identification-result
            [result]="identificationResult()!"
            [previewUrl]="previewUrl()"
            [inCollection]="isInCollection"
            (addToCollection)="onAddToCollection()"
            (viewDetail)="state.set('detail')"
            (restart)="onRestart()"
          />
        }

        <!-- État detail : fiche plante -->
        @case ('detail') {
          @if (detailPlant()) {
            <app-plant-detail
              [plant]="detailPlant()!"
              (close)="state.set('result')"
              (addToCollection)="onAddToCollection()"
            />
          }
        }

        <!-- État error -->
        @case ('error') {
          <div class="identify-page__error stack">
            <div class="alert alert--error" role="alert">
              <span class="alert__icon">✕</span>
              <p class="alert__message">{{ errorMessage() }}</p>
            </div>
            @if (previewUrl()) {
              <button class="btn btn--primary" (click)="retryWithSameImage()">
                Réessayer avec la même photo
              </button>
            }
            <button class="btn btn--ghost" (click)="onRestart()">
              Choisir une autre photo
            </button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .identify-page {
      max-width: 720px;

      &__intro, &__scanning, &__error {
        display: flex;
        flex-direction: column;
        gap: var(--space-8);
      }
    }

    // ----- Scan animation -----
    .scan-container {
      position: relative;
      border-radius: var(--radius-lg);
      overflow: hidden;
      max-height: 400px;
    }

    .scan-image {
      width: 100%;
      max-height: 400px;
      object-fit: cover;
      display: block;
      filter: brightness(0.85);
    }

    .scan-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to bottom,
        transparent 0%,
        rgba(61, 139, 55, 0.08) 50%,
        transparent 100%
      );
      animation: pulseOverlay 2s ease-in-out infinite;
    }

    .scan-line {
      position: absolute;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(
        to right,
        transparent,
        var(--color-primary-400) 20%,
        var(--color-primary-300) 50%,
        var(--color-primary-400) 80%,
        transparent
      );
      box-shadow: 0 0 12px var(--color-primary-400), 0 0 4px var(--color-primary-300);
      animation: scanLine 2s ease-in-out infinite;
    }

    @keyframes scanLine {
      0%   { top: 5%;   opacity: 0; }
      10%  { opacity: 1; }
      90%  { opacity: 1; }
      100% { top: 92%;  opacity: 0; }
    }

    @keyframes pulseOverlay {
      0%, 100% { opacity: 0.6; }
      50%       { opacity: 1; }
    }
  `],
})
export class IdentifyComponent implements OnDestroy {
  private readonly apiService = inject(PlantApiService);
  private readonly collectionService = inject(CollectionService);
  private readonly notifications = inject(NotificationService);
  private readonly progressService = inject(UserProgressService);

  readonly state = signal<IdentifyState>('idle');
  readonly previewUrl = signal<string | null>(null);
  readonly identificationResult = signal<PlantIdentificationResult | null>(null);
  readonly errorMessage = signal('');

  private currentFile: File | null = null;
  private currentObjectUrl: string | null = null;

  readonly detailPlant = computed<Plant | null>(() => {
    const result = this.identificationResult();
    if (!result) return null;
    return result.plant as Plant;
  });

  readonly isInCollection = computed(() => {
    const result = this.identificationResult();
    if (!result) return false;
    return this.collectionService.has(result.plant.id);
  });

  async onFileSelected(file: File): Promise<void> {
    this.currentFile = file;
    this.revokeCurrentUrl();
    this.currentObjectUrl = createObjectUrl(file);
    this.previewUrl.set(this.currentObjectUrl);
    await this.identify(file);
  }

  async retryWithSameImage(): Promise<void> {
    if (this.currentFile) {
      await this.identify(this.currentFile);
    }
  }

  onAddToCollection(): void {
    const result = this.identificationResult();
    if (!result) return;

    const plant = result.plant as Plant;
    this.collectionService.add(plant, this.previewUrl() ?? undefined);
    this.progressService.markPlantLearned(plant.id);
    this.progressService.addScore(10);
    this.notifications.success(`${plant.commonName} ajouté à votre herbier !`);
  }

  onRestart(): void {
    this.revokeCurrentUrl();
    this.currentFile = null;
    this.identificationResult.set(null);
    this.errorMessage.set('');
    this.state.set('idle');
  }

  ngOnDestroy(): void {
    this.revokeCurrentUrl();
  }

  private async identify(file: File): Promise<void> {
    this.state.set('identifying');
    this.errorMessage.set('');

    try {
      const base64 = await compressToBase64(file);
      this.apiService.identifyFromBase64(base64, file.type).subscribe({
        next: result => {
          this.identificationResult.set(result);
          this.state.set('result');
        },
        error: () => {
          // Demo mode : résultat fictif si pas de clé API
          this.identificationResult.set(this.buildDemoResult());
          this.state.set('result');
          this.notifications.info('Mode démo — configurez votre clé API Plant.id pour de vraies identifications.');
        },
      });
    } catch {
      this.errorMessage.set('Impossible de traiter cette image. Essayez un autre format.');
      this.state.set('error');
    }
  }

  private buildDemoResult(): PlantIdentificationResult {
    return {
      plant: {
        id: 'taraxacum-officinale',
        commonName: 'Pissenlit (démo)',
        scientificName: 'Taraxacum officinale',
        family: 'Asteraceae',
        description: 'Plante herbacée très commune reconnaissable à ses fleurs jaunes.',
        habitat: ['prairies', 'bords de chemins'],
        edible: true,
        toxic: false,
        floweringSeason: ['mars', 'mai'],
        images: [],
        difficulty: 'easy',
        tags: ['comestible', 'médicinal'],
      },
      confidence: 0.87,
      similarPlants: [
        { scientificName: 'Crepis capillaris', commonName: 'Crépide capillaire', confidence: 0.07 },
        { scientificName: 'Leontodon autumnalis', commonName: 'Liondent d\'automne', confidence: 0.04 },
      ],
    };
  }

  private revokeCurrentUrl(): void {
    if (this.currentObjectUrl) {
      revokeObjectUrl(this.currentObjectUrl);
      this.currentObjectUrl = null;
    }
  }
}
