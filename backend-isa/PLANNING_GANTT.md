# PLANNING DE GANTT

## Plateforme de Gestion Académique et Administrative – ISA Ambato

**Durée totale du projet :** 26 semaines (≈ 6 mois)
**Date de début :** 7 avril 2025
**Date de fin :** 7 octobre 2025
**Équipe :** Chef de projet + 1 Développeur Full-stack

---

## 1. DÉCOMPOSITION DES TÂCHES (WBS)

### Phase 1 : Analyse et Spécifications (3 semaines)

| ID  | Tâche                                         | Durée   | Responsable                   |
| --- | --------------------------------------------- | ------- | ----------------------------- |
| 1.1 | Analyse de l'existant et étude de faisabilité | 4 jours | Chef de projet + Développeur  |
| 1.2 | Identification des besoins fonctionnels       | 4 jours | Chef de projet + Utilisateurs |
| 1.3 | Identification des besoins techniques         | 3 jours | Développeur                   |
| 1.4 | Rédaction du cahier des charges               | 4 jours | Chef de projet                |
| 1.5 | Validation du cahier des charges              | 2 jours | Direction + Commanditaire     |

### Phase 2 : Conception (3 semaines)

| ID  | Tâche                                 | Durée   | Responsable                  |
| --- | ------------------------------------- | ------- | ---------------------------- |
| 2.1 | Conception de l'architecture globale  | 3 jours | Développeur                  |
| 2.2 | Modélisation de la base de données    | 2 jours | Développeur                  |
| 2.3 | Conception des API REST               | 2 jours | Développeur                  |
| 2.4 | Création des maquettes (wireframes)   | 3 jours | Développeur                  |
| 2.5 | Définition des workflows utilisateurs | 2 jours | Chef de projet + Développeur |
| 2.6 | Validation de la conception           | 1 jour  | Chef de projet + Développeur |

### Phase 3 : Développement Backend (8 semaines)

| ID   | Tâche                                               | Durée   | Responsable |
| ---- | --------------------------------------------------- | ------- | ----------- |
| 3.1  | Configuration de l'environnement (Node.js, MongoDB) | 2 jours | Développeur |
| 3.2  | Mise en place de la base de données                 | 3 jours | Développeur |
| 3.3  | Développement module Authentification               | 4 jours | Développeur |
| 3.4  | Développement module Gestion des utilisateurs       | 5 jours | Développeur |
| 3.5  | Développement module Gestion académique             | 5 jours | Développeur |
| 3.6  | Développement module Emploi du temps                | 4 jours | Développeur |
| 3.7  | Développement module Pédagogie (devoirs, notes)     | 5 jours | Développeur |
| 3.8  | Développement module Gestion administrative         | 4 jours | Développeur |
| 3.9  | Développement module Gestion financière             | 4 jours | Développeur |
| 3.10 | Développement système de notifications              | 3 jours | Développeur |
| 3.11 | Développement génération de documents PDF           | 3 jours | Développeur |
| 3.12 | Mise en place des tâches CRON                       | 2 jours | Développeur |
| 3.13 | Tests unitaires et d'intégration Backend            | 4 jours | Développeur |

### Phase 4 : Développement Frontend (8 semaines - après Backend)

| ID   | Tâche                                                  | Durée    | Responsable |
| ---- | ------------------------------------------------------ | -------- | ----------- |
| 4.1  | Configuration de l'environnement Vue.js                | 2 jours  | Développeur |
| 4.2  | Mise en place du système de routing                    | 1 jour   | Développeur |
| 4.3  | Développement composants communs (navbar, sidebar)     | 3 jours  | Développeur |
| 4.4  | Développement pages d'authentification                 | 3 jours  | Développeur |
| 4.5  | Développement interface Étudiant                       | 8 jours  | Développeur |
| 4.6  | Développement interface Professeur                     | 6 jours  | Développeur |
| 4.7  | Développement interface Administrateur                 | 10 jours | Développeur |
| 4.8  | Intégration des API Backend                            | 5 jours  | Développeur |
| 4.9  | Mise en place des notifications temps réel (Socket.io) | 2 jours  | Développeur |
| 4.10 | Responsive design et optimisation mobile               | 4 jours  | Développeur |
| 4.11 | Tests d'interface et corrections                       | 3 jours  | Développeur |

### Phase 5 : Tests et Validation (2 semaines)

| ID  | Tâche                                | Durée   | Responsable                       |
| --- | ------------------------------------ | ------- | --------------------------------- |
| 5.1 | Tests fonctionnels globaux           | 3 jours | Développeur + Chef de projet      |
| 5.2 | Tests d'intégration Frontend-Backend | 2 jours | Développeur                       |
| 5.3 | Tests de performance et charge       | 2 jours | Développeur                       |
| 5.4 | Tests de sécurité                    | 2 jours | Développeur                       |
| 5.5 | Tests utilisateurs (UAT)             | 3 jours | Utilisateurs finaux + Développeur |
| 5.6 | Correction des bugs identifiés       | 3 jours | Développeur                       |
| 5.7 | Validation finale                    | 1 jour  | Chef de projet + Direction        |

### Phase 6 : Déploiement et Formation (1 semaine)

| ID  | Tâche                                  | Durée   | Responsable                  |
| --- | -------------------------------------- | ------- | ---------------------------- |
| 6.1 | Configuration du serveur de production | 1 jour  | Développeur                  |
| 6.2 | Déploiement de l'application           | 1 jour  | Développeur                  |
| 6.3 | Migration des données initiales        | 1 jour  | Développeur                  |
| 6.4 | Formation des administrateurs          | 1 jour  | Chef de projet + Développeur |
| 6.5 | Formation des professeurs              | 1 jour  | Chef de projet + Développeur |
| 6.6 | Rédaction documentation utilisateur    | 2 jours | Chef de projet               |
| 6.7 | Mise en production                     | 1 jour  | Développeur + Chef de projet |

---

## 2. DIAGRAMME DE GANTT (Vue globale)

```
Semaines →        1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28
                  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │  │
════════════════════════════════════════════════════════════════════════════════════════════════════════

Phase 1: Analyse  █████████
                  │  │  │
Phase 2: Conception  █████████
                           │  │  │
Phase 3: Backend              ████████████████████████████████
                                                           │  │  │
Phase 4: Frontend                                            ████████████████████████████████
                                                                                         │  │  │
Phase 5: Tests                                                                             █████████
                                                                                                │  │  │
Phase 6: Déploiement                                                                              █████████

Note: Le développement Frontend commence après le Backend (développeur unique)
```

---

## 3. PLANNING DÉTAILLÉ PAR SEMAINE

### Avril 2025

| Semaine | Dates        | Phase              | Activités principales                             |
| ------- | ------------ | ------------------ | ------------------------------------------------- |
| S1      | 7-13 avr     | Analyse            | Étude de l'existant, collecte des besoins         |
| S2      | 14-20 avr    | Analyse            | Identification besoins fonctionnels et techniques |
| S3      | 21-27 avr    | Analyse/Conception | Rédaction cahier des charges, validation          |
| S4      | 28 avr-4 mai | Conception         | Architecture système, modélisation BDD            |

### Mai 2025

| Semaine | Dates         | Phase                 | Activités principales                      |
| ------- | ------------- | --------------------- | ------------------------------------------ |
| S5      | 5-11 mai      | Conception            | Conception API, maquettes                  |
| S6      | 12-18 mai     | Conception            | Workflows, validation conception           |
| S7      | 19-25 mai     | Développement Backend | Setup environnement, BDD, authentification |
| S8      | 26 mai-1 juin | Développement Backend | Gestion utilisateurs                       |

### Juin 2025

| Semaine | Dates      | Phase                 | Activités principales      |
| ------- | ---------- | --------------------- | -------------------------- |
| S9      | 2-8 juin   | Développement Backend | Modules académiques        |
| S10     | 9-15 juin  | Développement Backend | Emploi du temps            |
| S11     | 16-22 juin | Développement Backend | Pédagogie (devoirs, notes) |
| S12     | 23-29 juin | Développement Backend | Gestion administrative     |

### Juillet 2025

| Semaine | Dates          | Phase                  | Activités principales                     |
| ------- | -------------- | ---------------------- | ----------------------------------------- |
| S13     | 30 juin-6 juil | Développement Backend  | Gestion financière                        |
| S14     | 7-13 juil      | Développement Backend  | Notifications, génération PDF             |
| S15     | 14-20 juil     | Développement Backend  | CRON, finalisation API, tests Backend     |
| S16     | 21-27 juil     | Développement Frontend | Setup Vue.js, routing, composants communs |

### Août 2025

| Semaine | Dates          | Phase                  | Activités principales                 |
| ------- | -------------- | ---------------------- | ------------------------------------- |
| S17     | 28 juil-3 août | Développement Frontend | Pages authentification, dashboard     |
| S18     | 4-10 août      | Développement Frontend | Interface étudiant (cours, devoirs)   |
| S19     | 11-17 août     | Développement Frontend | Interface étudiant (notes, paiements) |
| S20     | 18-24 août     | Développement Frontend | Interface professeur                  |

### Septembre 2025

| Semaine | Dates           | Phase                  | Activités principales                  |
| ------- | --------------- | ---------------------- | -------------------------------------- |
| S21     | 25 août-31 août | Développement Frontend | Interface professeur (suite)           |
| S22     | 1-7 sept        | Développement Frontend | Interface administrateur               |
| S23     | 8-14 sept       | Développement Frontend | Interface administrateur (suite)       |
| S24     | 15-21 sept      | Développement Frontend | Intégration API, WebSocket, responsive |

### Octobre 2025

| Semaine | Dates         | Phase             | Activités principales                                                            |
| ------- | ------------- | ----------------- | -------------------------------------------------------------------------------- |
| S25     | 22-28 sept    | Tests             | Tests fonctionnels globaux, intégration                                          |
| S26     | 29 sept-7 oct | Tests/Déploiement | Tests utilisateurs, correction bugs, validation, déploiement, mise en production |

**Fin du projet : 7 octobre 2025**

**Fin du projet : 7 octobre 2025**

---

## 4. JALONS (MILESTONES)

| Jalon                                     | Date               | Livrables                                     |
| ----------------------------------------- | ------------------ | --------------------------------------------- |
| **J1** : Cahier des charges validé        | 27 avril 2025      | Document cahier des charges signé             |
| **J2** : Conception validée               | 18 mai 2025        | Maquettes, schémas d'architecture, modèle BDD |
| **J3** : API Backend opérationnelle       | 20 juillet 2025    | Toutes les routes API fonctionnelles          |
| **J4** : Interfaces principales terminées | 21 septembre 2025  | Écrans principaux pour tous les profils       |
| **J5** : Application complète intégrée    | 28 septembre 2025  | Backend + Frontend intégrés                   |
| **J6** : Tests validés                    | 5 octobre 2025     | Rapport de tests, corrections effectuées      |
| **J7** : Mise en production               | **7 octobre 2025** | **Application déployée et accessible**        |

---

## 5. RESSOURCES NÉCESSAIRES

| Rôle                       | Charge (semaines) | Période                  |
| -------------------------- | ----------------- | ------------------------ |
| **Chef de projet**         | 26 semaines       | 7 avril - 7 octobre 2025 |
| **Développeur Full-stack** | 26 semaines       | 7 avril - 7 octobre 2025 |

### Répartition de la charge du développeur

- **Analyse & Conception** : 6 semaines (support technique)
- **Développement Backend** : 8 semaines (Node.js, Express, MongoDB)
- **Développement Frontend** : 8 semaines (Vue.js)
- **Tests & Corrections** : 2 semaines
- **Déploiement & Formation** : 1 semaine
- **Ajustements finaux** : 1 semaine

---

## 6. RISQUES ET MITIGATION

| Risque                                    | Probabilité | Impact       | Mitigation                                            |
| ----------------------------------------- | ----------- | ------------ | ----------------------------------------------------- |
| Retard dans le développement              | Élevée      | Élevé        | Buffer de 1 semaine prévu, développement itératif     |
| Bugs critiques en production              | Faible      | Très élevé   | Phase de tests rigoureuse + tests utilisateurs        |
| **Indisponibilité du développeur unique** | Moyenne     | **Critique** | Documentation complète, backups réguliers du code     |
| Évolution des besoins                     | Moyenne     | Moyen        | Validation progressive avec le chef de projet         |
| Problèmes de performance                  | Faible      | Moyen        | Tests de charge avant déploiement                     |
| Surcharge de travail (1 développeur)      | Élevée      | Élevé        | Priorisation stricte des fonctionnalités, MVP d'abord |

---

## 7. DÉPENDANCES ENTRE TÂCHES

```
Analyse (1) → Conception (2) → Développement Backend (3)
                            ↘
                              → Développement Frontend (4)
                                                        ↓
                            Tests (5) ← Backend (3) + Frontend (4)
                                  ↓
                            Déploiement (6)
```

**Tâches critiques (chemin critique) :**

1. Analyse → 2. Conception → 3. Backend → 5. Tests → 6. Déploiement

---

_Planning établi le 20 janvier 2026_  
_Projet : Plateforme de Gestion Académique ISA Ambato_
