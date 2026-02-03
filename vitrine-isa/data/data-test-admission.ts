import type { AdmissionResultInterface } from "~/interfaces/AdmissionResult";

export const dataTestAdmission = [
  {
    _id: '1',
    name: "Gestion & Création d'Entreprise",
    listAdmis: [
      { _id: '1', name: 'Alice Dupont', level: "L1" },
      { _id: '2', name: 'Bastien Lefevre', level: "L1" },
      { _id: '3', name: 'Clara Martin', level: "L1" },
      { _id: '4', name: 'David Moreau', level: "L1" },
      { _id: '5', name: 'Élise Bernard', level: "L1" },
      { _id: '6', name: 'François Petit', level: "L1" },
      { _id: '7', name: 'Géraldine Rousseau', level: "L1" },
      { _id: '8', name: 'Hugo Lefranc', level: "L1" },
      { _id: '9', name: 'Isabelle Chevalier', level: "L1" },
      { _id: '10', name: 'Jean-Michel Dubois', level: "L1" }
    ]
  },
  {
    _id: '2',
    name: "Informatique",
    listAdmis: [
      { _id: '1', name: 'Lucas Pierre', level: "L1" },
      { _id: '2', name: 'Mélanie Dupuis', level: "L1" },
      { _id: '3', name: 'Nicolas Lemoine', level: "L1" },
      { _id: '4', name: 'Olivia Lefèvre', level: "L1" },
      { _id: '5', name: 'Paul Martin', level: "L1" },
      { _id: '6', name: 'Quentin Durand', level: "L1" },
      { _id: '7', name: 'Romain Dufresne', level: "L1" },
      { _id: '8', name: 'Sophie Boucher', level: "L1" },
      { _id: '9', name: 'Thomas Vallée', level: "L1" },
      { _id: '10', name: 'Ursula Lambert', level: "L1" }
    ]
  },
  {
    _id: '3',
    name: 'Bâtiment & Travaux Publics',
    listAdmis: [
      { _id: '1', name: 'Victor Lefevre', level: "L1" },
      { _id: '2', name: 'Wendy Martin', level: "L1" },
      { _id: '3', name: 'Xavier Joubert', level: "L1" },
      { _id: '4', name: 'Yasmine Bernard', level: "L1" },
      { _id: '5', name: 'Zacharie Petit', level: "L1" },
      { _id: '6', name: 'Amandine Dupont', level: "L1" },
      { _id: '7', name: 'Benoit Clément', level: "L1" },
      { _id: '8', name: 'Chloé Lefranc', level: "L1" },
      { _id: '9', name: 'Dominique Moreau', level: "L1" },
      { _id: '10', name: 'Élodie Petit', level: "L1" }
    ]
  }
] as AdmissionResultInterface[];
