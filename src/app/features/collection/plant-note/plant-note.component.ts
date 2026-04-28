import { Component, input, output, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-plant-note',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="plant-note">
      <div class="plant-note__header">
        <h3 class="plant-note__title">📝 Note personnelle</h3>
        <p class="text-small text-muted">{{ plantName() }}</p>
      </div>

      <textarea
        class="input plant-note__textarea"
        [(ngModel)]="noteText"
        placeholder="Où l'avez-vous trouvée ? Observations particulières..."
        rows="5"
        maxlength="500"
      ></textarea>

      <div class="plant-note__footer">
        <span class="text-small text-muted">{{ noteText().length }}/500</span>
        <div class="plant-note__actions">
          <button class="btn btn--ghost btn--sm" (click)="cancel.emit()">Annuler</button>
          <button class="btn btn--primary btn--sm" (click)="onSave()">Enregistrer</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .plant-note {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .plant-note__header { display: flex; flex-direction: column; gap: var(--space-1); }
    .plant-note__title { margin: 0; font-size: var(--text-lg); }

    .plant-note__textarea {
      resize: vertical;
      min-height: 120px;
      font-family: var(--font-body);
      font-size: var(--text-sm);
    }

    .plant-note__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .plant-note__actions { display: flex; gap: var(--space-2); }
  `],
})
export class PlantNoteComponent implements OnInit {
  readonly plantName = input.required<string>();
  readonly initialNote = input<string>('');

  readonly save = output<string>();
  readonly cancel = output<void>();

  noteText = signal('');

  ngOnInit(): void {
    this.noteText.set(this.initialNote());
  }

  onSave(): void {
    this.save.emit(this.noteText());
  }
}
