import type { FormationsDataInterface } from "~/interfaces/Formation";

export const formationsData = {
  gestion: {
    type: "lp",
    duree: "6 semestres (3 ans)",
    totalCredits: 180,
    tauxInsertion: "85%",
    objectifs:
      "Former des entrepreneurs et managers capables de créer et gérer efficacement des entreprises locales. La formation allie théorie, cas concrets et stages en entreprise.",
    debouches: [
      "Création d’entreprise ou startup",
      "Gestionnaire de PME",
      "Consultant en gestion",
      "Responsable administratif et financier",
      "Assistant de direction"
    ],
    prerequis: [
      "Baccalauréat toute série",
      "Intérêt pour l’entrepreneuriat et la gestion",
      "Motivation"
    ],
    syllabus: [
      {
        semestre: 1,
        totalCredits: 30,
        cours: [
          {
            nom: "Principes de gestion",
            credits: 5,
            description:
              "Découverte des bases de la gestion d’entreprise et de l’économie malgache.",
            methodes: [
              "Cours magistraux",
              "Études de cas locaux",
              "Visites d’entreprises"
            ]
          },
          {
            nom: "Comptabilité générale",
            credits: 4,
            description:
              "Apprentissage des principes comptables adaptés au contexte des PME locales.",
            methodes: ["Exercices pratiques", "Logiciels de comptabilité", "TP"]
          }
        ]
      }
    ],
    metiers: [
      {
        titre: "Entrepreneur local",
        description:
          "Créer et développer une micro-entreprise ou une startup dans des secteurs variés (agriculture, commerce, services...).",
        salaire: "600 000 - 3 000 000 MGA/mois",
        demande: "Très élevée",
        icon: "ph:rocket"
      },
      {
        titre: "Gestionnaire de PME",
        description:
          "Assurer la gestion quotidienne d’une petite ou moyenne entreprise.",
        salaire: "900 000 - 1 800 000 MGA/mois",
        demande: "Élevée",
        icon: "ph:user-gear"
      },
      {
        titre: "Consultant en gestion",
        description:
          "Accompagner les entreprises locales dans la structuration et l’optimisation de leurs activités.",
        salaire: "1 500 000 - 2 800 000 MGA/mois",
        demande: "Croissante",
        icon: "ph:chart-line-up"
      }
    ]
  },

  btp: {
    type: "lp",
    duree: "6 semestres (3 ans)",
    totalCredits: 180,
    tauxInsertion: "88%",
    objectifs:
      "Former des professionnels capables de gérer et superviser des chantiers dans le secteur du bâtiment et des travaux publics, avec une approche axée sur la durabilité et les réalités malgaches.",
    debouches: [
      "Chef de chantier BTP",
      "Technicien en génie civil",
      "Conducteur de travaux",
      "Responsable qualité bâtiment",
      "Technicien en construction durable"
    ],
    prerequis: [
      "Baccalauréat technique ou scientifique",
      "Intérêt pour le secteur du BTP",
      "Motivation"
    ],
    syllabus: [
      {
        semestre: 1,
        totalCredits: 30,
        cours: [
          {
            nom: "Techniques de construction locales",
            credits: 6,
            description:
              "Découverte des matériaux et méthodes de construction adaptés à Madagascar.",
            methodes: ["TP sur chantier", "Visites techniques", "Projets réels"]
          }
        ]
      }
    ],
    metiers: [
      {
        titre: "Chef de chantier BTP",
        description:
          "Superviser et coordonner les travaux sur les chantiers (bâtiments, routes, infrastructures).",
        salaire: "1 200 000 - 2 500 000 MGA/mois",
        demande: "Très élevée",
        icon: "ph:hard-hat"
      },
      {
        titre: "Technicien en construction durable",
        description:
          "Mettre en œuvre des techniques écologiques et durables adaptées aux ressources locales.",
        salaire: "1 000 000 - 2 000 000 MGA/mois",
        demande: "Croissante",
        icon: "ph:leaf"
      },
      {
        titre: "Dessinateur en BTP",
        description:
          "Concevoir les plans et dessins techniques nécessaires à la construction.",
        salaire: "800 000 - 1 500 000 MGA/mois",
        demande: "Stable",
        icon: "ph:ruler"
      },
      {
        titre: "Technicien en topographie",
        description:
          "Mesurer et analyser les terrains pour les projets de construction et d’aménagement.",
        salaire: "900 000 - 1 800 000 MGA/mois",
        demande: "Élevée",
        icon: "ph:compass"
      }
    ]
  },

  informatique: {
    type: "lp",
    duree: "6 semestres (3 ans)",
    totalCredits: 180,
    tauxInsertion: "94%",
    objectifs:
      "Former des développeurs, administrateurs et techniciens capables de concevoir et maintenir des solutions informatiques adaptées aux entreprises et institutions locales.",
    debouches: [
      "Développeur web et mobile",
      "Administrateur systèmes et réseaux",
      "Technicien support informatique",
      "Consultant en cybersécurité",
      "Freelance IT / intégrateur web"
    ],
    prerequis: [
      "Baccalauréat (toute série, préférence scientifique)",
      "Intérêt pour l’informatique et les nouvelles technologies",
      "Motivation"
    ],
    syllabus: [
      {
        semestre: 1,
        totalCredits: 30,
        cours: [
          {
            nom: "Initiation à la programmation",
            credits: 6,
            description:
              "Introduction aux bases de l’algorithmique et de la programmation structurée.",
            methodes: ["Exercices pratiques", "Projets simples", "TP en salle"]
          },
          {
            nom: "Bureautique et outils numériques",
            credits: 3,
            description:
              "Maîtrise des outils de productivité et de communication numérique.",
            methodes: ["Travaux dirigés", "Cas pratiques", "Projets d’équipe"]
          }
        ]
      }
    ],
    metiers: [
      {
        titre: "Développeur web / mobile",
        description:
          "Créer des applications web et mobiles adaptées au marché local ou international.",
        salaire: "1 500 000 - 3 500 000 MGA/mois",
        demande: "Exceptionnelle",
        icon: "ph:code"
      },
      {
        titre: "Technicien en maintenance",
        description:
          "Installer, dépanner et entretenir les systèmes informatiques.",
        salaire: "700 000 - 1 200 000 MGA/mois",
        demande: "Très élevée",
        icon: "ph:computer-tower"
      },
      {
        titre: "Administrateur systèmes et réseaux",
        description:
          "Gérer les serveurs, réseaux et infrastructures informatiques d’entreprise.",
        salaire: "1 200 000 - 2 800 000 MGA/mois",
        demande: "Élevée",
        icon: "ph:network"
      },
      {
        titre: "Consultant en cybersécurité",
        description:
          "Protéger les systèmes informatiques contre les menaces et les attaques.",
        salaire: "2 000 000 - 4 000 000 MGA/mois",
        demande: "En forte croissance",
        icon: "ph:shield-check"
      },
      {
        titre: "Freelance développeur",
        description:
          "Travailler sur des projets à distance pour des clients locaux ou internationaux.",
        salaire: "1 500 000 - 6 000 000 MGA/mois (selon projets)",
        demande: "Explosion",
        icon: "ph:laptop"
      }
    ]
  }
} as FormationsDataInterface;
