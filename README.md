# ActionTrack v2

Logiciel de suivi des actions et projets — traçabilité, responsabilité, performance.

## Installation

### Prérequis
- Node.js 16+ (https://nodejs.org)
- npm (inclus avec Node.js)

### Démarrer en 3 commandes

```bash
# 1. Aller dans le dossier
cd actiontrack

# 2. Installer les dépendances
npm install

# 3. Lancer le logiciel
npm start
```

Le logiciel s'ouvre automatiquement sur http://localhost:3000

### Construire la version finale (déploiement)

```bash
npm run build
```

Génère un dossier `build/` prêt à déployer sur n'importe quel hébergement.

---

## Structure du projet

```
actiontrack/
├── public/
│   └── index.html
├── src/
│   ├── App.jsx              # Application principale, routing, état global
│   ├── index.js             # Point d'entrée React
│   ├── data/
│   │   └── initial.js       # Constantes, données initiales, helpers
│   └── components/
│       ├── UI.jsx            # Composants partagés (Avatar, Badge, Modal, etc.)
│       ├── ActionDetail.jsx  # Détail d'une action (onglets, étapes, commentaires, QR)
│       ├── QRModal.jsx       # Modale de validation par QR Code
│       ├── NewActionModal.jsx # Créer une nouvelle action
│       └── views/
│           ├── Dashboard.jsx  # Vue direction — KPIs, projets, performance agents
│           ├── Actions.jsx    # Liste filtrée de toutes les actions
│           ├── Manager.jsx    # Vue manager — qui fait quoi
│           ├── Journal.jsx    # Journal global chronologique
│           ├── Projets.jsx    # Gestion des projets
│           └── Equipe.jsx     # Gestion de l'équipe
├── package.json
└── README.md
```

---

## Fonctionnalités

### Gestion des actions
- Création avec titre, description, catégorie, priorité, assignation, date limite, durée attendue
- Étapes jalons définies par le manager, cochées par l'agent
- Barre de progression par étape
- Durée réelle calculée automatiquement à la validation

### Rôles
- **Direction** : accès complet, dashboard global, gestion équipe
- **Manager** : créer/assigner des actions, valider, vue manager
- **Agent** : voir et mettre à jour ses propres actions

### QR Code
- Chaque action a un QR Code unique
- L'agent scanne → formulaire de validation
- Si retard : motif obligatoire avant validation
- Si non réalisé : motif d'échec obligatoire
- Notification immédiate pour le manager

### Commentaires & Photos
- Onglet commentaires sur chaque action
- Upload de photos (max 3 par commentaire)
- Visionneuse plein écran (lightbox)
- Motifs de retard et d'échec tracés

### Projets
- Regroupement d'actions sous un projet
- Barre de progression % automatique
- Durée moyenne des tâches par projet
- Vue détaillée avec toutes les tâches

### Journal global
- Toute l'activité chronologique
- Filtrable par action
- Horodatage précis de chaque événement

---

## Personnalisation

Pour adapter à votre organisation, modifiez `src/data/initial.js` :

- `INITIAL_USERS` : vos utilisateurs réels
- `INITIAL_PROJETS` : vos projets de départ
- `CATEGORIES` : vos catégories d'actions
- `MOTIFS_RETARD` / `MOTIFS_ECHEC` : vos motifs

---

## Prochaines étapes suggérées

- [ ] Persistance des données (base de données, localStorage)
- [ ] Authentification réelle (email/mot de passe)
- [ ] Export PDF/Excel des rapports
- [ ] Notifications email
- [ ] Module comptabilité
- [ ] Application mobile (React Native)
