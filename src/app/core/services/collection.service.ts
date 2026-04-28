import { Injectable, signal, computed, inject } from '@angular/core';
import { CollectionEntry, Plant } from '../models/plant.model';
import { StorageService } from './storage.service';

const STORAGE_KEY = 'pq_collection';

@Injectable({ providedIn: 'root' })
export class CollectionService {
  private readonly storage = inject(StorageService);

  private readonly _entries = signal<CollectionEntry[]>(
    this.storage.get<CollectionEntry[]>(STORAGE_KEY) ?? []
  );

  readonly entries = this._entries.asReadonly();
  readonly count = computed(() => this._entries().length);

  add(plant: Plant, imageUrl?: string, location?: { lat: number; lng: number }): void {
    if (this.has(plant.id)) return;
    const entry: CollectionEntry = {
      plant,
      addedAt: new Date().toISOString(),
      masteryLevel: 0,
      imageUrl,
      location,
    };
    this._entries.update(entries => [...entries, entry]);
    this.persist();
  }

  remove(plantId: string): void {
    this._entries.update(entries => entries.filter(e => e.plant.id !== plantId));
    this.persist();
  }

  updateNote(plantId: string, note: string): void {
    this._entries.update(entries =>
      entries.map(e => (e.plant.id === plantId ? { ...e, note } : e))
    );
    this.persist();
  }

  updateMastery(plantId: string, level: number): void {
    this._entries.update(entries =>
      entries.map(e =>
        e.plant.id === plantId ? { ...e, masteryLevel: Math.min(5, Math.max(0, level)) } : e
      )
    );
    this.persist();
  }

  has(plantId: string): boolean {
    return this._entries().some(e => e.plant.id === plantId);
  }

  getEntry(plantId: string): CollectionEntry | undefined {
    return this._entries().find(e => e.plant.id === plantId);
  }

  private persist(): void {
    this.storage.set(STORAGE_KEY, this._entries());
  }
}
