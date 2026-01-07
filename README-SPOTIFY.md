# Intégration Spotify API

## Configuration

### 1. Installation des dépendances

```bash
npm install
```

### 2. Configuration des variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
SPOTIFY_CLIENT_ID=3ad1a942c32f44deb97737906025e2dd
SPOTIFY_CLIENT_SECRET=a4c8870595c043adacfa35aa9d18635e
PORT=3000
```

**⚠️ Important** : Ne commitez jamais le fichier `.env` dans Git. Il est déjà dans `.gitignore`.

### 3. Démarrer le serveur backend

```bash
npm start
```

Ou en mode développement avec auto-reload :

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

### 4. Configuration du frontend

Dans `js/main.js`, ligne avec `API_BASE_URL`, modifiez l'URL selon votre environnement :

- **Développement local** : `http://localhost:3000`
- **Production** : Remplacez par l'URL de votre serveur déployé

## Fonctionnement

1. Le backend sert de proxy sécurisé pour l'API Spotify
2. Les clés API ne sont jamais exposées côté client
3. Le frontend appelle le backend qui fait les requêtes à Spotify
4. Les musiques s'affichent dans un widget Spotify au survol des cartes DJ

## Endpoints API

### GET `/api/spotify/artist-track?artistName=NomDJ`

Recherche un artiste et retourne son top track.

**Paramètres :**
- `artistName` (requis) : Nom de l'artiste à rechercher

**Réponse :**
```json
{
  "artist": {
    "name": "Reznik",
    "id": "spotify_artist_id",
    "image": "url_image"
  },
  "track": {
    "name": "Track Name",
    "id": "spotify_track_id",
    "preview_url": "url_preview",
    "external_urls": {
      "spotify": "url_spotify"
    },
    "album": {
      "name": "Album Name",
      "images": [...]
    },
    "embed_url": "https://open.spotify.com/embed/track/..."
  }
}
```

## Déploiement

### Option 1 : Vercel / Netlify Functions

Créez un fichier `api/spotify.js` dans votre projet et utilisez les serverless functions.

### Option 2 : Serveur dédié

Déployez le fichier `server.js` sur un serveur Node.js (Heroku, Railway, etc.).

## Sécurité

- ✅ Les clés API sont stockées côté serveur uniquement
- ✅ Le client secret n'est jamais exposé au navigateur
- ✅ Le token d'accès est mis en cache pour éviter les appels répétés
- ✅ CORS est configuré pour autoriser les requêtes depuis votre domaine
