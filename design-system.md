# 🎨 Design System — PlantQuest

Documentation du système de design maison de l'application PlantQuest. Toute l'interface est construite à partir de ces fondations SCSS. **Aucune librairie CSS externe n'est utilisée.**

---

## Philosophie

- **Tokens d'abord** : chaque valeur visuelle (couleur, taille, espace) est une variable CSS définie dans `_tokens.scss`. On ne code jamais de valeur en dur dans un composant.
- **BEM pour les composants** : les classes de composants suivent la convention Block__Element--Modifier.
- **Mobile-first** : tous les styles de base ciblent les petits écrans, les breakpoints élargissent progressivement.
- **Un seul point d'entrée** : `styles/main.scss` importe tout dans l'ordre correct.

---

## Structure des fichiers

```
styles/
├── _tokens.scss        # Variables CSS (custom properties sur :root)
├── _reset.scss         # Reset CSS moderne
├── _typography.scss    # Styles de base des éléments texte
├── _layout.scss        # Conteneurs, grilles, flexbox helpers
├── _components.scss    # Classes de composants réutilisables (BEM)
├── _utilities.scss     # Helpers ponctuels
└── main.scss           # Point d'entrée — importe tout
```

---

## 1. Tokens (`_tokens.scss`)

Toutes les valeurs sont déclarées en CSS custom properties sur `:root`.

### 1.1 Couleurs

```scss
:root {
  // Palette principale — verts botaniques
  --color-green-100: #f0f7ee;
  --color-green-200: #d4ebcc;
  --color-green-300: #a8d4a0;
  --color-green-400: #6db96a;
  --color-green-500: #3d8b37;   // Couleur principale
  --color-green-600: #2d6b28;
  --color-green-700: #1e4a1a;

  // Palette secondaire — terres & ocres
  --color-earth-100: #fdf6ec;
  --color-earth-200: #f5e6c8;
  --color-earth-300: #e8c98a;
  --color-earth-400: #c9973e;
  --color-earth-500: #a0722a;   // Accent chaud

  // Neutres
  --color-cream:     #faf8f3;
  --color-sand:      #e8e2d4;
  --color-stone-300: #b5ae9f;
  --color-stone-500: #7a7267;
  --color-stone-700: #3d3830;
  --color-ink:       #1a1714;

  // Sémantiques
  --color-success:   #3d8b37;
  --color-warning:   #c9973e;
  --color-error:     #c0392b;
  --color-info:      #2980b9;

  // Surfaces
  --color-bg:        var(--color-cream);
  --color-surface:   #ffffff;
  --color-border:    var(--color-sand);

  // Texte
  --color-text:      var(--color-ink);
  --color-text-muted: var(--color-stone-500);
  --color-text-inverse: #ffffff;
}
```

### 1.2 Typographie

```scss
:root {
  // Familles
  --font-display: 'Playfair Display', Georgia, serif;   // Titres
  --font-body:    'Source Sans 3', system-ui, sans-serif; // Corps
  --font-mono:    'JetBrains Mono', monospace;

  // Échelle (modular scale ×1.25)
  --text-xs:   0.64rem;   //  ~10px
  --text-sm:   0.8rem;    //  ~13px
  --text-base: 1rem;      //  16px
  --text-lg:   1.25rem;   //  20px
  --text-xl:   1.563rem;  //  25px
  --text-2xl:  1.953rem;  //  31px
  --text-3xl:  2.441rem;  //  39px
  --text-4xl:  3.052rem;  //  49px

  // Poids
  --weight-normal:   400;
  --weight-medium:   500;
  --weight-semibold: 600;
  --weight-bold:     700;

  // Hauteurs de ligne
  --leading-tight:  1.2;
  --leading-snug:   1.4;
  --leading-normal: 1.6;
  --leading-loose:  1.8;
}
```

### 1.3 Espacements

Échelle basée sur 4px.

```scss
:root {
  --space-1:  0.25rem;   //  4px
  --space-2:  0.5rem;    //  8px
  --space-3:  0.75rem;   // 12px
  --space-4:  1rem;      // 16px
  --space-5:  1.25rem;   // 20px
  --space-6:  1.5rem;    // 24px
  --space-8:  2rem;      // 32px
  --space-10: 2.5rem;    // 40px
  --space-12: 3rem;      // 48px
  --space-16: 4rem;      // 64px
  --space-20: 5rem;      // 80px
  --space-24: 6rem;      // 96px
}
```

### 1.4 Bordures & rayons

```scss
:root {
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   16px;
  --radius-xl:   24px;
  --radius-full: 9999px;

  --border-width: 1px;
  --border-color: var(--color-border);
}
```

### 1.5 Ombres

```scss
:root {
  --shadow-sm:  0 1px 3px rgba(26, 23, 20, 0.08);
  --shadow-md:  0 4px 12px rgba(26, 23, 20, 0.12);
  --shadow-lg:  0 8px 32px rgba(26, 23, 20, 0.16);
  --shadow-xl:  0 16px 48px rgba(26, 23, 20, 0.20);
}
```

### 1.6 Transitions

```scss
:root {
  --transition-fast:   150ms ease;
  --transition-base:   250ms ease;
  --transition-slow:   400ms ease;
  --transition-spring: 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### 1.7 Breakpoints (utilisés via mixin SCSS)

```scss
// Dans _tokens.scss — valeurs de référence pour les mixins
$bp-sm:  480px;
$bp-md:  768px;
$bp-lg:  1024px;
$bp-xl:  1280px;
```

Mixin d'utilisation dans `_layout.scss` :

```scss
@mixin respond-to($bp) {
  @if $bp == 'sm'  { @media (min-width: 480px)  { @content; } }
  @if $bp == 'md'  { @media (min-width: 768px)  { @content; } }
  @if $bp == 'lg'  { @media (min-width: 1024px) { @content; } }
  @if $bp == 'xl'  { @media (min-width: 1280px) { @content; } }
}
```

### 1.8 Z-index

```scss
:root {
  --z-below:   -1;
  --z-base:     0;
  --z-raised:  10;
  --z-dropdown:100;
  --z-sticky:  200;
  --z-modal:   300;
  --z-toast:   400;
}
```

---

## 2. Reset (`_reset.scss`)

Reset moderne minimal — pas de sur-normalisation, juste ce qui est nécessaire :

- `box-sizing: border-box` sur tout
- Suppression des marges et paddings par défaut
- `img`, `svg`, `video` : `display: block; max-width: 100%`
- Héritage de `font` sur les éléments de formulaire
- Suppression des styles de liste sur `ul[role="list"]`

---

## 3. Typographie (`_typography.scss`)

Styles appliqués directement aux éléments HTML sémantiques :

| Élément | Font | Taille | Poids | Hauteur de ligne |
|---------|------|--------|-------|-----------------|
| `h1` | display | `--text-4xl` | bold | tight |
| `h2` | display | `--text-3xl` | bold | tight |
| `h3` | display | `--text-2xl` | semibold | snug |
| `h4` | body | `--text-xl` | semibold | snug |
| `h5` | body | `--text-lg` | medium | normal |
| `h6` | body | `--text-base` | medium | normal |
| `p` | body | `--text-base` | normal | normal |
| `small` | body | `--text-sm` | normal | normal |
| `a` | — | hérite | — | — |

---

## 4. Layout (`_layout.scss`)

### 4.1 Conteneur

```scss
.container {
  width: 100%;
  max-width: 1200px;
  margin-inline: auto;
  padding-inline: var(--space-4);

  @include respond-to('md') { padding-inline: var(--space-6); }
  @include respond-to('lg') { padding-inline: var(--space-8); }
}

.container--narrow  { max-width: 720px; }
.container--wide    { max-width: 1440px; }
```

### 4.2 Grille

```scss
.grid {
  display: grid;
  gap: var(--space-6);

  &--2  { grid-template-columns: repeat(2, 1fr); }
  &--3  { grid-template-columns: repeat(3, 1fr); }
  &--4  { grid-template-columns: repeat(4, 1fr); }
  &--auto { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); }
}
```

Sur mobile (< md), toutes les grilles passent en 1 colonne.

### 4.3 Stack (espacement vertical uniforme)

```scss
.stack > * + * { margin-top: var(--stack-gap, var(--space-4)); }

.stack--sm  { --stack-gap: var(--space-2); }
.stack--lg  { --stack-gap: var(--space-8); }
```

### 4.4 Flex helpers

```scss
.flex           { display: flex; }
.flex--center   { align-items: center; justify-content: center; }
.flex--between  { align-items: center; justify-content: space-between; }
.flex--column   { flex-direction: column; }
.flex--wrap     { flex-wrap: wrap; }
.flex--gap-sm   { gap: var(--space-2); }
.flex--gap-md   { gap: var(--space-4); }
.flex--gap-lg   { gap: var(--space-6); }
```

---

## 5. Composants (`_components.scss`)

### 5.1 Boutons — `.btn`

```html
<button class="btn btn--primary">Identifier</button>
<button class="btn btn--ghost">Annuler</button>
<a class="btn btn--primary btn--lg" href="...">Commencer</a>
```

| Modificateur | Usage |
|---|---|
| `.btn--primary` | Action principale (fond vert) |
| `.btn--secondary` | Action secondaire (fond earth) |
| `.btn--ghost` | Action tertiaire (transparent + bordure) |
| `.btn--danger` | Destruction / suppression |
| `.btn--sm` | Petit bouton |
| `.btn--lg` | Grand bouton |
| `.btn--icon` | Bouton carré avec icône seule |
| `.btn--full` | Pleine largeur |

États : `:hover`, `:focus-visible`, `:active`, `[disabled]` — tous définis dans le Design System.

### 5.2 Cartes — `.card`

```html
<div class="card">...</div>
<div class="card card--elevated">...</div>
<button class="card card--interactive">...</button>
```

| Modificateur | Usage |
|---|---|
| `.card--elevated` | Ombre prononcée |
| `.card--flat` | Fond de surface, sans ombre |
| `.card--interactive` | Hover effect (scale + shadow) |
| `.card--success` | Bordure gauche verte (feedback correct) |
| `.card--error` | Bordure gauche rouge (feedback incorrect) |

### 5.3 Badges — `.badge`

```html
<span class="badge badge--success">Comestible</span>
<span class="badge badge--danger">Toxique</span>
```

| Modificateur | Couleur |
|---|---|
| `.badge--success` | Vert |
| `.badge--warning` | Ocre |
| `.badge--danger` | Rouge |
| `.badge--info` | Bleu |
| `.badge--neutral` | Pierre |

### 5.4 Formulaires

```html
<input class="input" type="text" placeholder="Rechercher...">
<textarea class="textarea"></textarea>
<select class="select">...</select>
```

Tous les éléments de formulaire partagent la même apparence : fond `--color-surface`, bordure `--color-border`, radius `--radius-md`, focus avec outline vert.

### 5.5 Alertes — `.alert`

```html
<div class="alert alert--success" role="alert">
  <span class="alert__icon">✓</span>
  <p class="alert__message">Plante ajoutée à votre collection.</p>
</div>
```

| Modificateur | Usage |
|---|---|
| `.alert--success` | Confirmation |
| `.alert--error` | Erreur |
| `.alert--warning` | Avertissement |
| `.alert--info` | Information neutre |

### 5.6 Barre de progression — `.progress-bar`

```html
<div class="progress-bar" role="progressbar" aria-valuenow="72" aria-valuemin="0" aria-valuemax="100">
  <div class="progress-bar__fill" style="width: 72%"></div>
</div>
```

Variantes de couleur : `.progress-bar--success`, `.progress-bar--warning`.

### 5.7 Loader — `.loader`

```html
<div class="loader" role="status" aria-label="Chargement..."></div>
<div class="loader loader--lg"></div>
```

Spinner CSS pur (animation `rotate` sur un border partiel).

### 5.8 Tags — `.tag`

```html
<span class="tag">médicinal</span>
<span class="tag tag--active">comestible</span>
```

Petits éléments cliquables pour les filtres et catégories.

### 5.9 Avatar — `.avatar`

```html
<div class="avatar" style="--avatar-src: url(photo.jpg)"></div>
<div class="avatar avatar--lg">PQ</div>  <!-- initiales -->
```

---

## 6. Utilitaires (`_utilities.scss`)

À utiliser avec parcimonie — toujours préférer un composant sémantique.

| Classe | Effet |
|---|---|
| `.sr-only` | Visible uniquement pour les lecteurs d'écran |
| `.hidden` | `display: none` |
| `.text-center` | `text-align: center` |
| `.text-muted` | Couleur `--color-text-muted` |
| `.text-small` | Taille `--text-sm` |
| `.mt-auto` | `margin-top: auto` |
| `.truncate` | Texte tronqué avec ellipsis |

---

## 7. Styles dans les composants Angular

Dans les fichiers `.scss` d'un composant Angular, on **ne recrée pas** de styles déjà définis dans le Design System. On utilise :

```scss
// ✅ Correct — utiliser les tokens
.plant-card__name {
  font-family: var(--font-display);
  color: var(--color-green-600);
  font-size: var(--text-lg);
}

// ✅ Correct — utiliser les mixins
@use '../../../styles/tokens' as *;

.identify-zone {
  padding: var(--space-8);

  @include respond-to('md') {
    padding: var(--space-12);
  }
}

// ❌ Interdit — valeur magique
.plant-card__name {
  color: #2d6b28;   // utiliser var(--color-green-600) à la place
  font-size: 20px;  // utiliser var(--text-lg) à la place
}
```

---

## 8. Import des polices

Dans `index.html` (ou `styles/main.scss` via `@import`) :

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Source+Sans+3:wght@400;500;600&display=swap" rel="stylesheet">
```

---

## 9. Checklist Design System

Avant de pousser un composant en review, vérifier :

- [ ] Aucune valeur de couleur codée en dur (utiliser `var(--color-*)`)
- [ ] Aucune valeur de taille codée en dur (utiliser `var(--text-*)`, `var(--space-*)`)
- [ ] Les états focus sont visibles et conformes WCAG AA
- [ ] Le composant est responsive (testé à 375px, 768px, 1280px)
- [ ] Les classes BEM sont cohérentes avec `_components.scss`
- [ ] Pas de `!important`
