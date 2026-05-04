import { Injectable } from '@angular/core';
import { Plant } from '../models/plant.model';
import { PlantCategory, PLANT_CATEGORY_MAP, getPlantCategory } from '../models/plant-category.model';
import { QuizQuestion, QuizOption, QuizSession, QuizResult, Difficulty } from '../models/quiz.model';
import PLANTS_DATA from '../../../assets/plants/plants.json';

const QUESTION_COUNTS: Record<Difficulty, number> = {
  beginner:     5,
  intermediate: 10,
  expert:       15,
};

const DIFFICULTY_PLANT_MAP: Record<Difficulty, string[]> = {
  beginner:     ['easy'],
  intermediate: ['easy', 'medium'],
  expert:       ['easy', 'medium', 'hard'],
};

@Injectable({ providedIn: 'root' })
export class QuizService {
  private readonly plants: Plant[] = PLANTS_DATA as Plant[];

  generateSession(difficulty: Difficulty, category?: PlantCategory): QuizSession {
    const allowedDifficulties = DIFFICULTY_PLANT_MAP[difficulty];
    let pool = this.plants.filter(p => allowedDifficulties.includes(p.difficulty));

    if (category) {
      const filtered = pool.filter(p => getPlantCategory(p.id) === category);
      // Fall back to full pool if not enough plants in category
      pool = filtered.length >= 3 ? filtered : pool;
    }

    const count = Math.min(QUESTION_COUNTS[difficulty], pool.length);
    const selected = this.shuffle([...pool]).slice(0, count);
    const questions = selected.map(plant => this.pickQuestion(plant));

    return {
      id: crypto.randomUUID(),
      difficulty,
      questions,
      answers: {},
      startedAt: new Date().toISOString(),
    };
  }

  scoreSession(session: QuizSession): QuizResult {
    const total = session.questions.length;
    const correct = session.questions.filter(
      q => session.answers[q.id] === q.correctOptionId
    ).length;
    const wrongPlantIds = session.questions
      .filter(q => session.answers[q.id] !== q.correctOptionId)
      .map(q => q.plantId);

    return {
      session,
      score: correct,
      total,
      percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
      wrongPlantIds,
    };
  }

  // ----------------------------------------------------------------
  // Question generators
  // ----------------------------------------------------------------

  private pickQuestion(plant: Plant): QuizQuestion {
    const generators = [
      this.buildDescriptionQuestion.bind(this),
      this.buildTrueFalseEdible.bind(this),
      this.buildFamilyQuestion.bind(this),
      this.buildHabitatQuestion.bind(this),
    ];
    const idx = plant.id.length % generators.length;
    return generators[idx](plant);
  }

  private buildDescriptionQuestion(plant: Plant): QuizQuestion {
    const distractors = this.pickDistractors(plant, 3);
    const options = this.shuffle<QuizOption>([
      { id: plant.id, label: plant.commonName },
      ...distractors.map(d => ({ id: d.id, label: d.commonName })),
    ]);

    return {
      id: crypto.randomUUID(),
      type: 'photo-to-name',
      plantId: plant.id,
      question: 'Quelle plante correspond à cette description ?',
      imageUrl: undefined,
      explanation: `C'est le ${plant.commonName} (${plant.scientificName}), de la famille des ${plant.family}.`,
      options,
      correctOptionId: plant.id,
    };
  }

  private buildTrueFalseEdible(plant: Plant): QuizQuestion {
    const claim = plant.edible;
    const claimText = claim ? 'comestible' : 'non comestible';
    const isTrue = Math.random() < 0.5;
    const statementIsEdible = isTrue ? claim : !claim;
    const statementText = statementIsEdible ? 'comestible' : 'non comestible';
    const correctId = isTrue ? 'true' : 'false';

    return {
      id: crypto.randomUUID(),
      type: 'true-false',
      plantId: plant.id,
      question: `Le ${plant.commonName} est ${statementText}. Vrai ou Faux ?`,
      explanation: `Le ${plant.commonName} est ${claimText}.${plant.toxic ? ' Attention, cette plante est également toxique !' : ''}`,
      options: [
        { id: 'true',  label: '✓ Vrai' },
        { id: 'false', label: '✕ Faux' },
      ],
      correctOptionId: correctId,
    };
  }

  private buildFamilyQuestion(plant: Plant): QuizQuestion {
    const wrongFamilies = this.plants
      .filter(p => p.family !== plant.family && p.family)
      .map(p => p.family);
    const uniqueWrong = [...new Set(wrongFamilies)];
    const distractorFamilies = this.shuffle(uniqueWrong).slice(0, 3);

    const options = this.shuffle<QuizOption>([
      { id: plant.family, label: plant.family },
      ...distractorFamilies.map(f => ({ id: f, label: f })),
    ]);

    return {
      id: crypto.randomUUID(),
      type: 'family',
      plantId: plant.id,
      question: `À quelle famille botanique appartient le ${plant.commonName} ?`,
      explanation: `Le ${plant.commonName} (${plant.scientificName}) appartient à la famille des ${plant.family}.`,
      options,
      correctOptionId: plant.family,
    };
  }

  private buildHabitatQuestion(plant: Plant): QuizQuestion {
    if (!plant.habitat.length) return this.buildDescriptionQuestion(plant);

    const correctHabitat = plant.habitat[0];
    const wrongHabitats = this.plants
      .filter(p => p.id !== plant.id)
      .flatMap(p => p.habitat)
      .filter(h => !plant.habitat.includes(h));
    const unique = [...new Set(wrongHabitats)];
    const distractors = this.shuffle(unique).slice(0, 3);

    const options = this.shuffle<QuizOption>([
      { id: correctHabitat, label: correctHabitat },
      ...distractors.map(h => ({ id: h, label: h })),
    ]);

    return {
      id: crypto.randomUUID(),
      type: 'photo-to-name',
      plantId: plant.id,
      question: `Dans quel habitat trouve-t-on le ${plant.commonName} ?`,
      explanation: `Le ${plant.commonName} vit en : ${plant.habitat.join(', ')}.`,
      options,
      correctOptionId: correctHabitat,
    };
  }

  // ----------------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------------

  private pickDistractors(plant: Plant, count: number): Plant[] {
    return this.shuffle(this.plants.filter(p => p.id !== plant.id)).slice(0, count);
  }

  private shuffle<T>(arr: T[]): T[] {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  getPlantById(id: string): Plant | undefined {
    return this.plants.find(p => p.id === id);
  }
}
