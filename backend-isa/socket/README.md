# Structure Socket.IO - Organisation par rôle

Cette structure organise les événements Socket.IO par type d'utilisateur pour une meilleure maintenabilité et lisibilité du code.

## 📁 Structure des fichiers

```
socket/
├── index.js              # Point d'entrée principal, initialise Socket.IO
├── helpers.socket.js     # Fonctions utilitaires partagées
├── admin.socket.js       # Événements spécifiques aux administrateurs
├── professor.socket.js   # Événements spécifiques aux professeurs
├── student.socket.js     # Événements spécifiques aux étudiants
└── socket.js            # [ANCIEN FICHIER - peut être supprimé après migration]
```

## 🔧 Fichiers et responsabilités

### **index.js** (Principal)

- Initialise Socket.IO avec la configuration CORS
- Gère le middleware d'authentification de session
- Distribue les événements selon le rôle de l'utilisateur
- Gère la liste des utilisateurs connectés
- Gère la déconnexion des utilisateurs

### **helpers.socket.js** (Utilitaires)

- `verifyUserRole()` : Vérifie le rôle d'un utilisateur
- `sendNotificationToProfessor()` : Envoie une notification à un professeur
- `sendNotificationToPromotions()` : Envoie une notification aux promotions
- `sendUpdateToUser()` : Envoie une mise à jour à un utilisateur
- `sendNotificationToStudent()` : Envoie une notification à un étudiant
- `sendNotificationToAdminRoom()` : Envoie une notification à la salle admin

### **admin.socket.js** (Administrateurs)

Événements gérés :

- `joinAdminRoom` : Rejoindre la salle admin
- `sendScheduleNotification` : Envoyer une notification d'emploi du temps
- `cancelScheduleNotification` : Annuler un emploi du temps
- `administrativeRequestStatusChangeByAdmin` : Changement de statut de demande administrative
- `sendNotificationForFeesByAdmin` : Notification de vérification/rejet des frais
- `SendNotificationpatchUserStatusByAdmin` : Changement de statut d'un étudiant

### **professor.socket.js** (Professeurs)

Événements gérés :

- `ressourcesNotificationByProfessor` : Notification de ressources pédagogiques
- `assignmentNotificationByProfessor` : Notification de devoir/examen
- `gradesNotificationByProfessor` : Notification de notes
- `lockGradesNotificationByProfessor` : Verrouillage des notes

### **student.socket.js** (Étudiants)

Événements gérés :

- `joinPromotionRoom` : Rejoindre une salle de promotion
- `submissionNotificationByStudent` : Soumission de devoir
- `administrativeRequestNotificationByStudent` : Demande administrative
- `sendNotificationForFeesByStudent` : Mise à jour des frais de scolarité

## 🚀 Utilisation

### Ajouter un nouvel événement

1. **Pour les administrateurs** → Modifier `admin.socket.js`
2. **Pour les professeurs** → Modifier `professor.socket.js`
3. **Pour les étudiants** → Modifier `student.socket.js`

Exemple d'ajout d'un événement étudiant :

```javascript
// Dans student.socket.js
socket.on("nouveauEvenement", async (data) => {
  try {
    if (!verifyUserRole(socket, "student")) {
      console.log(`❌ Unauthorized access attempt by socket ID ${socket.id}`);
      return;
    }

    // Votre logique ici
  } catch (error) {
    console.error("Erreur lors de l'événement :", error);
  }
});
```

### Ajouter une fonction utilitaire

Ajoutez la fonction dans `helpers.socket.js` et exportez-la :

```javascript
const nouvelleFunction = (io, param1, param2) => {
  // Votre logique
};

module.exports = {
  // ... fonctions existantes
  nouvelleFunction,
};
```

## 🔒 Sécurité

Chaque événement vérifie systématiquement le rôle de l'utilisateur avec `verifyUserRole()` avant d'exécuter l'action.

## 🔄 Migration depuis l'ancien système

L'ancien fichier `socket.js` est conservé temporairement. Une fois la migration vérifiée, vous pouvez le supprimer :

```bash
# Vérifier que tout fonctionne correctement
# Puis supprimer l'ancien fichier
rm socket/socket.js
```

## 📝 Notes importantes

- Tous les événements sont automatiquement enregistrés selon le rôle lors de la connexion
- Un utilisateur ne peut accéder qu'aux événements de son rôle
- Les utilisateurs admin/superAdmin ont accès aux événements admin
- La liste `connectedUsers` est partagée entre tous les modules
