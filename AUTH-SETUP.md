# Activer Connexion / Inscription avec Apple et Google

## Google

1. **Créer un client OAuth 2.0**
   - [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Identifiants → Créer des identifiants → ID client OAuth 2.0.
   - Type d’application : **Application Web**.

2. **Origines JavaScript autorisées** (obligatoire pour le popup)
   - `https://nightsquare.com`
   - `https://www.nightsquare.com`
   - En local : `http://localhost` et `http://localhost:3000`

3. **Sur le site**
   - Dans `login.html` et `inscription.html`, décommentez et remplissez :
   - `window.NIGHT_SQUARE_GOOGLE_CLIENT_ID = 'VOTRE_CLIENT_ID.apps.googleusercontent.com';`
   - Si votre API accepte le token : `window.NIGHT_SQUARE_GOOGLE_LOGIN_URL = 'https://api.nightsquarepro.com/...';`

## Apple

1. **Sign in with Apple** côté serveur (Apple exige un backend).
   - Créez une route sur votre API (ex. `https://api.nightsquarepro.com/auth/apple`) qui redirige vers Apple puis traite le callback.

2. **Sur le site**
   - Décommentez et remplissez :
   - `window.NIGHT_SQUARE_APPLE_REDIRECT_URL = 'https://api.nightsquarepro.com/auth/apple';`

Après configuration, les boutons « Continuer avec Apple » et « Continuer avec Google » sont opérationnels.
