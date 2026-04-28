import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
  template: `
    <div class="card" [ngClass]="modifierClasses">
      <ng-content />
    </div>
  `,
})
export class CardComponent {
  @Input() elevated = false;
  @Input() flat = false;
  @Input() interactive = false;
  @Input() success = false;
  @Input() error = false;

  get modifierClasses(): Record<string, boolean> {
    return {
      'card--elevated': this.elevated,
      'card--flat': this.flat,
      'card--interactive': this.interactive,
      'card--success': this.success,
      'card--error': this.error,
    };
  }
}
