export const filieres = [
    {
      id: 'gestion',
      nom: 'Gestion',
      icon: 'ph:chart-line-up',
      objectifs: [
        'Maîtriser les fondamentaux de la gestion d\'entreprise',
        'Développer un business model viable',
        'Apprendre à lever des fonds',
        'Gérer la croissance d\'une startup'
      ],
      metiers: [
        { titre: 'Entrepreneur', exemple: 'Création d\'une entreprise tech' },
        { titre: 'Business Developer', exemple: 'Développement de marché pour une scale-up' },
        { titre: 'Consultant', exemple: 'Accompagnement de PME' }
      ],
      cours: [
        {
          nom: 'Stratégie Entrepreneuriale',
          credits: 4,
          pedagogie: 'Études de cas + simulations business',
          themes: [
            'Analyse de marché',
            'Business Model Canvas',
            'Stratégie de différenciation'
          ]
        },
        {
          nom: 'Finance pour Entrepreneurs',
          credits: 3,
          pedagogie: 'Ateliers pratiques + outils financiers',
          themes: [
            'Prévisionnel financier',
            'Levée de fonds',
            'Gestion de trésorerie'
          ]
        }
      ]
    },
    {
      id: 'btp',
      nom: 'BTP',
      icon: 'ph:hard-hat',
      // Données similaires pour BTP...
    },
    {
      id: 'info',
      nom: 'Informatique',
      icon: 'ph:code',
      // Données similaires pour Informatique...
    }
  ]