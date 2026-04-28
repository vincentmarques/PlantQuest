# 🌿 Plan — Application Angular de Reconnaissance Végétale

> **Convention de statut** : À la fin de chaque étape figure un bloc `STATUS`. Mettez-le à jour avant de transmettre ce fichier à une nouvelle IA, afin qu'elle sache exactement où reprendre le travail.
>
> **Valeurs possibles** : `[ ] À FAIRE` · `[~] EN COURS` · `[x] TERMINÉ`

---

## Vue d'ensemble du projet

**Nom** : PlantQuest  
**Stack** : Angular 17+ (standalone components, signals), SCSS + Design System maison, TypeScript strict  
**API externe** : [Plant.id API](https://plant.id/) (reconnaissance d'image) ou [iNaturalist API](https://api.inaturalist.org/v1/docs/) (base de données végétale)  
**Hébergement** : Netlify (CD automatique depuis GitHub)  
**Objectif** : Apprendre les plantes par la pratique — identification par photo, quiz interactifs, défis progressifs, suivi des connaissances.

> ⚠️ **Pas de TailwindCSS** — le projet utilise exclusivement un Design System maison en SCSS (classes sémantiques BEM, tokens CSS custom properties). Voir `design-system.md` pour la documentation complète.

---

## Architecture globale

```
src/
├── app/
│   ├── core/               # Services singleton, guards, interceptors
│   ├── features/
│   │   ├── identify/       # Identification par photo
│   │   ├── quiz/           # Mode quiz
│   │   ├── challenge/      # Défis chronométrés
│   │   ├── collection/     # Herbier personnel
│   │   └── dashboard/      # Tableau de bord & stats
│   ├── shared/             # Composants, pipes, directives réutilisables
│   └── layout/             # Shell, nav, footer
├── styles/                 # Design System SCSS
│   ├── _tokens.scss        # Variables CSS (couleurs, typographie, espacements)
│   ├── _reset.scss         # Reset CSS moderne
│   ├── _typography.scss    # Styles typographiques
│   ├── _layout.scss        # Grilles et conteneurs
│   ├── _components.scss    # Classes de composants réutilisables
│   ├── _utilities.scss     # Helpers ponctuels
│   └── main.scss           # Point d'entrée, importe tout
├── assets/
│   └── plants/             # Données locales JSON (fallback offline)
└── environments/
```

---

## Étapes de développement

---

### Étape 1 — Initialisation du projet & configuration

**Objectif** : Avoir un projet Angular propre, prêt pour le développement.

**Tâches** :
- [ ] Créer le projet : `ng new plantquest --standalone --routing --style=scss`
- [ ] Installer les dépendances : `@angular/pwa`, `rxjs`, `zod` (validation des réponses API)
- [ ] Configurer `tsconfig.json` en mode strict
- [ ] Mettre en place ESLint + Prettier
- [ ] Créer les environnements (`environment.ts`, `environment.prod.ts`) avec les clés API en placeholder
- [ ] Configurer `angular.json` (budgets, optimisation, lazy loading par défaut)
- [ ] Initialiser Git + `.gitignore` propre (exclure les clés API)
- [ ] Créer le fichier `netlify.toml` à la racine du projet (voir section Netlify ci-dessous)

**Livrables** : Projet qui compile sans erreur, `ng serve` fonctionnel.

```
STATUS: [x] TERMINÉ
Notes: Angular 19, Node 22. ESLint (angular-eslint), PWA, Zod installés. Environnements dev/prod créés. angular.json configuré (assets, _redirects, fileReplacements prod). netlify.toml créé. Git initialisé (branche master).
```

---

### Étape 2 — Design System SCSS maison

**Objectif** : Mettre en place l'intégralité du Design System avant tout développement de composants. C'est la fondation visuelle de toute l'application.

> 📄 Se référer à `design-system.md` pour la documentation complète du système.

**Tâches** :

#### 2a — Tokens & variables
- [ ] Créer `styles/_tokens.scss` avec toutes les CSS custom properties :
  - Palette de couleurs (verts naturels, terres, crème, états)
  - Échelle typographique (tailles, poids, hauteurs de ligne)
  - Échelle d'espacement (4px base → rem)
  - Rayons de bordure, ombres, transitions, z-index
- [ ] Déclarer les tokens sur `:root` pour accessibilité globale

#### 2b — Reset & base
- [ ] Créer `styles/_reset.scss` : reset CSS moderne (box-sizing, margin, padding, img)
- [ ] Créer `styles/_typography.scss` : styles de base pour h1–h6, p, a, strong, em, lists

#### 2c — Layout
- [ ] Créer `styles/_layout.scss` :
  - Classe `.container` (max-width centré, padding latéral responsive)
  - Grille `.grid` avec variantes (2-col, 3-col, auto-fill)
  - Flexbox helpers `.flex`, `.flex--column`, `.flex--center`, etc.
  - Classes de stack `.stack` (espacement vertical uniforme)

#### 2d — Composants CSS
- [ ] Créer `styles/_components.scss` avec les classes BEM :
  - `.btn` + modificateurs (`.btn--primary`, `.btn--ghost`, `.btn--danger`, `.btn--sm`, `.btn--lg`)
  - `.card` + modificateurs (`.card--elevated`, `.card--flat`, `.card--interactive`)
  - `.badge` + modificateurs (couleurs sémantiques)
  - `.input`, `.textarea`, `.select` (styles de formulaire cohérents)
  - `.loader` (spinner animé)
  - `.alert` + modificateurs (`.alert--success`, `.alert--error`, `.alert--info`)
  - `.progress-bar`
  - `.avatar`
  - `.tag`

#### 2e — Utilitaires
- [ ] Créer `styles/_utilities.scss` : classes d'aide ponctuelle
  - Visibilité (`.sr-only`, `.hidden`)
  - Texte (`.text-center`, `.text-muted`, `.text-small`)
  - Espacements (`.mt-*`, `.mb-*`, `.p-*` — limités aux valeurs du token)

#### 2f — Point d'entrée
- [ ] Créer `styles/main.scss` qui importe dans l'ordre : reset → tokens → typography → layout → components → utilities
- [ ] Référencer `main.scss` dans `angular.json` comme unique feuille de style globale
- [ ] Créer `design-system.md` (documentation — voir section dédiée)

**Livrables** : Design System compilable, aperçu visuel des composants CSS fonctionnel.

```
STATUS: [x] TERMINÉ
Notes: src/styles/ créé avec _tokens.scss (couleurs, typo, espacement, ombres, transitions, z-index, mixin respond-to), _reset.scss, _typography.scss, _layout.scss (.container, .grid, .stack, .flex), _components.scss (.btn, .card, .badge, .input/.textarea/.select, .alert, .progress-bar, .loader, .tag, .avatar), _utilities.scss. main.scss comme point d'entrée. Référencé dans angular.json. Build vérifié : 14kB CSS, 0 erreur.
```

---

### Étape 3 — Layout & Shell de l'application

**Objectif** : Shell de l'application, navigation, routing.

**Tâches** :
- [ ] Créer `LayoutComponent` (shell principal avec `<router-outlet>`)
- [ ] Créer `NavbarComponent` : logo, liens de navigation, indicateur de progression globale
  - Utiliser exclusivement les classes du Design System (`.btn`, `.nav`, etc.)
  - Pas de styles inline ni de classes utilitaires ad hoc
- [ ] Implémenter le routing principal avec lazy loading pour chaque feature
- [ ] Ajouter animations de transition entre routes (`@angular/animations`)
- [ ] Créer `shared/components/` Angular : `CardComponent`, `BadgeComponent`, `LoaderComponent`, `EmptyStateComponent`
  - Chaque composant Angular encapsule un élément HTML utilisant les classes CSS du Design System
- [ ] Responsive design : mobile-first (l'app doit être utilisable en extérieur sur téléphone)
  - Les breakpoints sont définis dans `_tokens.scss` et utilisés via `@mixin respond-to()`

**Livrables** : Shell navigable, toutes les routes répondent (même avec pages vides).

```
STATUS: [x] TERMINÉ
Notes: LayoutComponent + NavbarComponent (responsive mobile/desktop, sticky, score/niveau). Routing lazy loading avec withViewTransitions(). Shared: Card, Badge, Loader, EmptyState, NotificationToast. Feature stubs : dashboard, identify, quiz, challenge, collection, onboarding, 404. Build : 11 lazy chunks, 0 erreur.
```

---

### Étape 4 — Core Services & State Management

**Objectif** : Services fondamentaux partagés par toutes les features.

**Tâches** :
- [ ] `PlantApiService` : wrapper autour de Plant.id ou iNaturalist (identification + recherche)
  - Gestion des erreurs HTTP avec retry
  - Cache des résultats (éviter les appels redondants)
  - Schéma Zod pour valider les réponses
- [ ] `UserProgressService` : gestion de la progression (signals Angular)
  - Score global, plantes apprises, streak quotidien
  - Persistance dans `localStorage`
- [ ] `CollectionService` : herbier personnel de l'utilisateur
  - CRUD local (localStorage / IndexedDB)
- [ ] `StorageService` : abstraction générique du stockage local
- [ ] `NotificationService` : toasts / feedback utilisateur (succès, erreur, info)
  - Les toasts utilisent les classes `.alert` du Design System
- [ ] HTTP Interceptor : ajout automatique des headers API, gestion globale des erreurs

**Livrables** : Services testés unitairement (au moins les cas nominaux).

```
STATUS: [x] TERMINÉ
Notes: StorageService, UserProgressService (signals + streak + niveaux), CollectionService (CRUD localStorage), NotificationService (toasts auto-dismiss), PlantApiService (Plant.id + iNaturalist, cache, retry, Zod), apiInterceptor (erreurs HTTP globales). Modèles Zod : Plant, CollectionEntry, UserProgress, QuizSession, Challenge.
```

---

### Étape 5 — Feature : Identification par photo

**Objectif** : L'utilisateur prend ou uploade une photo, l'app identifie la plante.

**Tâches** :
- [ ] `IdentifyComponent` : page principale avec zone de drop / bouton caméra
- [ ] Composant `ImageUploaderComponent` :
  - Drag & drop
  - Capture caméra (API `getUserMedia`)
  - Preview + recadrage basique
  - Compression avant envoi (< 1 Mo)
- [ ] Composant `IdentificationResultComponent` :
  - Nom scientifique + nom commun
  - Score de confiance (`.progress-bar` du Design System)
  - Photo de référence
  - Bouton "Ajouter à ma collection" (`.btn--primary`)
  - Bouton "En savoir plus" (`.btn--ghost`)
- [ ] `PlantDetailComponent` : fiche complète (description, habitat, toxicité, floraison, famille)
- [ ] Gestion des états : loading (`.loader`), erreur (`.alert--error`), résultat vide
- [ ] Animation de "scan" pendant l'identification (CSS keyframes dans le composant SCSS)

**Livrables** : Identification fonctionnelle end-to-end avec une vraie photo.

```
STATUS: [x] TERMINÉ
Notes: ImageUploaderComponent (drag&drop, caméra getUserMedia, validation). IdentificationResultComponent (progress-bar confiance, badges, plantes similaires). PlantDetailComponent (fiche complète). IdentifyComponent : machine à états, animation scan CSS (ligne lumineuse animée sur l'image). Mode démo automatique si pas de clé API. image.utils.ts compression canvas. plants.json 20 plantes fallback.
```

---

### Étape 6 — Feature : Quiz

**Objectif** : Apprendre les plantes par des quiz variés et progressifs.

**Tâches** :
- [ ] Définir les types de questions :
  1. **Quelle est cette plante ?** (photo → 4 noms au choix)
  2. **Quelle photo correspond à... ?** (nom → 4 photos au choix)
  3. **Vrai/Faux** sur une caractéristique (comestible, toxique, etc.)
  4. **Famille botanique** : associer la plante à sa famille
- [ ] `QuizService` : génération des questions (pioche dans la collection + plantes aléatoires)
- [ ] `QuizComponent` : orchestration du quiz (état machine simple)
- [ ] `QuestionComponent` : affichage d'une question + réponses
- [ ] `QuizResultComponent` : score final, récap des erreurs, plantes à retravailler
- [ ] Niveaux de difficulté : Débutant / Intermédiaire / Expert
- [ ] Feedback immédiat : bonne réponse / mauvaise réponse via classes CSS (`.card--success`, `.card--error`)
- [ ] Mise à jour automatique de `UserProgressService` après chaque quiz

**Livrables** : Un quiz de 10 questions jouable de bout en bout.

```
STATUS: [x] TERMINÉ
Notes: QuizService (4 types : description, vrai/faux, famille, habitat — shuffle Fisher-Yates). QuizSetupComponent (3 niveaux). QuestionComponent (feedback card--correct/wrong/missed, indice contextuel, barre progression). QuizResultComponent (étoiles, score, plantes à retravailler). QuizComponent machine à états avec délai 1.8s. +5pts/bonne réponse, badge quiz-perfect.
```

---

### Étape 7 — Feature : Défis

**Objectif** : Gamifier l'apprentissage avec des challenges variés.

**Tâches** :
- [ ] `ChallengeService` : définition et évaluation des défis
- [ ] Types de défis :
  1. **Sprint** : identifier 5 plantes en moins de 60 secondes
  2. **Série parfaite** : X bonnes réponses consécutives sans erreur
  3. **Thématique** : toutes les plantes médicinales, toutes les plantes toxiques…
  4. **Défi quotidien** : défi unique qui change chaque jour (seed basée sur la date)
- [ ] `ChallengeListComponent` : cartes de défis avec statut (verrouillé / disponible / complété)
- [ ] `ChallengeSessionComponent` : déroulement du défi (timer, compteur, progression)
- [ ] Récompenses : badges débloqués, points bonus, animation de victoire
- [ ] `BadgeService` : logique de déverrouillage des badges

**Livrables** : Au moins 2 types de défis jouables, système de badges fonctionnel.

```
STATUS: [ ] À FAIRE
Notes: 
```

---

### Étape 8 — Feature : Collection (Herbier personnel)

**Objectif** : L'utilisateur constitue son herbier numérique.

**Tâches** :
- [ ] `CollectionComponent` : galerie des plantes sauvegardées (grille `.grid` + liste)
- [ ] `PlantCardComponent` : vignette avec photo, nom, date d'ajout, niveau de maîtrise
- [ ] Filtres & recherche : par famille, par date, par niveau de maîtrise
- [ ] `PlantNoteComponent` : l'utilisateur peut ajouter une note personnelle à chaque plante
- [ ] Indicateur de maîtrise par plante (basé sur les performances en quiz)
- [ ] Export de la collection en PDF (bonus)
- [ ] Vue "Carte" : afficher les lieux d'observation sur une carte (si géolocalisation accordée)

**Livrables** : Collection persistante, filtrable, avec notes.

```
STATUS: [ ] À FAIRE
Notes: 
```

---

### Étape 9 — Feature : Dashboard & Progression

**Objectif** : Visualiser ses progrès et rester motivé.

**Tâches** :
- [ ] `DashboardComponent` : page d'accueil principale après onboarding
- [ ] Widgets (composants Angular utilisant les classes `.card` du Design System) :
  - Streak quotidien (calendrier des jours actifs)
  - Nombre de plantes apprises / objectif
  - Derniers badges débloqués
  - Prochain défi recommandé
  - Plantes à réviser (spaced repetition simplifié)
- [ ] `StatsComponent` : graphiques de progression (Chart.js ou D3 léger)
  - Plantes apprises par semaine
  - Taux de réussite par catégorie
- [ ] Système de niveaux utilisateur (Semence → Pousse → Arbuste → Arbre → Forêt)
- [ ] Messages de motivation contextuels

**Livrables** : Dashboard avec données réelles issues des services.

```
STATUS: [ ] À FAIRE
Notes: 
```

---

### Étape 10 — Onboarding & UX Finale

**Objectif** : Première expérience utilisateur fluide et engageante.

**Tâches** :
- [ ] `OnboardingComponent` : wizard en 3 étapes (présentation, choix du niveau, premier quiz de calibration)
- [ ] Guard `hasCompletedOnboarding` : redirige vers l'onboarding si jamais fait
- [ ] Mode hors-ligne (PWA) : Service Worker, cache des ressources statiques et fiches plantes
- [ ] `manifest.webmanifest` : icône, thème couleur, splash screen
- [ ] Accessibilité : audit ARIA, contraste AA minimum (vérifié sur les tokens de couleur), navigation clavier
- [ ] Optimisation performances : lazy loading des images, virtual scroll pour les grandes listes
- [ ] Écrans d'erreur globaux (404, erreur réseau, erreur API)

**Livrables** : App installable sur mobile, score Lighthouse ≥ 85.

```
STATUS: [ ] À FAIRE
Notes: 
```

---

### Étape 11 — Tests & Qualité

**Objectif** : Couverture de test suffisante pour une app stable.

**Tâches** :
- [ ] Tests unitaires (Jest ou Karma) :
  - `PlantApiService` (mock HTTP)
  - `UserProgressService`
  - `QuizService` (génération de questions)
  - `ChallengeService`
- [ ] Tests de composants (Angular Testing Library) :
  - `QuestionComponent`
  - `IdentificationResultComponent`
- [ ] Tests e2e (Playwright ou Cypress) :
  - Parcours : upload photo → identification → ajout collection
  - Parcours : quiz complet → mise à jour du score
- [ ] Audit de sécurité : pas de clés API exposées côté client, sanitisation des inputs
- [ ] Revue de code finale : supprimer les `console.log`, les `TODO`, les imports inutilisés

**Livrables** : Couverture unitaire ≥ 70%, 2 parcours e2e verts.

```
STATUS: [ ] À FAIRE
Notes: 
```

---

### Étape 12 — Déploiement Netlify

**Objectif** : Application disponible en ligne via Netlify, avec CI/CD automatique.

> 📄 Les fichiers de configuration Netlify sont documentés dans `netlify-config.md`.

**Tâches** :

#### 12a — Préparation build
- [ ] `ng build --configuration production` sans erreur ni warning critique
- [ ] Vérifier que `outputPath` dans `angular.json` pointe bien vers `dist/plantquest/browser`
- [ ] S'assurer que `_redirects` est présent dans `src/` (copié vers `dist/` au build) pour le routing SPA

#### 12b — Configuration Netlify
- [ ] `netlify.toml` à la racine (voir `netlify-config.md` pour le contenu complet) :
  - Commande de build : `ng build --configuration production`
  - Dossier de publication : `dist/plantquest/browser`
  - Redirections SPA : `/* → /index.html 200`
  - Headers de sécurité : CSP, X-Frame-Options, X-Content-Type-Options
- [ ] Fichier `_redirects` dans `src/` comme fallback

#### 12c — Variables d'environnement
- [ ] Dans le dashboard Netlify, ajouter les variables secrètes :
  - `PLANT_ID_API_KEY`
  - `INATURALIST_TOKEN` (si utilisé)
- [ ] ⚠️ Ne jamais committer les clés API — utiliser uniquement les env vars Netlify ou un proxy backend

#### 12d — Connexion GitHub → Netlify
- [ ] Connecter le repo GitHub au site Netlify
- [ ] Configurer le déclenchement automatique sur push vers `main`
- [ ] Configurer les Deploy Previews sur les Pull Requests

#### 12e — Vérification post-déploiement
- [ ] Tester le routing SPA (refresh sur une route profonde ne doit pas retourner 404)
- [ ] Vérifier les headers de sécurité avec [securityheaders.com](https://securityheaders.com)
- [ ] Tester l'app déployée sur mobile réel
- [ ] Vérifier que le PWA Service Worker fonctionne en production (HTTPS requis)

**Livrables** : URL Netlify publique fonctionnelle, déploiement automatique sur push `main`.

```
STATUS: [ ] À FAIRE
Notes: 
```

---

## Données de référence (fallback offline)

Créer un fichier `src/assets/plants/plants.json` avec au minimum **50 plantes** structurées ainsi :

```json
{
  "id": "taraxacum-officinale",
  "commonName": "Pissenlit",
  "scientificName": "Taraxacum officinale",
  "family": "Asteraceae",
  "description": "...",
  "habitat": ["prairies", "bords de chemins"],
  "edible": true,
  "toxic": false,
  "floweringSeason": ["mars", "mai"],
  "images": ["pissenlit-1.jpg"],
  "difficulty": "easy",
  "tags": ["comestible", "médicinal", "commun"]
}
```

```
STATUS: [ ] À FAIRE
Notes: 
```

---

## Conventions à respecter tout au long du projet

| Sujet | Convention |
|---|---|
| Composants | Standalone, `OnPush` change detection par défaut |
| State | Signals Angular (`signal`, `computed`, `effect`) — pas de NgRx |
| Styles | **SCSS + Design System maison uniquement** — pas de TailwindCSS, pas de styles inline |
| Méthodologie CSS | BEM pour les blocs/éléments/modificateurs dans `_components.scss` |
| Styles de composant | Le SCSS d'un composant Angular n'utilise que les tokens (`var(--color-*)`) et les mixins SCSS partagés. Pas de valeurs "magiques" codées en dur |
| Nommage | Features : `feature-name.component.ts`, services : `feature-name.service.ts` |
| API calls | Toujours via un service dédié, jamais directement dans un composant |
| Erreurs | Toujours catchées et remontées via `NotificationService` |
| Commits | Conventional Commits : `feat:`, `fix:`, `chore:`, `test:` |

---

## Résumé des statuts (à mettre à jour à chaque session)

| Étape | Titre | Statut |
|---|---|---|
| 1 | Initialisation & configuration | [x] |
| 2 | Design System SCSS maison | [x] |
| 3 | Layout & Shell | [x] |
| 4 | Core Services | [x] |
| 5 | Identification par photo | [x] |
| 6 | Quiz | [x] |
| 7 | Défis | [ ] |
| 8 | Collection / Herbier | [ ] |
| 9 | Dashboard & Progression | [ ] |
| 10 | Onboarding & UX Finale | [ ] |
| 11 | Tests & Qualité | [ ] |
| 12 | Déploiement Netlify | [ ] |
| — | Données JSON de référence | [ ] |

---

*Dernière mise à jour : 2026-04-28 (session 2) | IA ayant travaillé en dernier : Claude Sonnet 4.6*
