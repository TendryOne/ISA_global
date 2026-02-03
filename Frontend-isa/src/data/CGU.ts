interface info {
  title: string
  content: string
  subsection?: {
    id: string
    title: string
    content: string
  }[]
}

export const CGU: info[] = [
  {
    title: 'Préambule',
    content:
      "Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme d'enseignement en ligne de l’Institut Supérieur d’Ambatomirahavavy, située à Madagascar. En accédant ou en utilisant la Plateforme, vous acceptez sans réserve les présentes CGU.",
  },
  {
    title: 'Définitions',
    content: '',
    subsection: [
      {
        id: '2.1',
        title: 'Utilisateur',
        content:
          'Toute personne physique ou morale utilisant la Plateforme, y compris les étudiants, enseignants, administrateurs ou visiteurs.',
      },
      {
        id: '2.2',
        title: 'Plateforme',
        content:
          "L'ensemble des services en ligne fournis par l’Institut Supérieur d’Ambatomirahavavy, incluant les cours, ressources pédagogiques, forums et outils d'évaluation.",
      },
      {
        id: '2.3',
        title: 'Contenu',
        content:
          'Tout matériel disponible sur la Plateforme, y compris les cours, vidéos, documents, quiz et autres ressources pédagogiques.',
      },
      {
        id: '2.4',
        title: 'Compte',
        content:
          'Espace personnel créé par l’Utilisateur après validation de son inscription pour accéder aux services de la Plateforme.',
      },
      {
        id: '2.5',
        title: 'Préinscription',
        content:
          'Processus initial par lequel un Utilisateur soumet ses informations pour recevoir un lien d’inscription contenant un token unique.',
      },
    ],
  },
  {
    title: 'Objet',
    content:
      'La Plateforme propose des services d’enseignement en ligne, incluant des cours, certifications, forums d’échange et outils pédagogiques.',
  },
  {
    title: "Conditions d'accès et d'inscription",
    content: '',
    subsection: [
      {
        id: '4.1',
        title: 'Éligibilité',
        content:
          'L’accès à la Plateforme est réservé aux personnes âgées d’au moins 16 ans. Les mineurs doivent obtenir l’autorisation écrite de leur représentant légal.',
      },
      {
        id: '4.2',
        title: 'Processus de préinscription et inscription',
        content:
          'Préinscription : Soumission d’un formulaire avec informations exactes. Lien d’inscription : E-mail avec token unique valable 72 heures. Création de compte : Activation via le lien et informations complètes.',
      },
      {
        id: '4.3',
        title: 'Vérification',
        content:
          'L’Institut peut vérifier l’identité et les informations. Toute information inexacte entraîne le refus ou la suppression du compte.',
      },
      {
        id: '4.4',
        title: 'Sécurité du token',
        content:
          'L’Utilisateur est responsable de l’utilisation du lien et du token. L’Institut n’est pas responsable des accès non autorisés.',
      },
    ],
  },
  {
    title: 'Utilisation de la Plateforme',
    content: '',
    subsection: [
      {
        id: '5.1',
        title: 'Usage autorisé',
        content:
          'Utilisation conforme aux lois malgaches et aux CGU. Interdiction de copier/modifier le contenu ou d’accéder à des données non autorisées.',
      },
      {
        id: '5.2',
        title: 'Comportement',
        content:
          'Comportement respectueux requis. Contenu inapproprié entraîne suspension ou résiliation.',
      },
      {
        id: '5.3',
        title: 'Utilisation des ressources',
        content:
          'Ressources destinées à un usage personnel et éducatif. Utilisation commerciale interdite.',
      },
    ],
  },
  {
    title: 'Propriété intellectuelle',
    content: '',
    subsection: [
      {
        id: '6.1',
        title: 'Contenu de la Plateforme',
        content:
          'Protégé par le droit d’auteur, propriété de l’Institut. Licence limitée pour usage éducatif.',
      },
      {
        id: '6.2',
        title: 'Contributions des Utilisateurs',
        content: 'Propriété de l’Utilisateur, mais licence accordée à l’Institut pour utilisation.',
      },
      {
        id: '6.3',
        title: 'Interdiction de reproduction',
        content: 'Reproduction non autorisée expose à des poursuites civiles et pénales.',
      },
    ],
  },
  {
    title: 'Paiement et frais',
    content: '',
    subsection: [
      {
        id: '7.1',
        title: 'Cours gratuits et payants',
        content: 'Cours gratuits ou payants, frais indiqués avant inscription.',
      },
      {
        id: '7.2',
        title: 'Modalités de paiement',
        content: 'Paiements via moyens sécurisés. Informations valides requises.',
      },
      {
        id: '7.3',
        title: 'Remboursement',
        content:
          'Selon la politique de remboursement, période de rétractation de 14 jours si applicable.',
      },
    ],
  },
  {
    title: 'Responsabilité',
    content: '',
    subsection: [
      {
        id: '8.1',
        title: 'Responsabilité de l’Utilisateur',
        content: 'Responsable de ses actions et des violations des CGU.',
      },
      {
        id: '8.2',
        title: 'Responsabilité de l’Institut',
        content: 'Pas responsable des dommages indirects ou interruptions.',
      },
      {
        id: '8.3',
        title: 'Force majeure',
        content: 'Non responsable des interruptions dues à des cas de force majeure.',
      },
    ],
  },
  {
    title: 'Protection des données personnelles',
    content: '',
    subsection: [
      {
        id: '9.1',
        title: 'Collecte et traitement',
        content: 'Données traitées conformément au RGPD et à la législation malgache.',
      },
      {
        id: '9.2',
        title: 'Sécurité des données',
        content: 'Mesures pour protéger les données, mais risques inhérents à Internet.',
      },
      {
        id: '9.3',
        title: 'Utilisation du token',
        content: 'Token sécurisé et à usage unique. Responsabilité de l’Utilisateur.',
      },
    ],
  },
  {
    title: 'Résiliation',
    content: '',
    subsection: [
      {
        id: '10.1',
        title: 'Par l’Utilisateur',
        content: 'Résiliation à tout moment via la Plateforme.',
      },
      {
        id: '10.2',
        title: 'Par l’Institut',
        content: 'Suspension ou résiliation pour violation des CGU, fraude, ou non-paiement.',
      },
      {
        id: '10.3',
        title: 'Conséquences de la résiliation',
        content: 'Accès révoqué, contenu conservé par l’Institut si applicable.',
      },
    ],
  },
  {
    title: 'Modification des CGU',
    content: 'Modifications possibles avec notification par e-mail ou sur la Plateforme.',
  },
  {
    title: 'Droit applicable et juridiction',
    content: 'Régi par le droit malgache. Litiges soumis aux tribunaux d’Antananarivo.',
  },
  {
    title: 'Contact',
    content: 'Contactez-nous à : contact@is-ambatomirahavavy.mg.',
  },
]

export const PolitiqueConfidentialite: info[] = [
  {
    title: 'Préambule',
    content:
      'L’Institut Supérieur d’Ambatomirahavavy, situé à Madagascar, s’engage à protéger les données personnelles des utilisateurs de sa plateforme en ligne, conformément au RGPD et à la législation malgache.',
  },
  {
    title: 'Définitions',
    content: '',
    subsection: [
      {
        id: '2.1',
        title: 'Données personnelles',
        content: 'Toute information relative à une personne physique identifiée ou identifiable.',
      },
      {
        id: '2.2',
        title: 'Utilisateur',
        content:
          'Toute personne utilisant la Plateforme, y compris étudiants, enseignants ou visiteurs.',
      },
      {
        id: '2.3',
        title: 'Responsable du traitement',
        content: 'L’Institut, qui détermine les finalités et moyens du traitement des données.',
      },
      {
        id: '2.4',
        title: 'Token',
        content: 'Identifiant unique envoyé par e-mail pour sécuriser l’inscription.',
      },
    ],
  },
  {
    title: 'Données collectées',
    content: '',
    subsection: [
      {
        id: '3.1',
        title: 'Données fournies par l’Utilisateur',
        content:
          'Nom, prénom, e-mail, informations de paiement, documents d’identité, contenu généré (commentaires, travaux).',
      },
      {
        id: '3.2',
        title: 'Données collectées automatiquement',
        content: 'Adresse IP, type de navigateur, données de navigation, cookies.',
      },
      {
        id: '3.3',
        title: 'Données liées au token',
        content: 'Token unique pour l’inscription, non stocké après activation.',
      },
    ],
  },
  {
    title: 'Finalités du traitement',
    content:
      'Gérer l’inscription, fournir des services éducatifs, traiter les paiements, améliorer la Plateforme, respecter les obligations légales.',
  },
  {
    title: 'Base légale du traitement',
    content: 'Consentement, exécution d’un contrat, obligation légale, intérêt légitime.',
  },
  {
    title: 'Partage des données',
    content: '',
    subsection: [
      {
        id: '6.1',
        title: 'Destinataires internes',
        content: 'Employés de l’Institut nécessaires à l’exécution des services.',
      },
      {
        id: '6.2',
        title: 'Prestataires externes',
        content:
          'Prestataires de paiement, hébergement, partenaires pédagogiques, tenus à la confidentialité.',
      },
      {
        id: '6.3',
        title: 'Autorités légales',
        content: 'Partage en cas d’obligation légale ou demande judiciaire.',
      },
    ],
  },
  {
    title: 'Cookies et technologies similaires',
    content: '',
    subsection: [
      {
        id: '7.1',
        title: 'Types de cookies',
        content: 'Cookies essentiels, analytiques, fonctionnels.',
      },
      {
        id: '7.2',
        title: 'Gestion des cookies',
        content: 'Préférences gérables via la Plateforme ou le navigateur.',
      },
    ],
  },
  {
    title: 'Sécurité des données',
    content:
      'Chiffrement, accès restreint, surveillance des systèmes. Risques inhérents à Internet.',
  },
  {
    title: 'Durée de conservation',
    content:
      'Préinscription : 30 jours. Comptes actifs : 5 ans après résiliation. Paiements : temps nécessaire ou obligations comptables. Tokens : supprimés après activation.',
  },
  {
    title: 'Droits des Utilisateurs',
    content:
      'Accès, rectification, suppression, opposition, portabilité, limitation. Contact : contact@is-ambatomirahavavy.mg.',
  },
  {
    title: 'Transferts internationaux',
    content:
      'Transferts hors Madagascar avec normes de protection équivalentes (clauses contractuelles).',
  },
  {
    title: 'Modification de la Politique de Confidentialité',
    content:
      'Modifications notifiées par e-mail ou sur la Plateforme. Utilisation continue vaut acceptation.',
  },
  {
    title: 'Contact',
    content:
      'Contactez le responsable de la protection des données à : contact@is-ambatomirahavavy.mg.',
  },
]

export const ContratEngagementEtudiant: info[] = [
  {
    title: 'Objet du contrat',
    content:
      'Ce contrat définit les obligations de l’Étudiant dans le cadre de son inscription et participation aux programmes d’enseignement en ligne de l’Institut Supérieur d’Ambatomirahavavy.',
  },
  {
    title: 'Définitions',
    content: '',
    subsection: [
      {
        id: '2.1',
        title: 'Plateforme',
        content:
          'Services en ligne incluant cours, ressources pédagogiques, forums et outils d’évaluation.',
      },
      {
        id: '2.2',
        title: 'Étudiant',
        content: 'Personne inscrite à un programme après préinscription et inscription.',
      },
      {
        id: '2.3',
        title: 'Préinscription',
        content: 'Processus initial avec soumission d’informations pour recevoir un token.',
      },
    ],
  },
  {
    title: 'Processus d’inscription',
    content: '',
    subsection: [
      {
        id: '3.1',
        title: 'Préinscription',
        content: 'Fourniture d’informations exactes via un formulaire en ligne.',
      },
      {
        id: '3.2',
        title: 'Validation de l’inscription',
        content: 'Réception d’un e-mail avec un token valable 72 heures pour activer le compte.',
      },
      {
        id: '3.3',
        title: 'Vérification d’identité',
        content:
          'L’Institut peut demander des documents pour vérifier l’identité. Informations inexactes entraînent l’annulation.',
      },
    ],
  },
  {
    title: 'Engagements de l’Étudiant',
    content: '',
    subsection: [
      {
        id: '4.1',
        title: 'Respect des CGU',
        content: 'Respect des Conditions Générales d’Utilisation de la Plateforme.',
      },
      {
        id: '4.2',
        title: 'Participation active',
        content: 'Participation aux cours, soumission des travaux dans les délais.',
      },
      {
        id: '4.3',
        title: 'Paiement des frais',
        content: 'Paiement des frais dans les délais. Non-paiement entraîne suspension.',
      },
      {
        id: '4.4',
        title: 'Comportement éthique',
        content: 'Éviter plagiat, triche, harcèlement ou discrimination.',
      },
      {
        id: '4.5',
        title: 'Protection des identifiants',
        content: 'Responsabilité de la confidentialité des identifiants et du token.',
      },
    ],
  },
  {
    title: 'Obligations de l’Institut',
    content: '',
    subsection: [
      {
        id: '5.1',
        title: 'Fourniture des services',
        content: 'Accès aux cours, ressources et outils d’évaluation.',
      },
      {
        id: '5.2',
        title: 'Support technique et pédagogique',
        content: 'Support pour problèmes d’accès et questions pédagogiques.',
      },
      {
        id: '5.3',
        title: 'Protection des données personnelles',
        content: 'Traitement des données conforme à la Politique de Confidentialité.',
      },
    ],
  },
  {
    title: 'Durée et résiliation',
    content: '',
    subsection: [
      {
        id: '6.1',
        title: 'Durée',
        content: 'En vigueur dès l’inscription pour la durée du programme.',
      },
      {
        id: '6.2',
        title: 'Résiliation par l’Étudiant',
        content: 'Résiliation par écrit, sans remboursement après 14 jours (si applicable).',
      },
      {
        id: '6.3',
        title: 'Résiliation par l’Institut',
        content: 'Résiliation pour violation des CGU, non-paiement ou comportement inapproprié.',
      },
    ],
  },
  {
    title: 'Responsabilité',
    content: '',
    subsection: [
      {
        id: '7.1',
        title: 'Responsabilité de l’Étudiant',
        content: 'Responsable de ses actions et violations.',
      },
      {
        id: '7.2',
        title: 'Responsabilité de l’Institut',
        content: 'Non responsable des interruptions dues à la force majeure ou dommages indirects.',
      },
    ],
  },
  {
    title: 'Propriété intellectuelle',
    content: 'Contenu pédagogique protégé. Licence limitée pour usage éducatif.',
  },
  {
    title: 'Droit applicable et juridiction',
    content: 'Régi par le droit malgache. Litiges soumis aux tribunaux d’Antananarivo.',
  },
  {
    title: 'Contact',
    content: 'Contactez l’Institut à : contact@is-ambatomirahavavy.mg.',
  },
]

export const CharteInformatique: info[] = [
  {
    title: 'Préambule',
    content:
      'La Charte Informatique définit les règles d’utilisation des ressources informatiques de la plateforme de l’Institut Supérieur d’Ambatomirahavavy. Tout utilisateur s’engage à la respecter pour garantir la sécurité et l’intégrité des systèmes.',
  },
  {
    title: 'Définitions',
    content: '',
    subsection: [
      {
        id: '2.1',
        title: 'Ressources informatiques',
        content:
          'Outils, services et infrastructures numériques de la Plateforme (serveurs, logiciels, bases de données, interfaces).',
      },
      {
        id: '2.2',
        title: 'Utilisateur',
        content: 'Personne accédant à la Plateforme, avec ou sans compte actif.',
      },
      {
        id: '2.3',
        title: 'Préinscription',
        content: 'Processus initial avec soumission d’informations pour recevoir un token.',
      },
      {
        id: '2.4',
        title: 'Token',
        content: 'Identifiant unique envoyé par e-mail pour sécuriser l’inscription.',
      },
    ],
  },
  {
    title: 'Objet',
    content:
      'Assurer une utilisation responsable et sécurisée des ressources informatiques, protéger les données et prévenir les abus.',
  },
  {
    title: 'Accès aux ressources informatiques',
    content: '',
    subsection: [
      {
        id: '4.1',
        title: 'Préinscription et inscription',
        content:
          'Préinscription via formulaire, suivi d’un e-mail avec token valable 72 heures. Activation du compte et vérification d’identité possibles.',
      },
      {
        id: '4.2',
        title: 'Accès autorisé',
        content:
          'Réservé aux utilisateurs avec compte valide. Tentatives d’accès non autorisé interdites.',
      },
    ],
  },
  {
    title: 'Règles d’utilisation',
    content: '',
    subsection: [
      {
        id: '5.1',
        title: 'Usage autorisé',
        content: 'Utilisation pour finalités éducatives (cours, travaux, forums).',
      },
      {
        id: '5.2',
        title: 'Interdictions',
        content:
          'Contournement de sécurité, logiciels malveillants, partage d’identifiants, activités illégales ou surcharge des systèmes.',
      },
      {
        id: '5.3',
        title: 'Comportement en ligne',
        content: 'Comportement respectueux requis. Contenu inapproprié interdit.',
      },
    ],
  },
  {
    title: 'Sécurité des systèmes',
    content: '',
    subsection: [
      {
        id: '6.1',
        title: 'Mesures de l’Institut',
        content: 'Chiffrement, pare-feu, surveillance pour protéger les systèmes.',
      },
      {
        id: '6.2',
        title: 'Responsabilité de l’Utilisateur',
        content: 'Mots de passe robustes, protection du token, signalement des incidents.',
      },
      {
        id: '6.3',
        title: 'Risques inhérents',
        content:
          'Risques liés à Internet. Institut non responsable des failles dues à l’Utilisateur.',
      },
    ],
  },
  {
    title: 'Propriété intellectuelle',
    content: 'Ressources protégées par le droit d’auteur. Licence limitée pour usage éducatif.',
  },
  {
    title: 'Protection des données personnelles',
    content:
      'Traitement conforme à la Politique de Confidentialité, RGPD et législation malgache. Token supprimé après activation.',
  },
  {
    title: 'Sanctions en cas de non-respect',
    content: 'Avertissement, suspension, résiliation ou poursuites pour violations graves.',
  },
  {
    title: 'Modification de la charte',
    content:
      'Modifications notifiées par e-mail ou sur la Plateforme. Utilisation continue vaut acceptation.',
  },
  {
    title: 'Droit applicable et juridiction',
    content: 'Régi par le droit malgache. Litiges soumis aux tribunaux d’Antananarivo.',
  },
  {
    title: 'Contact',
    content: 'Contactez l’Institut à : contact@is-ambatomirahavavy.mg.',
  },
]
