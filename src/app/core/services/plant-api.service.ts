import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, retry, shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Plant, PlantIdentificationResult, PlantIdentificationResultSchema } from '../models/plant.model';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class PlantApiService {
  private readonly http = inject(HttpClient);
  private readonly notifications = inject(NotificationService);

  private readonly cache = new Map<string, Observable<PlantIdentificationResult>>();

  identifyFromBase64(base64Image: string, mimeType = 'image/jpeg'): Observable<PlantIdentificationResult> {
    const cacheKey = base64Image.slice(0, 64);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const body = {
      images: [`data:${mimeType};base64,${base64Image}`],
      similar_images: true,
    };

    const result$ = this.http
      .post<unknown>(`${environment.plantIdApiUrl}/identification`, body, {
        headers: { 'Api-Key': environment.plantIdApiKey },
      })
      .pipe(
        retry({ count: 2, delay: 1000 }),
        map(raw => this.parsePlantIdResponse(raw)),
        catchError(err => {
          this.notifications.error('Impossible d\'identifier la plante. Vérifiez votre connexion.');
          return throwError(() => err);
        }),
        shareReplay(1)
      );

    this.cache.set(cacheKey, result$);
    return result$;
  }

  searchByName(query: string): Observable<Plant[]> {
    return this.http
      .get<unknown>(`${environment.inaturalistApiUrl}/taxa`, {
        params: { q: query, rank: 'species', iconic_taxa: 'Plantae', per_page: '20' },
      })
      .pipe(
        map(raw => this.parseINaturalistTaxa(raw)),
        retry({ count: 1, delay: 500 }),
        catchError(() => of([]))
      );
  }

  clearCache(): void {
    this.cache.clear();
  }

  private parsePlantIdResponse(raw: unknown): PlantIdentificationResult {
    const data = raw as Record<string, unknown>;
    const result = (data['result'] as Record<string, unknown>) ?? {};
    const classification = (result['classification'] as Record<string, unknown>) ?? {};
    const suggestions = (classification['suggestions'] as Record<string, unknown>[]) ?? [];
    const top = suggestions[0] ?? {};
    const topDetails = (top['details'] as Record<string, unknown>) ?? {};
    const commonNames = (topDetails['common_names'] as string[]) ?? [];

    const parsed: PlantIdentificationResult = {
      plant: {
        id: String(top['id'] ?? crypto.randomUUID()),
        scientificName: String(top['name'] ?? 'Inconnue'),
        commonName: commonNames[0] ?? String(top['name'] ?? 'Plante inconnue'),
      },
      confidence: Number(top['probability'] ?? 0),
      similarPlants: suggestions.slice(1).map(s => ({
        scientificName: String(s['name'] ?? ''),
        commonName: ((s['details'] as Record<string, unknown>)?.['common_names'] as string[])?.[0] ?? String(s['name'] ?? ''),
        confidence: Number(s['probability'] ?? 0),
      })),
    };

    const validated = PlantIdentificationResultSchema.safeParse(parsed);
    return validated.success ? validated.data : parsed;
  }

  private parseINaturalistTaxa(raw: unknown): Plant[] {
    const data = raw as Record<string, unknown>;
    const results = (data['results'] as Record<string, unknown>[]) ?? [];

    return results.map(taxon => ({
      id: String(taxon['id'] ?? ''),
      scientificName: String(taxon['name'] ?? ''),
      commonName: String((taxon['preferred_common_name'] as string) ?? taxon['name'] ?? ''),
      family: String((taxon['family'] as string) ?? ''),
      description: '',
      habitat: [],
      edible: false,
      toxic: false,
      floweringSeason: [],
      images: [(taxon['default_photo'] as Record<string, unknown>)?.['medium_url'] as string ?? ''].filter(Boolean),
      difficulty: 'medium' as const,
      tags: [],
    }));
  }
}
