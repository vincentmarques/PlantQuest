import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-loader',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
  template: `
    <div
      class="loader"
      [ngClass]="size !== 'md' ? 'loader--' + size : ''"
      role="status"
      [attr.aria-label]="label"
    ></div>
  `,
})
export class LoaderComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() label = 'Chargement…';
}
