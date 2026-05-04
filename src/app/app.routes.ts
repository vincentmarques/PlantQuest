import { Routes } from '@angular/router';
import { onboardingGuard } from './core/guards/onboarding.guard';

export const routes: Routes = [
  // Onboarding — sans shell, accessible sans guard
  {
    path: 'onboarding',
    loadComponent: () =>
      import('./features/onboarding/onboarding.component').then(m => m.OnboardingComponent),
    title: 'Bienvenue — PlantQuest',
  },
  // Shell principal avec lazy loading par feature
  {
    path: '',
    loadComponent: () =>
      import('./layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [onboardingGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Accueil — PlantQuest',
      },
      {
        path: 'identify',
        loadComponent: () =>
          import('./features/identify/identify.component').then(m => m.IdentifyComponent),
        title: 'Identifier une plante — PlantQuest',
      },
      {
        path: 'quiz',
        loadComponent: () =>
          import('./features/quiz/quiz.component').then(m => m.QuizComponent),
        title: 'Quiz — PlantQuest',
      },
      {
        path: 'challenge',
        loadComponent: () =>
          import('./features/challenge/challenge.component').then(m => m.ChallengeComponent),
        title: 'Défis — PlantQuest',
      },
      {
        path: 'collection',
        loadComponent: () =>
          import('./features/collection/collection.component').then(m => m.CollectionComponent),
        title: 'Mon Herbier — PlantQuest',
      },
    ],
  },
  // 404
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Page introuvable — PlantQuest',
  },
];
