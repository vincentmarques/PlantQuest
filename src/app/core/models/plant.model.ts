import { z } from 'zod';

export const PlantSchema = z.object({
  id: z.string(),
  commonName: z.string(),
  scientificName: z.string(),
  family: z.string(),
  description: z.string(),
  habitat: z.array(z.string()),
  edible: z.boolean(),
  toxic: z.boolean(),
  floweringSeason: z.array(z.string()),
  images: z.array(z.string()),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.array(z.string()),
});

export type Plant = z.infer<typeof PlantSchema>;

export const PlantIdentificationResultSchema = z.object({
  plant: PlantSchema.partial().extend({
    id: z.string(),
    commonName: z.string(),
    scientificName: z.string(),
  }),
  confidence: z.number().min(0).max(1),
  similarPlants: z.array(z.object({
    scientificName: z.string(),
    commonName: z.string(),
    confidence: z.number(),
  })).optional(),
});

export type PlantIdentificationResult = z.infer<typeof PlantIdentificationResultSchema>;

export interface CollectionEntry {
  plant: Plant;
  addedAt: string;
  note?: string;
  masteryLevel: number;
  imageUrl?: string;
  location?: { lat: number; lng: number };
}

export type Difficulty = 'easy' | 'medium' | 'hard';
