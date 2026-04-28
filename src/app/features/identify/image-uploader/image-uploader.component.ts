import {
  Component,
  Output,
  EventEmitter,
  signal,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-image-uploader',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
  template: `
    <div
      class="uploader"
      [ngClass]="{ 'uploader--drag-over': dragOver() }"
      (dragenter)="onDragEnter($event)"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave($event)"
      (drop)="onDrop($event)"
      (click)="fileInput.click()"
      role="button"
      tabindex="0"
      aria-label="Zone de dépôt d'image — cliquez ou glissez une photo"
      (keydown.enter)="fileInput.click()"
      (keydown.space)="fileInput.click()"
    >
      <span class="uploader__icon" aria-hidden="true">📷</span>
      <p class="uploader__title">Glissez une photo ici</p>
      <p class="uploader__subtitle text-muted text-small">ou cliquez pour sélectionner</p>

      <div class="uploader__actions" (click)="$event.stopPropagation()">
        <button class="btn btn--primary" (click)="fileInput.click()">
          Choisir une photo
        </button>
        @if (cameraAvailable()) {
          <button class="btn btn--ghost" (click)="openCamera()">
            📸 Utiliser la caméra
          </button>
        }
      </div>

      <p class="uploader__hint text-muted text-small">
        JPG, PNG, WebP — max 10 Mo
      </p>
    </div>

    <!-- Caméra native -->
    <video
      #videoEl
      class="camera-preview"
      [class.camera-preview--active]="cameraActive()"
      autoplay
      playsinline
      aria-label="Aperçu caméra"
    ></video>

    @if (cameraActive()) {
      <div class="camera-controls">
        <button class="btn btn--primary btn--lg" (click)="capturePhoto()">
          📸 Prendre la photo
        </button>
        <button class="btn btn--ghost" (click)="stopCamera()">
          Annuler
        </button>
      </div>
    }

    <!-- Canvas pour capturer la frame (caché) -->
    <canvas #canvasEl class="hidden"></canvas>

    <!-- Input fichier caché -->
    <input
      #fileInput
      type="file"
      accept="image/*"
      class="hidden"
      aria-hidden="true"
      (change)="onFileChange($event)"
    />

    @if (errorMsg()) {
      <div class="alert alert--error" role="alert">
        <span class="alert__icon">✕</span>
        <p class="alert__message">{{ errorMsg() }}</p>
      </div>
    }
  `,
  styles: [`
    .uploader {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-4);
      padding: var(--space-12) var(--space-8);
      border: 2px dashed var(--color-border);
      border-radius: var(--radius-xl);
      background-color: var(--color-bg);
      cursor: pointer;
      transition: border-color var(--transition-base), background-color var(--transition-base);
      text-align: center;
      min-height: 280px;

      &:hover, &:focus-visible {
        border-color: var(--color-green-400);
        background-color: var(--color-green-100);
        outline: none;
      }

      &--drag-over {
        border-color: var(--color-green-500);
        background-color: var(--color-green-100);
        transform: scale(1.01);
      }
    }

    .uploader__icon { font-size: 3rem; line-height: 1; }
    .uploader__title { font-size: var(--text-lg); font-weight: var(--weight-semibold); }

    .uploader__actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
      justify-content: center;
    }

    .camera-preview {
      display: none;
      width: 100%;
      max-height: 400px;
      border-radius: var(--radius-lg);
      object-fit: cover;
      background: #000;

      &--active { display: block; }
    }

    .camera-controls {
      display: flex;
      gap: var(--space-3);
      justify-content: center;
      margin-top: var(--space-4);
    }
  `],
})
export class ImageUploaderComponent {
  @Output() fileSelected = new EventEmitter<File>();

  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('videoEl') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasEl') canvasRef!: ElementRef<HTMLCanvasElement>;

  readonly dragOver = signal(false);
  readonly cameraActive = signal(false);
  readonly errorMsg = signal('');
  readonly cameraAvailable = signal(
    typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia
  );

  private stream: MediaStream | null = null;

  onDragEnter(e: DragEvent): void {
    e.preventDefault();
    this.dragOver.set(true);
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault();
  }

  onDragLeave(e: DragEvent): void {
    e.preventDefault();
    this.dragOver.set(false);
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.dragOver.set(false);
    const file = e.dataTransfer?.files[0];
    if (file) this.handleFile(file);
  }

  onFileChange(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.handleFile(file);
    input.value = '';
  }

  async openCamera(): Promise<void> {
    this.errorMsg.set('');
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 960 } },
      });
      this.videoRef.nativeElement.srcObject = this.stream;
      this.cameraActive.set(true);
    } catch {
      this.errorMsg.set('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
    }
  }

  capturePhoto(): void {
    const video = this.videoRef.nativeElement;
    const canvas = this.canvasRef.nativeElement;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      if (!blob) return;
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      this.stopCamera();
      this.fileSelected.emit(file);
    }, 'image/jpeg', 0.9);
  }

  stopCamera(): void {
    this.stream?.getTracks().forEach(t => t.stop());
    this.stream = null;
    this.cameraActive.set(false);
  }

  private handleFile(file: File): void {
    this.errorMsg.set('');
    if (!file.type.startsWith('image/')) {
      this.errorMsg.set('Seules les images sont acceptées (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.errorMsg.set('L\'image est trop volumineuse (max 10 Mo).');
      return;
    }
    this.fileSelected.emit(file);
  }
}
