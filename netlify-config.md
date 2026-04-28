# 🚀 Configuration Netlify — PlantQuest

Documentation de la configuration de déploiement sur Netlify pour l'application Angular PlantQuest.

---

## Fichiers à créer

| Fichier | Emplacement | Rôle |
|---|---|---|
| `netlify.toml` | Racine du projet | Configuration principale Netlify |
| `src/_redirects` | `src/` | Redirections SPA (copié dans `dist/` au build) |

---

## `netlify.toml`

Placer ce fichier **à la racine du dépôt Git**.

```toml
# =============================================
# PlantQuest — Configuration Netlify
# =============================================

# --- Build ---
[build]
  command         = "ng build --configuration production"
  publish         = "dist/plantquest/browser"
  # Si le projet est dans un sous-dossier monorepo :
  # base = "plantquest/"

# --- Variables d'environnement (dev local uniquement) ---
# Les secrets de production sont définis dans le dashboard Netlify
# NE PAS committer de vraies clés ici
[build.environment]
  NODE_VERSION = "20"
  NPM_FLAGS    = "--legacy-peer-deps"

# --- Contextes de déploiement ---
[context.production]
  command = "ng build --configuration production"

[context.deploy-preview]
  command = "ng build --configuration production"

[context.branch-deploy]
  command = "ng build --configuration production"

# --- Redirections SPA ---
# Toutes les routes non trouvées renvoient vers index.html (routing Angular côté client)
[[redirects]]
  from   = "/*"
  to     = "/index.html"
  status = 200

# --- Headers de sécurité ---
[[headers]]
  for = "/*"

  [headers.values]
    # Interdit l'affichage dans une iframe (clickjacking)
    X-Frame-Options = "DENY"

    # Empêche le MIME-sniffing
    X-Content-Type-Options = "nosniff"

    # Force HTTPS pour 1 an (production uniquement)
    Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"

    # Politique de référent
    Referrer-Policy = "strict-origin-when-cross-origin"

    # Permissions navigateur
    Permissions-Policy = "camera=(self), geolocation=(self), microphone=()"

    # Content Security Policy
    # ⚠️ À affiner selon les domaines utilisés (APIs, polices, etc.)
    Content-Security-Policy = """
      default-src 'self';
      script-src  'self' 'unsafe-inline';
      style-src   'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src    'self' https://fonts.gstatic.com;
      img-src     'self' data: blob: https:;
      connect-src 'self' https://api.plant.id https://api.inaturalist.org;
      frame-ancestors 'none';
    """

# --- Cache des assets statiques (Angular hash les noms de fichiers) ---
[[headers]]
  for = "/assets/*"

  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"

  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"

  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# --- Pas de cache sur index.html (point d'entrée SPA) ---
[[headers]]
  for = "/index.html"

  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
```

---

## `src/_redirects`

Fallback si `netlify.toml` n'est pas lu. Ajouter ce fichier dans `src/` et déclarer son inclusion dans `angular.json`.

```
/*    /index.html   200
```

### Déclaration dans `angular.json`

Dans la section `assets` du projet :

```json
"assets": [
  "src/favicon.ico",
  "src/assets",
  "src/manifest.webmanifest",
  { "glob": "_redirects", "input": "src", "output": "/" }
]
```

---

## Variables d'environnement dans Netlify

Les clés API ne doivent **jamais** être committées dans le code. Elles sont configurées dans le dashboard Netlify.

### Où les ajouter

Dashboard Netlify → Site → **Site configuration** → **Environment variables** → **Add variable**

### Variables à créer

| Nom de la variable | Description | Contexte |
|---|---|---|
| `PLANT_ID_API_KEY` | Clé API Plant.id | Production + Deploy previews |
| `INATURALIST_TOKEN` | Token iNaturalist (si utilisé) | Production + Deploy previews |

### Accès dans Angular

⚠️ Angular est un framework **front-end** — les variables d'environnement Netlify **ne sont pas injectées automatiquement** dans le bundle JS.

Deux options :

**Option A — Proxy Netlify Functions (recommandée pour sécuriser les clés)**

Créer une Netlify Function qui agit comme proxy et appelle l'API depuis le serveur :

```
netlify/
└── functions/
    └── identify-plant.mts   # Proxy vers Plant.id API
```

```toml
# Dans netlify.toml, déclarer le dossier des fonctions
[functions]
  directory = "netlify/functions"
```

**Option B — Remplacement au build via `angular.json`**

Utiliser `fileReplacements` pour injecter les clés au moment du build :

```json
// environment.prod.ts
export const environment = {
  production: true,
  plantIdApiKey: process.env['PLANT_ID_API_KEY'] ?? ''
};
```

Configurer le script de build pour passer les variables :

```toml
[context.production]
  command = "ng build --configuration production"
```

Les variables Netlify sont accessibles comme variables d'environnement Node.js pendant le build.

---

## Connexion GitHub → Netlify

1. Aller sur [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**
2. Choisir **GitHub**, autoriser Netlify
3. Sélectionner le repo `plantquest`
4. Vérifier les paramètres de build :
   - **Build command** : `ng build --configuration production`
   - **Publish directory** : `dist/plantquest/browser`
5. Cliquer **Deploy site**

### Deploy Previews

Netlify crée automatiquement une URL de preview pour chaque Pull Request. Aucune configuration supplémentaire n'est nécessaire.

---

## Checklist avant premier déploiement

- [ ] `netlify.toml` présent à la racine du repo
- [ ] `src/_redirects` présent et référencé dans `angular.json`
- [ ] Variables d'environnement ajoutées dans le dashboard Netlify
- [ ] `ng build --configuration production` tourne sans erreur en local
- [ ] `outputPath` dans `angular.json` correspond au `publish` dans `netlify.toml`
- [ ] Pas de clé API dans le code source ou les fichiers d'environnement committés

## Checklist post-déploiement

- [ ] Naviguer sur une URL profonde (ex: `/quiz`) puis rafraîchir → ne doit pas retourner 404
- [ ] Vérifier les headers sur [securityheaders.com](https://securityheaders.com)
- [ ] Tester sur mobile réel (iOS Safari + Android Chrome)
- [ ] Vérifier l'installation PWA (bouton "Ajouter à l'écran d'accueil")
- [ ] Vérifier que le Service Worker s'enregistre correctement (HTTPS requis en production ✓)
