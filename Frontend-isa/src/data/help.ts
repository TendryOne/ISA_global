import { UnivesityInformation } from './universityInformation'

export const HelpArticles = [
  // ========================================
  // AUTHENTIFICATION & COMPTE
  // ========================================
  {
    articleId: 'reset-password',
    title: 'Mot de passe oublié ? Voici comment le réinitialiser',
    description:
      "Suivez cette procédure pour récupérer l'accès à votre compte en quelques minutes.",
    category: 'auth',
    icon: 'ph:key-return',
    readTime: 3,
    updatedAt: '2024-12-01',
    content: `Si vous avez oublié votre mot de passe, ne vous inquiétez pas ! Voici comment le récupérer :

1. Rendez-vous sur la page de connexion
2. Cliquez sur le lien "Mot de passe oublié ?"
3. Saisissez votre adresse email universitaire (@isa.edu.mg)
4. Consultez votre boîte de réception (et les spams)
5. Cliquez sur le lien de réinitialisation reçu par email
6. Créez un nouveau mot de passe sécurisé

⚠️ Important :
- Le lien est valide pendant 30 minutes seulement
- Votre nouveau mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre
- Si vous ne recevez pas l'email, contactez le support technique`,
  },
  {
    articleId: 'first-login',
    title: 'Première connexion : activer mon compte étudiant',
    description: 'Étapes pour activer votre compte universitaire après votre inscription.',
    category: 'auth',
    icon: 'ph:user-circle-plus',
    readTime: 4,
    updatedAt: '2024-12-01',
    content: `Bienvenue à l'ISA ! Voici comment activer votre compte :

1. Vérifiez votre boîte email (celle fournie lors de l'inscription)
2. Ouvrez l'email d'activation envoyé par l'université
3. Cliquez sur le lien d'activation
4. Définissez votre mot de passe personnel
5. Connectez-vous avec votre email et votre nouveau mot de passe

Vos identifiants :
- Identifiant : Votre adresse email universitaire
- Mot de passe : Celui que vous avez créé lors de l'activation

💡 Conseil : Conservez précieusement vos identifiants et ne les partagez jamais !`,
  },
  {
    articleId: 'change-password',
    title: 'Modifier mon mot de passe',
    description: 'Comment changer votre mot de passe depuis les paramètres de sécurité.',
    category: 'auth',
    icon: 'ph:lock-key',
    readTime: 2,
    updatedAt: '2024-12-01',
    content: `Pour modifier votre mot de passe :

1. Cliquez sur votre avatar en haut à droite
2. Sélectionnez "Paramètres"
3. Allez dans l'onglet "Sécurité du compte"
4. Cliquez sur "Modifier" à côté de "Mot de passe"
5. Saisissez votre ancien mot de passe
6. Entrez votre nouveau mot de passe (2 fois pour confirmation)
7. Cliquez sur "Mettre à jour"

🔐 Votre mot de passe doit être :
- Au moins 8 caractères
- Contenir une majuscule et une minuscule
- Contenir au moins un chiffre

Un indicateur de force vous aide à créer un mot de passe sécurisé.`,
  },
  {
    articleId: 'logout-sessions',
    title: 'Gérer mes sessions actives',
    description: 'Consultez et déconnectez les appareils connectés à votre compte.',
    category: 'auth',
    icon: 'ph:devices',
    readTime: 2,
    updatedAt: '2024-12-01',
    content: `Vous pouvez voir tous les appareils connectés à votre compte :

1. Allez dans Paramètres > Sécurité du compte
2. Consultez la section "Sessions actives"
3. Vous verrez la liste des appareils avec :
   - Le type d'appareil (ordinateur, mobile)
   - La dernière activité
   - La localisation approximative

Pour déconnecter un appareil :
- Cliquez sur "Déconnecter" à côté de la session concernée

💡 Si vous voyez une session suspecte, déconnectez-la immédiatement et changez votre mot de passe !`,
  },

  // ========================================
  // COURS EN LIGNE
  // ========================================
  {
    articleId: 'access-courses',
    title: 'Accéder à mes cours',
    description: "Comment naviguer et accéder à vos unités d'enseignement.",
    category: 'cours',
    icon: 'ph:book-open',
    readTime: 4,
    updatedAt: '2024-12-01',
    content: `Pour accéder à vos cours :

1. Connectez-vous à votre compte
2. Dans le menu latéral, cliquez sur "Cours"
3. Sélectionnez votre semestre (S1, S2, etc.)
4. Choisissez l'unité d'enseignement souhaitée

Chaque cours contient :
📚 Ressources : Documents, PDF, supports de cours
📝 Devoirs : Travaux à rendre avec dates limites
📊 Notes : Vos résultats d'évaluations

💡 Astuce : Utilisez le tableau de bord pour voir rapidement vos cours du jour !`,
  },
  {
    articleId: 'download-resources',
    title: 'Télécharger les ressources de cours',
    description: 'Comment accéder et télécharger les supports pédagogiques.',
    category: 'cours',
    icon: 'ph:download-simple',
    readTime: 3,
    updatedAt: '2024-12-01',
    content: `Pour télécharger une ressource :

1. Accédez au cours souhaité
2. Cliquez sur l'onglet "Ressources"
3. Parcourez la liste des documents disponibles
4. Cliquez sur le bouton de téléchargement à côté du fichier

Types de ressources disponibles :
- 📄 Documents PDF (cours, exercices)
- 🎥 Vidéos de cours
- 📊 Présentations PowerPoint
- 📁 Archives ZIP (projets, code source)

💡 Les ressources sont organisées par chapitre ou par date de publication.`,
  },
  {
    articleId: 'submit-assignment',
    title: 'Soumettre un devoir',
    description: 'Guide complet pour rendre vos travaux en ligne.',
    category: 'cours',
    icon: 'ph:paper-plane-tilt',
    readTime: 5,
    updatedAt: '2024-12-01',
    content: `Pour soumettre un devoir :

1. Accédez au cours concerné
2. Cliquez sur l'onglet "Devoirs"
3. Sélectionnez le devoir à rendre 
4. Cliquez sur "Soumettre mon travail"
5. mettez le lien du fichier drive
6. Vérifiez le fichier uploadé
7. Cliquez sur "Envoyer"

⚠️ Points importants :
- Respectez la date limite (affichée en rouge si proche)
- Formats acceptés : drive (selon le devoir)
- Taille maximale : généralement 50 Mo
- Vous pouvez modifier votre soumission jusqu'à la date limite
`,
  },
  {
    articleId: 'view-assignment-feedback',
    title: 'Consulter les retours sur mes devoirs',
    description: 'Comment voir les notes et commentaires de vos enseignants.',
    category: 'cours',
    icon: 'ph:chat-circle-text',
    readTime: 2,
    updatedAt: '2024-12-01',
    content: `Pour voir les retours sur vos devoirs :

1. Accédez au cours concerné
2. Allez dans l'onglet "Devoirs"
3. Les devoirs notés affichent votre note
4. Cliquez sur le devoir pour voir :
   - Votre note détaillée
   - Les commentaires du professeur

💡 Vous recevez une notification `,
  },
  {
    articleId: 'live-courses',
    title: 'Assister à un cours en direct',
    description: 'Procédure pour rejoindre un cours en visioconférence.',
    category: 'cours',
    icon: 'ph:video-camera',
    readTime: 4,
    updatedAt: '2024-12-01',
    content: `Pour rejoindre un cours en direct :

1. Consultez votre emploi du temps pour voir les cours en ligne
2. À l'heure du cours, un bouton "Rejoindre" apparaît
3. Cliquez sur "Rejoindre le cours sur google Meet"
4. Autorisez l'accès à votre caméra/micro si demandé

Pendant le cours :
- 🎤 Coupez votre micro quand vous ne parlez pas
- 💬 Utilisez le chat pour poser des questions
- ✋ Levez la main virtuellement pour intervenir
- 📹 Activez votre caméra si demandé par l'enseignant

💡 Conseil : Testez votre connexion et votre matériel avant le cours !`,
  },
  {
    articleId: 'view-schedule',
    title: 'Consulter mon emploi du temps',
    description: 'Accédez à votre planning de cours hebdomadaire.',
    category: 'cours',
    icon: 'ph:calendar',
    readTime: 3,
    updatedAt: '2024-12-01',
    content: `Pour voir votre emploi du temps :

1. Dans le menu, cliquez sur "Emploi du temps"
2. L'affichage par semaine est par défaut
3. Naviguez entre les semaines avec les flèches

Chaque cours affiche :
- 📚 Nom du cours et du professeur
- 🕐 Horaires de début et fin
- 📍 Salle de cours
- 🏷️ Type (CM, TD, TP, Examen)

Fonctionnalités :
- Cliquez sur un cours pour plus de détails
- Exportez vers votre calendrier personnel
- Recevez des notifications de changements

💡 L'emploi du temps est mis à jour en temps réel en cas de modification.`,
  },
  {
    articleId: 'schedule-export',
    title: 'Exporter mon emploi du temps',
    description: 'Synchronisez votre planning avec Google Calendar ou autre.',
    category: 'cours',
    icon: 'ph:export',
    readTime: 2,
    updatedAt: '2024-12-01',
    content: `Pour exporter votre emploi du temps :

1. Allez dans "Emploi du temps"
2. Cliquez sur le bouton "Exporter"
3. Choisissez le format :
   - 📅 iCal (.ics) - Compatible avec tous les calendriers
   - 📱 Google Calendar - Synchronisation directe
   - 📋 PDF - Pour impression

Synchronisation automatique :
- Copiez le lien de flux iCal
- Ajoutez-le dans votre application de calendrier
- Les mises à jour seront automatiques !

💡 Pratique pour avoir votre emploi du temps sur votre smartphone.`,
  },

  // ========================================
  // DOCUMENTS ADMINISTRATIFS
  // ========================================
  {
    articleId: 'download-certificate',
    title: 'Demander mon attestation de scolarité',
    description: 'Obtenez votre certificat de scolarité en quelques clics.',
    category: 'documents',
    icon: 'ph:certificate',
    readTime: 2,
    updatedAt: '2024-12-01',
    content: `Pour obtenir votre attestation de scolarité :

1. Allez dans Paramètres > Documents
2. Cliquez sur "Attestation de scolarité"
4. Téléchargez ou imprimez le document

ℹ️ Informations sur le document :
- Valide pour l'année universitaire en cours
- Utilisable pour toutes démarches administratives
`,
  },
  {
    articleId: 'download-transcript',
    title: 'Télécharger mon relevé de notes',
    description: 'Accédez à vos relevés de notes officiels.',
    category: 'documents',
    icon: 'ph:file-text',
    readTime: 2,
    updatedAt: '2024-12-01',
    content: `Pour télécharger votre relevé de notes :

1. Allez dans Paramètres > Documents
2. Sélectionnez "Relevé de notes"
3. Choisissez le semestre ou l'année souhaitée
4. Cliquez sur "Télécharger"

Le relevé contient :
- Toutes vos notes par matière
- Vos moyennes par UE
- Votre moyenne générale
- Les crédits ECTS obtenus
- La mention obtenue (si applicable)

⚠️ Les relevés ne sont disponibles qu'après validation par le jury.`,
  },
  {
    articleId: 'administrative-request',
    title: 'Faire une demande administrative',
    description: "Comment soumettre une demande officielle à l'administration.",
    category: 'documents',
    icon: 'ph:envelope-simple',
    readTime: 4,
    updatedAt: '2024-12-01',
    content: `Pour faire une demande administrative :

1. Dans le menu, cliquez sur "Demandes administratives"
2. Cliquez sur "Nouvelle demande"
3. Sélectionnez le type de demande :
   - Attestation de scolarité
   - Relevé de notes
   - Lettre de recommandation
   - Certificat de stage
   - Autre demande

4. Remplissez le formulaire :
   - Objet de la demande
   - Motif détaillé
   - Documents justificatifs (si nécessaire)

5. Soumettez votre demande

📧 Vous recevrez un email de confirmation avec un numéro de suivi.
⏱️ Délai de traitement : généralement 3 à 5 jours ouvrés.`,
  },
  {
    articleId: 'track-request',
    title: 'Suivre mes demandes administratives',
    description: "Consultez l'état d'avancement de vos demandes.",
    category: 'documents',
    icon: 'ph:list-checks',
    readTime: 2,
    updatedAt: '2024-12-01',
    content: `Pour suivre vos demandes :

1. Allez dans "Demandes administratives"
2. Consultez la liste de vos demandes
3. Chaque demande affiche son statut :

États possibles :
🟡 En attente - Demande reçue, en cours de traitement
🔵 En cours - Demande prise en charge
🟢 Validée - Demande acceptée
🔴 Refusée - Demande rejetée (motif indiqué)
✅ Terminée - Document disponible au téléchargement

Cliquez sur une demande pour voir les détails et les éventuels commentaires de l'administration.`,
  },
  {
    articleId: 'update-personal-info',
    title: 'Mettre à jour mes informations personnelles',
    description: 'Comment modifier vos coordonnées et informations de profil.',
    category: 'documents',
    icon: 'ph:user-circle-gear',
    readTime: 3,
    updatedAt: '2024-12-01',
    content: `Pour modifier vos informations :

1. Cliquez sur votre avatar > Paramètres
2. Naviguez entre les onglets :

📋 Identité (lecture seule) :
- Nom, prénom, date de naissance
- Numéro étudiant, promotion
→ Pour modifier : contactez la scolarité

📞 Coordonnées (modifiable) :
- Adresse email secondaire
- Numéro de téléphone
- Adresse postale
- Contact d'urgence

📄 Documents :
- Photo de profil
- Pièce d'identité
- Justificatifs

💡 Gardez vos informations à jour pour recevoir les communications importantes !`,
  },
  {
    articleId: 'view-fees',
    title: 'Consulter mes frais de scolarité',
    description: "Visualisez vos échéances de paiement et l'historique.",
    category: 'documents',
    icon: 'ph:wallet',
    readTime: 3,
    updatedAt: '2024-12-01',
    content: `Pour consulter vos frais de scolarité :

1. Dans le menu, cliquez sur "Frais de scolarité"
2. Sélectionnez votre promotion/année

Vous verrez :
💰 Montant total des frais
📊 Échéancier de paiement
✅ Paiements effectués
⏳ Paiements en attente
❌ Paiements en retard

Pour chaque paiement :
- Date d'échéance
- Montant dû
- Statut du paiement
- Reçu téléchargeable (si payé)

⚠️ Un retard de paiement peut bloquer l'accès à certains services.`,
  },
  {
    articleId: 'payment-methods',
    title: 'Modes de paiement acceptés',
    description: 'Découvrez comment régler vos frais de scolarité.',
    category: 'documents',
    icon: 'ph:credit-card',
    readTime: 3,
    updatedAt: '2024-12-01',
    content: `Modes de paiement disponibles :

💳 Paiement en ligne :
- Carte bancaire (Visa, Mastercard)
- Mobile Money (MVola, Orange Money, Airtel Money)

🏦 Virement bancaire :
- RIB disponible dans votre espace
- Mentionnez votre numéro étudiant en référence

💵 Paiement sur place :
- Au service comptabilité de l'université
- Espèces ou chèque acceptés

📄 Pour chaque paiement :
- Un reçu est généré automatiquement
- Téléchargeable depuis votre espace
- Envoyé par email

💡 Conseil : Privilégiez le paiement en ligne pour un traitement plus rapide.`,
  },

  {
    articleId: 'emergency-contact',
    title: "Ajouter un contact d'urgence",
    description: "Renseignez une personne à contacter en cas d'urgence.",
    category: 'documents',
    icon: 'ph:phone-call',
    readTime: 2,
    updatedAt: '2024-12-01',
    content: `Pour ajouter un contact d'urgence :

1. Allez dans Paramètres > Coordonnées
2. Trouvez la section "Contact d'urgence"
3. Remplissez les informations :
   - Nom complet du contact
   - Lien de parenté (Père, Mère, Tuteur, Autre)
   - Numéro de téléphone (+261...)

⚠️ Ce contact sera alerté uniquement en cas d'urgence médicale ou situation grave.

💡 Conseil : Choisissez une personne facilement joignable et informez-la qu'elle est votre contact d'urgence.`,
  },

  // ========================================
  // NOTES & ÉVALUATIONS
  // ========================================
  {
    articleId: 'view-grades',
    title: 'Consulter mes notes',
    description: "Accédez à vos résultats d'évaluations et examens.",
    category: 'notes',
    icon: 'ph:chart-bar',
    readTime: 3,
    updatedAt: '2024-12-01',
    content: `Pour consulter vos notes :

1. Dans le menu, cliquez sur "Notes"
2. Sélectionnez votre promotion/année
3. Vos notes s'affichent par semestre

Informations disponibles :
📊 Notes par matière avec coefficient
📈 Moyenne par Unité d'Enseignement
🎯 Moyenne générale du semestre
📉 Classement (si activé)

Codes couleurs :
🟢 Note ≥ 14 : Très bien
🔵 Note ≥ 12 : Bien
🟡 Note ≥ 10 : Passable
🔴 Note < 10 : Insuffisant

💡 Les notes sont publiées après validation par les enseignants.`,
  },
  {
    articleId: 'view-qr-grades',
    title: 'Scanner le QR code de mes notes',
    description: 'Partagez vos résultats via QR code sécurisé.',
    category: 'notes',
    icon: 'ph:qr-code',
    readTime: 2,
    updatedAt: '2024-12-01',
    content: `Chaque relevé de notes possède un QR code unique :

Utilisation du QR code :
1. Affichez vos notes sur la plateforme
2. Cliquez sur "Afficher le QR code"
3. Le QR code peut être scanné pour vérifier l'authenticité

Ce QR code permet à un tiers de :
- Vérifier que le relevé est authentique
- Confirmer vos notes auprès de l'université
- Valider votre cursus académique

🔒 Le lien généré est sécurisé et temporaire.
💼 Idéal pour les candidatures et stages !`,
  },
  {
    articleId: 'exam-schedule',
    title: 'Consulter le calendrier des examens',
    description: 'Vérifiez les dates, heures et salles de vos examens.',
    category: 'notes',
    icon: 'ph:calendar-check',
    readTime: 3,
    updatedAt: '2024-12-01',
    content: `Pour voir votre calendrier d'examens :

1. Allez dans "Emploi du temps"
2. Les examens sont affichés en surbrillance
3. Cliquez sur un examen pour voir :
   - Date et heure exactes
   - Salle d'examen
   - Durée de l'épreuve
   - Documents autorisés
   - Consignes particulières

📅 Rappels automatiques :
- 1 semaine avant : email de rappel
- 48h avant : notification
- Le jour J : rappel sur le tableau de bord

⚠️ Présentez-vous 15 minutes avant le début de l'épreuve avec votre carte étudiant !`,
  },

  // ========================================
  // SUPPORT & AIDE
  // ========================================
  {
    articleId: 'delete-account',
    title: 'Supprimer mon compte',
    description: 'Procédure pour fermer définitivement votre compte.',
    category: 'auth',
    icon: 'ph:trash',
    readTime: 3,
    updatedAt: '2024-12-01',
    content: `La suppression de compte n'est pas disponible en ligne.

Pour fermer votre compte, vous devez :
1. Contacter le service de la scolarité
2. Fournir une demande écrite motivée
3. Présenter votre pièce d'identité

📍 Service Scolarité :
- Email : ${UnivesityInformation.emailScolarite}
- Téléphone : ${UnivesityInformation.phoneNumber}
- Horaires : Lundi-Vendredi 8h-16h

⚠️ Important :
- Réglez d'abord tous vos frais en attente
- Récupérez vos documents importants
- La suppression est définitive et irréversible

💡 Note : Vos données académiques sont conservées dans les archives de l'université conformément à la réglementation.`,
  },
  {
    articleId: 'contact-support',
    title: 'Contacter le support technique',
    description: "Comment obtenir de l'aide pour les problèmes techniques.",
    category: 'auth',
    icon: 'ph:headset',
    readTime: 2,
    updatedAt: '2024-12-01',
    content: `Besoin d'aide technique ? Plusieurs options s'offrent à vous :

💬 Chat en direct :
- Disponible du lundi au vendredi, 8h-18h
- Cliquez sur l'icône de chat en bas à droite

📧 Email :
- ${UnivesityInformation.emailContact}
- Réponse sous 24-48h ouvrées

🐛 Signaler un bug :
- Cliquez sur votre avatar > "Signaler un bug"
- Décrivez le problème avec des captures d'écran

📞 Téléphone (urgences) :
- +261 20 22 XXX XX
- Horaires : 8h-16h

💡 Pour un traitement plus rapide, indiquez :
- Votre numéro étudiant
- Le navigateur utilisé
- Une description détaillée du problème`,
  },
  {
    articleId: 'report-bug',
    title: 'Signaler un bug ou problème',
    description: 'Aidez-nous à améliorer la plateforme en signalant les erreurs.',
    category: 'auth',
    icon: 'ph:bug',
    readTime: 2,
    updatedAt: '2024-12-01',
    content: `Pour signaler un bug :

1. Cliquez sur votre avatar en haut à droite
2. Sélectionnez "Signaler un bug"
3. Remplissez le formulaire :
   - Type de problème
   - Description détaillée
   - Étapes pour reproduire le bug
   - Capture d'écran (recommandé)

📸 Comment faire une capture d'écran :
- Windows : touche "Impr écran" ou Win+Shift+S
- Mac : Cmd+Shift+4

💡 Plus votre description est précise, plus vite nous pourrons corriger le problème !

Merci de contribuer à l'amélioration de la plateforme ! 🙏`,
  },
]
