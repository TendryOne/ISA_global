interface Cours {
    nom: string;
    credits: number;
    description: string;
    methodes: string[];
  }
  
  interface Semestre {
    semestre: number;
    totalCredits: number;
    cours: Cours[];
  }
  
  interface Metier {
    titre: string;
    description: string;
    salaire: string;
    demande: string;
    icon: string;
  }
  
  interface Formation {
    type: string;
    duree: string;
    totalCredits: number;
    tauxInsertion: string;
    objectifs: string;
    debouches: string[];
    prerequis: string[];
    syllabus: Semestre[];
    metiers: Metier[];
  }
  
  export interface FormationsDataInterface {
    gestion: Formation;
    btp: Formation;
    informatique: Formation;
  }
  