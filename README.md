# Night Square - Site Internet Public

Site web public pour Night Square, application de réservation de tables premium et accès à des événements exclusifs.

## 🎯 Objectifs

1. Présenter clairement l'application Night Square
2. Expliquer la valeur du service (tables & événements premium)
3. Convertir vers le téléchargement de l'application (iOS / Android)

## 📁 Structure du projet

```
night square site/
├── index.html              # Homepage
├── how-it-works.html      # Page "Comment ça marche"
├── events.html            # Page "Événements & Expériences"
├── organizers.html        # Page "Pour les Organisateurs"
├── download.html          # Page "Télécharger"
├── css/
│   └── style.css         # Styles globaux
├── js/
│   ├── main.js           # JavaScript principal
│   ├── translations.js   # Système de traduction FR/EN
│   ├── home.js           # Scripts homepage
│   ├── how-it-works.js   # Scripts page "How it works"
│   ├── events.js         # Scripts page "Events"
│   ├── organizers.js     # Scripts page "Organizers"
│   └── download.js       # Scripts page "Download"
├── sitemap.xml           # Sitemap SEO
└── robots.txt            # Robots.txt SEO
```

## 🌐 Langues

- **Français (FR)** - Langue par défaut
- **Anglais (EN)** - Disponible via le sélecteur de langue

Le système de traduction utilise `localStorage` pour conserver la préférence de langue de l'utilisateur.

## 🎨 Design

- **Style** : Premium, sobre, élégant
- **Couleurs** :
  - Fond principal : `#121212`
  - Cartes : `#1E1E1E`
  - Texte primaire : `#EAEAEA`
  - Texte secondaire : `#A1A1A1`
  - Accent : `#C5A572`
- **Approche** : Mobile-first, responsive

## 📱 Pages

### Homepage (`index.html`)
- Hero avec proposition de valeur
- Section "Qu'est-ce que Night Square ?"
- Section "Comment ça marche" (3 étapes)
- Section "Pourquoi Night Square ?"
- Section villes/destinations
- CTA final vers téléchargement

### How it works (`how-it-works.html`)
- Parcours utilisateur détaillé
- Différence Table vs Ticket
- Explication paiement flexible
- QR code / accès événement

### Events (`events.html`)
- Sélection d'événements (mock)
- Types de lieux (clubs, salles privées, festivals)
- Mise en avant de l'exclusivité

### Organizers (`organizers.html`)
- Présentation BackOffice
- Application Manager
- Suivi en temps réel
- CTA "Demander une démo"

### Download (`download.html`)
- Liens App Store / Play Store
- QR codes pour téléchargement
- Rappel des bénéfices clés

## 🔍 SEO

- Balises `<title>` et `<meta description>` optimisées par page
- H1 unique par page
- Mots-clés ciblés : réservation table club, nightlife premium, événements exclusifs
- Sitemap.xml inclus
- Robots.txt configuré

## ⚡ Performance

- HTML/CSS/JavaScript vanilla (pas de framework lourd)
- Lazy loading des images
- Optimisations pour Lighthouse > 90 mobile
- Code minifié et optimisé

## 🚀 Déploiement

Le site est composé de pages statiques et peut être déployé sur :
- Vercel
- Netlify
- GitHub Pages
- Tout hébergeur de fichiers statiques

## 📝 Notes

- Le site ne permet **pas** de réserver directement
- Il sert de vitrine premium + point d'entrée vers l'application
- Les liens App Store / Play Store sont des placeholders à remplacer par les vrais liens

## 🔧 Développement

Pour tester localement, ouvrez simplement `index.html` dans un navigateur ou utilisez un serveur local :

```bash
# Avec Python
python -m http.server 8000

# Avec Node.js (http-server)
npx http-server
```

Puis accédez à `http://localhost:8000`
