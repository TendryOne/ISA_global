# CHARTE D'UTILISATION DES SYSTÈMES INFORMATIQUES

## Institut Supérieur d'Ambatomirahavavy

**Date de dernière mise à jour :** 17 janvier 2026  
**Version :** 1.0

---

## PRÉAMBULE

La présente Charte définit les règles d'utilisation des systèmes informatiques et de la plateforme éducative de l'Institut Supérieur d'Ambatomirahavavy (ci-après "ISA" ou "l'Institut"). Elle s'applique à tous les utilisateurs : étudiants, professeurs, personnel administratif et technique.

Cette charte vise à :

- Garantir la sécurité et la disponibilité des systèmes informatiques
- Protéger les données personnelles et les informations sensibles
- Définir les droits et devoirs de chaque utilisateur
- Prévenir les usages abusifs ou illicites
- Sensibiliser aux bonnes pratiques numériques

L'acceptation de cette charte est obligatoire pour accéder aux ressources informatiques de l'ISA.

---

## ARTICLE 1 - CHAMP D'APPLICATION

### 1.1 Systèmes concernés

La présente charte s'applique à l'ensemble des ressources informatiques de l'ISA :

**Plateforme éducative :**

- Portail web : edu.isa-ambato.mg
- Système d'authentification (sessions sécurisées)
- Base de données MongoDB
- Stockage de fichiers (serveur local)
- Communication en temps réel (Socket.IO)

**Infrastructures :**

- Serveurs de l'établissement
- Équipements réseau (routeurs, switches, Wi-Fi)
- Postes de travail et ordinateurs en libre-service
- Salles informatiques
- Bibliothèque numérique

**Services en ligne :**

- Messagerie électronique institutionnelle (@isa-ambato.mg si applicable)
- Espaces de stockage cloud (si mis en place)
- Outils collaboratifs

### 1.2 Utilisateurs concernés

**Étudiants :**

- Inscrits régulièrement à l'ISA
- Disposant d'un matricule et d'identifiants valides

**Enseignants :**

- Professeurs permanents et vacataires
- Intervenants extérieurs autorisés

**Personnel administratif :**

- Administrateurs de la plateforme
- Super administrateurs
- Personnel de scolarité et comptabilité

**Personnel technique :**

- Informaticiens et techniciens réseau
- Support technique

### 1.3 Caractère obligatoire

L'acceptation de cette charte est **obligatoire** lors de la première connexion à la plateforme. L'utilisateur reconnaît en avoir pris connaissance et s'engage à la respecter.

---

## ARTICLE 2 - DROITS D'ACCÈS ET IDENTIFIANTS

### 2.1 Attribution des identifiants

**Pour les étudiants :**

- **Matricule unique** généré automatiquement lors de l'inscription (format : ISA-XXXX-XXXXX)
- **Mot de passe temporaire** envoyé par email
- **Obligation** de modifier le mot de passe lors de la première connexion

**Pour les enseignants :**

- Identifiants créés par l'administration après validation du dossier
- Matricule et mot de passe transmis de manière sécurisée

**Pour les administrateurs :**

- Comptes créés uniquement par les super administrateurs
- Droits d'accès définis selon le niveau (admin / super admin)

### 2.2 Responsabilité des identifiants

L'utilisateur est personnellement responsable de :

- **La confidentialité** de ses identifiants (matricule et mot de passe)
- **La sécurité** de son compte
- **Toutes les actions** effectuées depuis son compte

**Interdictions formelles :**

- ❌ Partager ses identifiants avec un tiers
- ❌ Utiliser les identifiants d'un autre utilisateur
- ❌ Laisser sa session ouverte sur un ordinateur partagé
- ❌ Noter son mot de passe sur un support non sécurisé
- ❌ Communiquer son mot de passe par email ou message

### 2.3 Exigences de sécurité du mot de passe

**Critères obligatoires :**

- Longueur minimale : **8 caractères**
- Au moins **1 majuscule**
- Au moins **1 minuscule**
- Au moins **1 chiffre**
- Caractères spéciaux recommandés (@, #, !, etc.)

**Bonnes pratiques :**

- Utiliser un mot de passe unique (non réutilisé sur d'autres sites)
- Modifier régulièrement son mot de passe (tous les 6 mois recommandé)
- Ne pas utiliser d'informations personnelles évidentes (date de naissance, nom)
- Utiliser un gestionnaire de mots de passe si nécessaire

**Stockage sécurisé :**

- Les mots de passe sont chiffrés avec l'algorithme **bcrypt** (hash + salt)
- Ils ne sont **jamais stockés en clair** dans la base de données
- Même les administrateurs ne peuvent voir votre mot de passe

### 2.4 Réinitialisation de mot de passe

**Mot de passe oublié :**

- Utiliser la fonction "Mot de passe oublié" sur la page de connexion
- Un lien de réinitialisation est envoyé à l'adresse email enregistrée
- Le lien est valable **24 heures** uniquement
- Un nouveau mot de passe doit être défini

**Compte bloqué :**

- Après **5 tentatives de connexion échouées**, le compte est temporairement bloqué
- Attendre **15 minutes** ou contacter l'administration : support@isa-ambato.mg

### 2.5 Signalement d'utilisation suspecte

En cas d'utilisation non autorisée de votre compte :

- **Modifier immédiatement** votre mot de passe
- **Signaler** l'incident à : support@isa-ambato.mg ou dpo@isa-ambato.mg
- L'administration procèdera à une enquête et prendra les mesures nécessaires

---

## ARTICLE 3 - UTILISATION DE LA PLATEFORME ÉDUCATIVE

### 3.1 Finalités d'utilisation

La plateforme éducative est destinée **exclusivement** aux activités pédagogiques, académiques et administratives :

**Activités autorisées :**

- ✅ Consultation des emplois du temps
- ✅ Accès aux ressources pédagogiques (cours, TD, exercices)
- ✅ Soumission de devoirs, projets et examens
- ✅ Consultation des notes et relevés
- ✅ Gestion des frais de scolarité (consultation, justification de paiement)
- ✅ Communication avec les enseignants et l'administration
- ✅ Demandes administratives (attestations, certificats)
- ✅ Signalement de problèmes techniques

**Pour les enseignants en plus :**

- ✅ Création et gestion de modules
- ✅ Publication de ressources pédagogiques
- ✅ Création de devoirs et examens
- ✅ Notation des étudiants
- ✅ Gestion des emplois du temps

**Pour les administrateurs en plus :**

- ✅ Gestion des comptes utilisateurs
- ✅ Validation des préinscriptions
- ✅ Configuration du système
- ✅ Consultation des statistiques

### 3.2 Usages interdits

Il est **strictement interdit** d'utiliser la plateforme pour :

**Activités illicites :**

- ❌ Violation de la législation en vigueur
- ❌ Diffusion de contenus pédopornographiques
- ❌ Incitation à la haine, au racisme, à la violence
- ❌ Contrefaçon, piratage, violation de droits d'auteur
- ❌ Usurpation d'identité
- ❌ Harcèlement, cyberharcèlement

**Activités malveillantes :**

- ❌ Diffusion de virus, malwares, ransomwares, trojans
- ❌ Tentative de piratage (hacking, cracking)
- ❌ Exploitation de failles de sécurité
- ❌ Attaques par déni de service (DDoS)
- ❌ Injection de code malveillant (SQL injection, XSS, etc.)
- ❌ Tentative d'accès à des données non autorisées

**Activités abusives :**

- ❌ Utilisation commerciale ou publicitaire non autorisée
- ❌ Spam (envoi massif de messages)
- ❌ Extraction massive de données (scraping, crawling)
- ❌ Surcharge volontaire du système
- ❌ Création de faux comptes
- ❌ Utilisation de bots ou scripts automatisés non autorisés

**Contenus inappropriés :**

- ❌ Contenus pornographiques ou à caractère sexuel explicite
- ❌ Contenus violents, choquants ou dégradants
- ❌ Contenus discriminatoires (racisme, sexisme, homophobie, etc.)
- ❌ Propos diffamatoires, injurieux ou calomnieux
- ❌ Apologie du terrorisme ou de crimes

### 3.3 Respect de la propriété intellectuelle

**Contenus mis à disposition par l'ISA :**

- Les cours, documents, vidéos et ressources sont protégés par le **droit d'auteur**
- L'utilisateur dispose d'un **droit d'usage personnel** à des fins d'apprentissage uniquement
- **Interdictions :**
  - Reproduire, copier ou diffuser sans autorisation
  - Vendre ou commercialiser les contenus
  - Publier sur internet (réseaux sociaux, forums, sites de partage)
  - Modifier ou altérer les contenus originaux

**Contenus créés par l'utilisateur :**

- L'utilisateur conserve la propriété intellectuelle de ses créations (devoirs, projets, mémoires)
- En soumettant un contenu, l'utilisateur accorde à l'ISA une licence d'utilisation à des fins pédagogiques, d'évaluation et d'archivage
- L'utilisateur garantit être l'auteur légitime ou avoir les autorisations nécessaires

**Sanctions en cas de violation :**

- Suppression du contenu illicite
- Suspension ou fermeture du compte
- Poursuites civiles et/ou pénales

---

## ARTICLE 4 - PROTECTION DES DONNÉES PERSONNELLES

### 4.1 Données collectées

La plateforme collecte et traite des données personnelles conformément à la **Politique de Confidentialité** de l'ISA :

- Données d'identité (nom, prénom, matricule, CIN)
- Coordonnées (adresse, email, téléphone)
- Photo d'identité
- Données académiques (notes, parcours, diplômes)
- Données financières (paiements, échéances)
- Données de connexion (logs, adresse IP, sessions)

### 4.2 Finalités du traitement

Ces données sont utilisées pour :

- La gestion administrative et pédagogique
- L'authentification et la sécurité
- La communication avec les utilisateurs
- La génération de documents officiels
- L'amélioration des services

### 4.3 Droits des utilisateurs

Conformément à la réglementation, chaque utilisateur dispose :

- Du **droit d'accès** à ses données personnelles
- Du **droit de rectification** des données inexactes
- Du **droit à l'effacement** (sous conditions)
- Du **droit d'opposition** au traitement
- Du **droit à la portabilité** de ses données

**Pour exercer vos droits :** dpo@isa-ambato.mg

### 4.4 Sécurité des données

L'ISA met en œuvre des mesures techniques et organisationnelles pour protéger les données :

- **Chiffrement** des mots de passe (bcrypt)
- **Sessions sécurisées** (cookies HttpOnly, SameSite)
- **Sauvegardes régulières** de la base de données
- **Contrôle d'accès** basé sur les rôles
- **Surveillance** des activités suspectes
- **Formation** du personnel aux bonnes pratiques

### 4.5 Confidentialité

Les utilisateurs ayant accès aux données personnelles d'autrui (enseignants, administrateurs) s'engagent à :

- Ne pas divulguer ces informations à des tiers non autorisés
- Ne pas utiliser ces données à des fins personnelles
- Respecter la vie privée des autres utilisateurs
- Signaler toute violation de confidentialité

---

## ARTICLE 5 - SÉCURITÉ INFORMATIQUE

### 5.1 Obligations de sécurité

Chaque utilisateur doit :

- **Protéger** ses identifiants de connexion
- **Se déconnecter** après chaque session (bouton "Déconnexion")
- **Verrouiller** son écran en cas d'absence (Ctrl+Alt+Suppr ou Windows+L)
- **Maintenir à jour** son système d'exploitation et son navigateur
- **Utiliser un antivirus** et un pare-feu sur son équipement personnel
- **Signaler** immédiatement tout incident de sécurité

### 5.2 Détection et prévention des menaces

**Mesures en place :**

- Limitation des tentatives de connexion (**5 échecs = blocage 15 min**)
- Détection des comportements suspects (connexions depuis plusieurs IP simultanées)
- Journalisation des actions critiques (logs)
- Validation des fichiers téléchargés (extension, taille, type MIME)
- Protection contre les attaques par injection (requêtes paramétrées)
- Rate limiting (limitation du nombre de requêtes par utilisateur)

**Signaux d'alerte :**

- Connexion depuis un lieu inhabituel
- Modification non sollicitée du mot de passe
- Activité anormale sur le compte
- Emails de réinitialisation non demandés

### 5.3 Gestion des fichiers

**Fichiers téléchargés (upload) :**

- Taille maximale : **[à définir, ex: 10 Mo pour devoirs, 50 Mo pour projets]**
- Formats autorisés : PDF, DOCX, XLSX, PPTX, JPG, PNG, ZIP
- **Interdictions :**
  - Fichiers exécutables (.exe, .bat, .sh, .cmd)
  - Scripts potentiellement dangereux (.js, .vbs, .ps1)
  - Archives contenant des exécutables
  - Fichiers contenant des macros suspectes

**Stockage :**

- Les fichiers sont stockés sur le serveur local dans des dossiers sécurisés
- Seuls les utilisateurs autorisés peuvent accéder à leurs fichiers
- Les fichiers sensibles (documents d'identité, preuves de paiement) sont stockés dans `/private/`

**Responsabilité :**

- L'utilisateur est responsable du contenu des fichiers qu'il télécharge
- Il doit s'assurer que ses fichiers ne contiennent pas de virus ou malwares
- L'ISA se réserve le droit de scanner et supprimer tout fichier suspect

### 5.4 Navigation sécurisée

**Bonnes pratiques :**

- Utiliser une connexion **HTTPS** (cadenas dans la barre d'adresse)
- Vérifier l'URL du site : **edu.isa-ambato.mg**
- Ne jamais cliquer sur des liens suspects reçus par email
- Ne pas entrer ses identifiants sur un site non officiel (phishing)
- Utiliser un réseau sécurisé (éviter les Wi-Fi publics non protégés)

**Détection de phishing :**

- L'ISA n'envoie jamais d'emails demandant votre mot de passe
- Les emails officiels proviennent uniquement de **@isa-ambato.mg**
- En cas de doute, contacter directement l'administration

---

## ARTICLE 6 - UTILISATION DES ÉQUIPEMENTS INFORMATIQUES

### 6.1 Salles informatiques et postes en libre-service

**Accès :**

- Réservé aux étudiants et personnels de l'ISA
- Carte d'étudiant ou badge requis
- Respect des horaires d'ouverture

**Règles d'utilisation :**

- ✅ Utiliser les équipements avec soin
- ✅ Signaler immédiatement tout dysfonctionnement
- ✅ Respecter le silence et la concentration des autres
- ❌ Ne pas modifier la configuration des postes
- ❌ Ne pas déplacer les équipements
- ❌ Ne pas installer de logiciels sans autorisation
- ❌ Ne pas brancher de clés USB non vérifiées (risque de virus)
- ❌ Ne pas consommer de nourriture ou boissons à proximité

**Réservation :**

- Certaines salles peuvent nécessiter une réservation préalable
- Durée maximale par session : [à définir, ex: 2 heures]
- Priorité aux activités pédagogiques

### 6.2 Réseau Wi-Fi de l'établissement

**SSID officiel :** ISA-WiFi (ou nom à définir)

**Conditions d'accès :**

- Connexion avec identifiants personnels (matricule/mot de passe)
- Utilisation réservée aux activités académiques
- Respect de la bande passante (pas de téléchargement massif)

**Usages interdits :**

- ❌ Partage de connexion avec des personnes extérieures
- ❌ Téléchargement illégal (torrents, streaming pirate)
- ❌ Contournement des filtres de sécurité (VPN non autorisés)
- ❌ Activités consommant excessivement de bande passante (jeux en ligne, streaming HD prolongé)

**Surveillance :**

- Le trafic réseau peut être surveillé pour des raisons de sécurité
- Les journaux de connexion (logs) sont conservés conformément à la loi

### 6.3 Équipements personnels (BYOD - Bring Your Own Device)

Les utilisateurs peuvent utiliser leurs équipements personnels (laptop, tablette, smartphone) pour accéder à la plateforme éducative.

**Responsabilité :**

- L'utilisateur est seul responsable de son matériel
- L'ISA n'assure pas de support technique sur les équipements personnels
- En cas de vol ou dommage, l'ISA décline toute responsabilité

**Recommandations :**

- Installer un antivirus à jour
- Activer le pare-feu
- Maintenir le système à jour
- Sauvegarder régulièrement les données importantes

---

## ARTICLE 7 - NOTIFICATIONS ET COMMUNICATIONS

### 7.1 Notifications en temps réel

La plateforme utilise **Socket.IO** pour envoyer des notifications en temps réel :

- Modifications d'emploi du temps
- Publication de notes
- Rappels de paiement
- Annonces importantes
- Réclamations traitées

**Obligation de consultation :**

- L'utilisateur doit consulter régulièrement ses notifications (minimum 3 fois par semaine)
- Il ne peut invoquer la non-consultation pour justifier un manquement

### 7.2 Emails institutionnels

Les communications officielles sont envoyées aux adresses email enregistrées :

- **Étudiants :** Email personnel fourni lors de l'inscription
- **Enseignants :** Email professionnel ou personnel
- **Administrateurs :** Email institutionnel @isa-ambato.mg

**Expéditeurs officiels :**

- support@isa-ambato.mg
- admission@isa-ambato.mg
- scolarite@isa-ambato.mg
- noreply@isa-ambato.mg (emails automatiques)

**Obligations :**

- Maintenir une adresse email valide et consultée régulièrement
- Signaler tout changement d'adresse email
- Vérifier régulièrement les dossiers "Spam" ou "Courrier indésirable"

### 7.3 Messagerie interne (si applicable)

Si une messagerie interne est mise en place sur la plateforme :

- Utilisation professionnelle et respectueuse
- Pas de spam, pas de harcèlement
- Temps de réponse raisonnable (48-72h pour les enseignants/admins)

---

## ARTICLE 8 - TRAÇABILITÉ ET JOURNALISATION

### 8.1 Logs et traçabilité

Pour des raisons de sécurité, de maintenance et de prévention des abus, l'ISA conserve des journaux (logs) des activités suivantes :

- **Connexions** : date, heure, adresse IP, matricule
- **Actions critiques** : modifications de compte, soumissions de devoirs, paiements
- **Erreurs système** : bugs, crashs, accès refusés
- **Tentatives d'intrusion** : échecs de connexion répétés, accès non autorisés

### 8.2 Durée de conservation des logs

- **Logs de connexion** : 1 an
- **Logs d'actions critiques** : 5 ans
- **Logs de sécurité** : 3 ans
- Puis suppression automatique ou anonymisation

### 8.3 Utilisation des logs

Les logs peuvent être utilisés pour :

- Diagnostiquer des problèmes techniques
- Détecter et prévenir les intrusions
- Répondre à une réquisition judiciaire
- Prouver une action en cas de litige

**Confidentialité :**

- L'accès aux logs est strictement réservé aux administrateurs autorisés
- Les logs ne sont jamais vendus ou partagés à des fins commerciales

---

## ARTICLE 9 - SIGNALEMENT ET SUPPORT TECHNIQUE

### 9.1 Signalement de bugs

La plateforme dispose d'un outil de signalement de bugs accessible à tous les utilisateurs.

**Informations à fournir :**

- **Titre** : Description courte et claire
- **Description** : Étapes pour reproduire le bug
- **Type** : technique, fonctionnel, sécurité, autre
- **Priorité** : basse, moyenne, haute, critique

**Limitation :**

- 1 signalement toutes les **15 minutes** (pour éviter le spam)

**Traitement :**

- Les bugs critiques (sécurité, perte de données) sont traités en priorité
- Délai de réponse : 24-48h pour les bugs critiques, 5-7 jours pour les autres
- Statut consultable : en cours, résolu, rejeté

### 9.2 Support technique

**Canaux de support :**

- 📧 **Email :** support@isa-ambato.mg
- 📞 **Téléphone :** +261 34 08 123 45
- 🌐 **Plateforme :** Outil de signalement intégré

**Horaires :** Lundi-Vendredi, 8h-16h

**Délai de réponse :**

- Problème bloquant (impossibilité de connexion) : **24h**
- Problème non bloquant : **48-72h**

**Informations à fournir :**

- Matricule
- Description du problème
- Captures d'écran si possible
- Navigateur et système d'exploitation utilisés

---

## ARTICLE 10 - SANCTIONS

### 10.1 Manquements sanctionnés

Constituent des manquements à la présente charte :

- Utilisation non conforme de la plateforme
- Violation de la sécurité (partage d'identifiants, tentative d'intrusion)
- Diffusion de contenus illicites ou inappropriés
- Non-respect de la propriété intellectuelle
- Harcèlement ou comportement abusif
- Utilisation commerciale non autorisée

### 10.2 Sanctions applicables

Selon la gravité du manquement, les sanctions peuvent être :

**Sanctions techniques :**

1. **Avertissement** par email
2. **Suspension temporaire** du compte (de 3 à 30 jours)
3. **Restriction d'accès** (consultation seule, sans droit de soumission)
4. **Fermeture définitive** du compte

**Sanctions disciplinaires (pour les étudiants) :**

1. Avertissement écrit
2. Blâme
3. Exclusion temporaire de l'établissement
4. Exclusion définitive

**Sanctions administratives (pour le personnel) :**

1. Avertissement écrit
2. Mise à pied
3. Licenciement (cas graves)

**Sanctions pénales :**

- En cas d'infraction pénale (piratage, diffusion de contenus illicites, harcèlement), l'ISA se réserve le droit de porter plainte auprès des autorités compétentes.

### 10.3 Procédure

Avant toute sanction (hors suspension d'urgence pour sécurité), l'utilisateur est :

- **Informé** des faits reprochés
- **Entendu** pour s'expliquer (audition ou réponse écrite)
- **Notifié** de la décision par écrit

---

## ARTICLE 11 - CONTINUITÉ DE SERVICE

### 11.1 Disponibilité

L'ISA s'efforce de maintenir la plateforme accessible **24h/24, 7j/7**, mais ne peut garantir une disponibilité absolue.

**Causes d'interruption :**

- Maintenance programmée (notification préalable dans la mesure du possible)
- Incident technique (panne serveur, problème réseau)
- Attaque informatique (DDoS, piratage)
- Cas de force majeure (catastrophe naturelle, coupure électrique prolongée)

### 11.2 Maintenance

**Maintenance programmée :**

- Les utilisateurs sont informés **au moins 48 heures à l'avance**
- Privilégiée en dehors des heures de forte activité (nuit, week-end)
- Durée estimée communiquée

**Maintenance d'urgence :**

- Peut être effectuée sans préavis en cas de faille de sécurité critique
- Notification a posteriori

### 11.3 Sauvegarde des données

**Sauvegardes régulières :**

- Base de données : **quotidienne**
- Fichiers utilisateurs : **hebdomadaire**
- Rétention : 30 jours minimum

**Responsabilité de l'utilisateur :**

- Il est recommandé de conserver une copie locale de ses travaux importants
- L'ISA ne peut être tenu responsable de la perte de données en cas de force majeure

---

## ARTICLE 12 - ÉVOLUTION DE LA CHARTE

### 12.1 Modifications

L'ISA se réserve le droit de modifier la présente charte à tout moment pour :

- S'adapter aux évolutions technologiques
- Se conformer à de nouvelles réglementations
- Améliorer la sécurité
- Clarifier certaines dispositions

### 12.2 Notification

Toute modification substantielle est notifiée aux utilisateurs par :

- Notification sur la plateforme
- Email
- **Au moins 15 jours** avant l'entrée en vigueur

### 12.3 Acceptation

La poursuite de l'utilisation de la plateforme après modification vaut acceptation de la nouvelle version de la charte.

---

## ARTICLE 13 - SENSIBILISATION ET FORMATION

### 13.1 Formation initiale

Tous les nouveaux utilisateurs (étudiants, enseignants, personnels) reçoivent une **formation initiale** sur :

- L'utilisation de la plateforme
- Les bonnes pratiques de sécurité
- Le respect de la charte

### 13.2 Sensibilisation continue

L'ISA organise régulièrement :

- Des campagnes de sensibilisation à la cybersécurité
- Des ateliers sur la protection des données personnelles
- Des tutoriels et guides d'utilisation

### 13.3 Ressources disponibles

- **FAQ** : Questions fréquentes sur la plateforme
- **Tutoriels vidéo** : Guides pas à pas
- **Documentation** : Manuels utilisateur téléchargeables
- **Support technique** : Assistance personnalisée

---

## ARTICLE 14 - DISPOSITIONS FINALES

### 14.1 Liens avec d'autres documents

La présente charte complète :

- Les **Conditions Générales d'Utilisation (CGU)**
- La **Politique de Confidentialité**
- Le **Contrat d'Engagement Étudiant** (pour les étudiants)
- Le **Règlement Intérieur** de l'ISA

En cas de contradiction, les dispositions les plus protectrices de l'utilisateur s'appliquent.

### 14.2 Droit applicable

La présente charte est régie par le **droit malgache**, notamment :

- La loi sur la protection des données personnelles
- La loi sur la cybercriminalité
- La loi sur la propriété intellectuelle

### 14.3 Résolution des litiges

En cas de litige relatif à l'interprétation ou l'application de cette charte :

1. **Règlement amiable** : Contact avec l'administration (support@isa-ambato.mg)
2. **Médiation** : Possibilité de recourir à une médiation
3. **Juridiction** : Tribunaux compétents de Madagascar

---

## RÉSUMÉ DES BONNES PRATIQUES

### ✅ SÉCURITÉ

- Mot de passe fort et unique
- Déconnexion après chaque session
- Pas de partage d'identifiants
- Signalement immédiat d'incident

### ✅ UTILISATION

- Usage conforme (pédagogique et administratif uniquement)
- Respect de la propriété intellectuelle
- Pas de contenus illicites ou inappropriés
- Consultation régulière des notifications

### ✅ COMPORTEMENT

- Respect envers tous les utilisateurs
- Communication professionnelle et courtoise
- Pas de harcèlement ni de discrimination
- Signalement des abus

### ✅ DONNÉES

- Maintien à jour des informations personnelles
- Respect de la vie privée d'autrui
- Consentement au traitement des données
- Exercice des droits (accès, rectification, etc.)

### ✅ ÉQUIPEMENTS

- Utilisation soignée du matériel
- Pas de modification non autorisée
- Signalement des dysfonctionnements
- Respect des règles des salles informatiques

---

## CONTACT ET QUESTIONS

Pour toute question concernant cette charte :

**Institut Supérieur d'Ambatomirahavavy**

📧 **Email :**

- Support technique : support@isa-ambato.mg
- Protection des données : dpo@isa-ambato.mg
- Général : mail@isa-ambato.mg

📞 **Téléphone :** +261 34 08 123 45

🌐 **Sites web :**

- Institutionnel : www.isa-ambato.mg
- Plateforme éducative : edu.isa-ambato.mg

📍 **Adresse :** Ambatomirahavavy, Madagascar

⏰ **Horaires :** Lundi-Vendredi, 8h-16h

---

**Date d'entrée en vigueur :** 17 janvier 2026  
**Version :** 1.0

---

## ENGAGEMENT DE L'UTILISATEUR

**Je soussigné(e), [Nom et Prénom], matricule [XXXXX], déclare :**

✅ Avoir lu et compris l'intégralité de la Charte d'Utilisation des Systèmes Informatiques de l'ISA

✅ M'engager à respecter l'ensemble des dispositions de cette charte

✅ Être informé(e) des sanctions applicables en cas de manquement

✅ Comprendre mes droits et devoirs en tant qu'utilisateur des systèmes informatiques

✅ Accepter la traçabilité de mes activités à des fins de sécurité et de maintenance

---

_L'acceptation de cette charte est enregistrée électroniquement lors de votre première connexion à la plateforme éducative. Cette acceptation a valeur d'engagement contractuel._

---

**🔐 Ensemble, construisons un environnement numérique sûr, respectueux et performant !**
