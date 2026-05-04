export type PlantCategory = 'arbres' | 'fleurs-herbes' | 'potager';

export const PLANT_CATEGORY_MAP: Record<string, PlantCategory> = {
  'sambucus-nigra':       'arbres',
  'corylus-avellana':     'arbres',
  'quercus-robur':        'arbres',
  'rubus-fruticosus':     'arbres',
  'rosa-canina':          'arbres',
  'hedera-helix':         'arbres',
  'fragaria-vesca':       'potager',
  'mentha-aquatica':      'potager',
  'urtica-dioica':        'potager',
  'taraxacum-officinale': 'potager',
  'oxalis-acetosella':    'potager',
  'bellis-perennis':      'fleurs-herbes',
  'plantago-major':       'fleurs-herbes',
  'atropa-belladonna':    'fleurs-herbes',
  'digitalis-purpurea':   'fleurs-herbes',
  'convallaria-majalis':  'fleurs-herbes',
  'achillea-millefolium': 'fleurs-herbes',
  'hypericum-perforatum': 'fleurs-herbes',
  'primula-veris':        'fleurs-herbes',
  'conium-maculatum':     'fleurs-herbes',
};

export function getPlantCategory(plantId: string): PlantCategory {
  return PLANT_CATEGORY_MAP[plantId] ?? 'fleurs-herbes';
}

export interface CategoryConfig {
  key: PlantCategory;
  label: string;
  icon: string;
  sub: string;
}

export const CATEGORIES: CategoryConfig[] = [
  { key: 'arbres',       label: 'Arbres',          icon: '🌳', sub: 'Chênes, noisetiers…' },
  { key: 'fleurs-herbes', label: 'Fleurs & Herbes', icon: '🌸', sub: 'Plantes sauvages'     },
  { key: 'potager',      label: 'Potager',          icon: '🥕', sub: 'Comestibles & jardin' },
];
