import { Injectable, inject } from '@angular/core';
import { Challenge, ChallengeSession, ChallengeStatus } from '../models/challenge.model';
import { QuizQuestion } from '../models/quiz.model';
import { StorageService } from './storage.service';
import { QuizService } from './quiz.service';
import PLANTS_DATA from '../../../assets/plants/plants.json';
import { Plant } from '../models/plant.model';

const STORAGE_KEY = 'pq_challenges';

export const CHALLENGE_CATALOG: Challenge[] = [
  {
    id: 'daily',
    type: 'daily',
    title: 'Défi du Jour',
    description: 'Un défi unique qui change chaque jour à minuit.',
    icon: '📅',
    target: 7,
    unlocksAt: 0,
  },
  {
    id: 'sprint-5',
    type: 'sprint',
    title: 'Sprint Botanique',
    description: 'Identifiez 5 plantes en moins de 60 secondes !',
    icon: '⚡',
    target: 5,
    timeLimit: 60,
    unlocksAt: 0,
  },
  {
    id: 'sprint-10',
    type: 'sprint',
    title: 'Sprint Expert',
    description: '10 plantes en 90 secondes — le chrono tourne !',
    icon: '🔥',
    target: 10,
    timeLimit: 90,
    unlocksAt: 5,
  },
  {
    id: 'streak-5',
    type: 'streak',
    title: 'Série de 5',
    description: '5 bonnes réponses consécutives, sans la moindre erreur.',
    icon: '🎯',
    target: 5,
    unlocksAt: 0,
  },
  {
    id: 'streak-10',
    type: 'streak',
    title: 'Série Parfaite',
    description: '10 bonnes réponses d\'affilée. Concentration maximale.',
    icon: '💎',
    target: 10,
    unlocksAt: 10,
  },
  {
    id: 'thematic-edible',
    type: 'thematic',
    title: 'Plantes Comestibles',
    description: 'Reconnaissez toutes les plantes qui se mangent.',
    icon: '🥗',
    target: 8,
    theme: 'edible',
    unlocksAt: 3,
  },
  {
    id: 'thematic-toxic',
    type: 'thematic',
    title: 'Plantes Toxiques',
    description: 'Identifiez les espèces dangereuses — ne les confondez pas !',
    icon: '☠️',
    target: 5,
    theme: 'toxic',
    unlocksAt: 5,
  },
];

interface ChallengeProgress {
  completedIds: string[];
  dailyCompletedDate: string | null;
  bestTimes: Record<string, number>;
}

@Injectable({ providedIn: 'root' })
export class ChallengeService {
  private readonly storage = inject(StorageService);
  private readonly quizService = inject(QuizService);
  private readonly allPlants: Plant[] = PLANTS_DATA as Plant[];

  private progress(): ChallengeProgress {
    return this.storage.get<ChallengeProgress>(STORAGE_KEY) ?? {
      completedIds: [],
      dailyCompletedDate: null,
      bestTimes: {},
    };
  }

  private saveProgress(p: ChallengeProgress): void {
    this.storage.set(STORAGE_KEY, p);
  }

  getStatus(challenge: Challenge, plantsLearnedCount: number): ChallengeStatus {
    if (plantsLearnedCount < (challenge.unlocksAt ?? 0)) return 'locked';

    const prog = this.progress();
    if (challenge.type === 'daily') {
      const today = new Date().toDateString();
      return prog.dailyCompletedDate === today ? 'completed' : 'available';
    }
    return prog.completedIds.includes(challenge.id) ? 'completed' : 'available';
  }

  generateQuestions(challenge: Challenge): QuizQuestion[] {
    let pool = this.allPlants;

    if (challenge.type === 'thematic') {
      pool = challenge.theme === 'edible'
        ? this.allPlants.filter(p => p.edible)
        : this.allPlants.filter(p => p.toxic);
    }

    if (challenge.type === 'daily') {
      // Seed déterministe par date : même défi pour tout le monde aujourd'hui
      const seed = this.dailySeed();
      pool = this.seededShuffle([...this.allPlants], seed);
    } else {
      pool = this.shuffle([...pool]);
    }

    const count = Math.min(challenge.target, pool.length);
    const selected = pool.slice(0, count);

    return selected.map(plant => {
      const session = this.quizService.generateSession('intermediate');
      // Find a question for this plant, or generate a description one
      return session.questions.find(q => q.plantId === plant.id)
        ?? this.buildFallbackQuestion(plant);
    });
  }

  recordCompletion(session: ChallengeSession): void {
    const prog = this.progress();

    if (session.challengeId === 'daily') {
      prog.dailyCompletedDate = new Date().toDateString();
    } else {
      if (!prog.completedIds.includes(session.challengeId)) {
        prog.completedIds.push(session.challengeId);
      }
    }

    if (session.challengeId.startsWith('sprint') && session.completedAt) {
      const elapsed =
        new Date(session.completedAt).getTime() -
        new Date(session.challengeId).getTime();
      const current = prog.bestTimes[session.challengeId];
      if (!current || elapsed < current) {
        prog.bestTimes[session.challengeId] = elapsed;
      }
    }

    this.saveProgress(prog);
  }

  get dailyChallenge(): Challenge {
    return CHALLENGE_CATALOG.find(c => c.type === 'daily')!;
  }

  private dailySeed(): number {
    const date = new Date().toDateString();
    return date.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  }

  private seededShuffle<T>(arr: T[], seed: number): T[] {
    let s = seed;
    for (let i = arr.length - 1; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280;
      const j = Math.floor((s / 233280) * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  private shuffle<T>(arr: T[]): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  private buildFallbackQuestion(plant: Plant): import('../models/quiz.model').QuizQuestion {
    const distractors = this.shuffle(this.allPlants.filter(p => p.id !== plant.id)).slice(0, 3);
    return {
      id: crypto.randomUUID(),
      type: 'photo-to-name',
      plantId: plant.id,
      question: 'Quelle plante correspond à cette description ?',
      explanation: `C'est le ${plant.commonName} (${plant.scientificName}).`,
      options: this.shuffle([
        { id: plant.id, label: plant.commonName },
        ...distractors.map(d => ({ id: d.id, label: d.commonName })),
      ]),
      correctOptionId: plant.id,
    };
  }
}
