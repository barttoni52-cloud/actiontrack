// ─── CONSTANTS ────────────────────────────────────────────────────────────────

export const ROLES = ['direction', 'manager', 'agent'];

export const STATUTS = ['OUVERT', 'EN COURS', 'EN ATTENTE', 'SOUMIS', 'VALIDÉ', 'REJETÉ', 'ARCHIVÉ'];

export const PRIORITES = ['CRITIQUE', 'HAUTE', 'NORMALE', 'BASSE'];

export const CATEGORIES = [
  'Administratif', 'Commercial', 'Technique', 'RH', 'Finance',
  'Juridique', 'Communication', 'Projet', 'Qualité', 'Autre',
];

export const MOTIFS_RETARD = [
  'Manque de ressources', 'Dépendance externe', 'Problème technique',
  'Charge de travail', 'Information manquante', 'Autre',
];

export const MOTIFS_ECHEC = [
  'Objectif irréalisable', 'Ressources insuffisantes',
  'Annulation externe', 'Problème bloquant', 'Autre',
];

export const STATUT_COLORS = {
  'OUVERT':     { text: '#1d4ed8', bg: '#dbeafe' },
  'EN COURS':   { text: '#166534', bg: '#dcfce7' },
  'EN ATTENTE': { text: '#92400e', bg: '#fef3c7' },
  'SOUMIS':     { text: '#5b21b6', bg: '#ede9fe' },
  'VALIDÉ':     { text: '#065f46', bg: '#d1fae5' },
  'REJETÉ':     { text: '#991b1b', bg: '#fee2e2' },
  'ARCHIVÉ':    { text: '#374151', bg: '#f3f4f6' },
};

export const PRIO_COLORS = {
  CRITIQUE: '#dc2626',
  HAUTE:    '#ea580c',
  NORMALE:  '#2563eb',
  BASSE:    '#6b7280',
};

export const AVATAR_COLORS = [
  '#2563eb', '#7c3aed', '#db2777', '#16a34a', '#d97706', '#0891b2', '#dc2626',
];

export const avatarColor = (id) =>
  AVATAR_COLORS[parseInt((id || '0').replace(/\D/g, ''), 10) % AVATAR_COLORS.length];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

export const gid = (prefix = 'X') =>
  `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

export const nowISO = () => new Date().toISOString();

export const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return (
    d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' ' +
    d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  );
};

export const diffHours = (a, b) => Math.round(Math.abs(new Date(b) - new Date(a)) / 36e5);

const mkE = (titles) =>
  titles.map((t, i) => ({ id: `E${i + 1}`, titre: t, fait: i === 0, dateFait: i === 0 ? '2026-06-02T08:00:00Z' : null }));

// ─── INITIAL DATA ─────────────────────────────────────────────────────────────

export const INITIAL_USERS = [
  { id: 'U001', nom: 'Sophie Marchand', role: 'direction', poste: 'Directrice Générale',   service: 'Direction',    avatar: 'SM', actif: true },
  { id: 'U002', nom: 'Karim Bensalem',  role: 'manager',   poste: 'Resp. Opérations',      service: 'Opérations',   avatar: 'KB', actif: true },
  { id: 'U003', nom: 'Léa Fontaine',    role: 'manager',   poste: 'Resp. RH',              service: 'RH',           avatar: 'LF', actif: true },
  { id: 'U004', nom: 'Marc Dubois',     role: 'agent',     poste: 'Chargé de mission',     service: 'Opérations',   avatar: 'MD', actif: true },
  { id: 'U005', nom: 'Aïda Traoré',    role: 'agent',     poste: 'Assistante Admin.',      service: 'Administration', avatar: 'AT', actif: true },
  { id: 'U006', nom: 'Thomas Petit',    role: 'agent',     poste: 'Analyste',              service: 'Finance',      avatar: 'TP', actif: true },
];

export const INITIAL_PROJETS = [
  {
    id: 'PRJ-001', titre: 'Audit Qualité Q2 2026',
    description: 'Révision complète des procédures et standards qualité du 2ème trimestre.',
    managerId: 'U002', dateDebut: '2026-06-01T00:00:00Z', dateFin: '2026-06-30T00:00:00Z',
    couleur: '#2563eb', actif: true,
  },
  {
    id: 'PRJ-002', titre: 'Onboarding Nouveaux Agents',
    description: 'Intégration et formation de 3 nouveaux collaborateurs.',
    managerId: 'U003', dateDebut: '2026-06-10T00:00:00Z', dateFin: '2026-07-10T00:00:00Z',
    couleur: '#16a34a', actif: true,
  },
];

export const INITIAL_ACTIONS = [
  {
    id: 'ACT-KX3F2-T9A', titre: 'Analyse procédures Q2',
    description: 'Inventaire et analyse critique des procédures en vigueur.',
    projetId: 'PRJ-001', categorie: 'Qualité', priorite: 'HAUTE', statut: 'EN COURS',
    assigneA: 'U004', creeePar: 'U002',
    dateCreation: '2026-06-01T09:15:00Z', dateLimite: '2026-06-15T17:00:00Z',
    dureeAttendue: 16, dateDebut: '2026-06-02T08:00:00Z', dateFin: null,
    etapes: mkE(['Collecter les documents', 'Identifier les doublons', 'Évaluer la conformité', 'Rédiger le rapport']),
    journal: [
      { id: 'J1', auteurId: 'U002', action: 'Action créée et assignée.', date: '2026-06-01T09:15:00Z', type: 'creation' },
      { id: 'J2', auteurId: 'U004', action: 'Prise en charge. Collecte démarrée.', date: '2026-06-02T08:30:00Z', type: 'mise_a_jour' },
    ],
    commentaires: [
      { id: 'C1', auteurId: 'U004', texte: '3 doublons majeurs identifiés dans les procédures RH.', date: '2026-06-03T10:00:00Z', type: 'normal', photos: [] },
    ],
    retardMotif: null, retardDetails: '', echecMotif: null, echecDetails: '',
    qrToken: 'QR-K9X2-M3T',
  },
  {
    id: 'ACT-LM7Q1-R2B', titre: 'MAJ base fournisseurs',
    description: 'Vérification et mise à jour complète des contacts fournisseurs actifs.',
    projetId: 'PRJ-001', categorie: 'Administratif', priorite: 'NORMALE', statut: 'VALIDÉ',
    assigneA: 'U005', creeePar: 'U002',
    dateCreation: '2026-06-01T10:00:00Z', dateLimite: '2026-06-08T17:00:00Z',
    dureeAttendue: 8, dateDebut: '2026-06-01T10:00:00Z', dateFin: '2026-06-07T16:00:00Z',
    etapes: mkE(['Extraire la liste', 'Contacter fournisseurs', 'Mettre à jour CRM', 'Archiver inactifs']),
    journal: [
      { id: 'J3', auteurId: 'U002', action: 'Créée.', date: '2026-06-01T10:00:00Z', type: 'creation' },
      { id: 'J4', auteurId: 'U005', action: 'Validée via QR Code.', date: '2026-06-07T16:00:00Z', type: 'validation' },
    ],
    commentaires: [
      { id: 'C2', auteurId: 'U005', texte: '87 fournisseurs vérifiés, 14 archivés.', date: '2026-06-07T15:55:00Z', type: 'normal', photos: [] },
    ],
    retardMotif: null, retardDetails: '', echecMotif: null, echecDetails: '',
    qrToken: 'QR-L7M1-R2B',
  },
  {
    id: 'ACT-NP9W3-C4D', titre: 'Rapport financier Mai 2026',
    description: 'Compilation et analyse des indicateurs financiers du mois de mai.',
    projetId: null, categorie: 'Finance', priorite: 'CRITIQUE', statut: 'SOUMIS',
    assigneA: 'U006', creeePar: 'U001',
    dateCreation: '2026-06-01T08:00:00Z', dateLimite: '2026-06-07T12:00:00Z',
    dureeAttendue: 12, dateDebut: '2026-06-01T08:00:00Z', dateFin: null,
    etapes: mkE(['Collecter les données', 'Analyser les écarts', 'Rédiger', 'Soumettre']),
    journal: [
      { id: 'J5', auteurId: 'U001', action: 'Créée en urgence.', date: '2026-06-01T08:00:00Z', type: 'creation' },
      { id: 'J6', auteurId: 'U006', action: 'Rapport soumis.', date: '2026-06-05T17:55:00Z', type: 'soumission' },
    ],
    commentaires: [],
    retardMotif: 'Accès aux données obtenu avec 2 jours de retard.', retardDetails: '',
    echecMotif: null, echecDetails: '',
    qrToken: 'QR-N9P3-C4D',
  },
  {
    id: 'ACT-ONB-001', titre: 'Kit accueil nouveaux agents',
    description: 'Préparer et remettre les kits pour 3 nouveaux collaborateurs.',
    projetId: 'PRJ-002', categorie: 'RH', priorite: 'HAUTE', statut: 'EN COURS',
    assigneA: 'U003', creeePar: 'U001',
    dateCreation: '2026-06-10T09:00:00Z', dateLimite: '2026-06-17T17:00:00Z',
    dureeAttendue: 6, dateDebut: '2026-06-10T09:00:00Z', dateFin: null,
    etapes: mkE(['Commander matériel', 'Préparer docs RH', 'Configurer accès IT', 'Remettre les kits']),
    journal: [
      { id: 'J7', auteurId: 'U001', action: 'Créée.', date: '2026-06-10T09:00:00Z', type: 'creation' },
    ],
    commentaires: [],
    retardMotif: null, retardDetails: '', echecMotif: null, echecDetails: '',
    qrToken: 'QR-O4N1-A8B',
  },
];
