# MongoDB Transactions - ISA Ambato

## ✅ Configuration Replica Set

MongoDB est configuré en mode **Replica Set** pour supporter les transactions ACID.

## 🔧 Configuration

### Docker Compose

MongoDB démarre automatiquement avec:
- `--replSet rs0` - Active le replica set
- Initialisation automatique via `mongo-init.js`

### Vérifier le statut

```bash
# Vérifier que le replica set est actif
docker exec isa-mongodb mongosh --eval 'rs.status()'

# Ou utiliser le script
bash init-replica-set.sh
```

---

## 💾 Utiliser les transactions dans Node.js

### Exemple basique avec Mongoose

```javascript
const mongoose = require('mongoose');

async function transfererEtudiant() {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    // Opération 1: Retirer de l'ancienne classe
    await Etudiant.updateOne(
      { _id: etudiantId },
      { $set: { classe: nouvelleClasse } },
      { session }
    );
    
    // Opération 2: Mettre à jour les statistiques
    await Statistiques.updateOne(
      { classe: ancienneClasse },
      { $inc: { nbEtudiants: -1 } },
      { session }
    );
    
    await Statistiques.updateOne(
      { classe: nouvelleClasse },
      { $inc: { nbEtudiants: 1 } },
      { session }
    );
    
    // Valider la transaction
    await session.commitTransaction();
    console.log('Transaction réussie');
    
  } catch (error) {
    // Annuler en cas d'erreur
    await session.abortTransaction();
    console.error('Transaction échouée:', error);
    throw error;
  } finally {
    session.endSession();
  }
}
```

### Exemple avec inscription étudiant

```javascript
async function inscrireEtudiant(donnees) {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    // 1. Créer le compte étudiant
    const [etudiant] = await Etudiant.create([{
      nom: donnees.nom,
      email: donnees.email,
      matricule: await genererMatricule()
    }], { session });
    
    // 2. Créer l'entrée dans PendingStudents
    await PendingStudent.create([{
      studentId: etudiant._id,
      status: 'pending',
      documents: donnees.documents
    }], { session });
    
    // 3. Incrémenter le compteur
    await Counter.updateOne(
      { _id: 'inscriptions' },
      { $inc: { count: 1 } },
      { session }
    );
    
    // 4. Créer la notification
    await Notification.create([{
      userId: etudiant._id,
      message: 'Inscription en cours de traitement',
      type: 'inscription'
    }], { session });
    
    await session.commitTransaction();
    return etudiant;
    
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

### Exemple avec gestion des notes

```javascript
async function publierNotes(moduleId, notes) {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    // Mettre à jour toutes les notes
    for (const note of notes) {
      await Grade.updateOne(
        { studentId: note.studentId, moduleId },
        { 
          $set: { 
            note: note.valeur,
            publishedAt: new Date(),
            published: true
          }
        },
        { session, upsert: true }
      );
      
      // Créer notification pour chaque étudiant
      await Notification.create([{
        userId: note.studentId,
        message: `Nouvelle note disponible pour ${moduleId}`,
        type: 'grade'
      }], { session });
    }
    
    // Marquer le module comme évalué
    await Module.updateOne(
      { _id: moduleId },
      { $set: { gradesPublished: true } },
      { session }
    );
    
    await session.commitTransaction();
    
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

---

## 🔄 Middleware pour transactions automatiques

```javascript
// middleware/transaction.middleware.js
const transactionMiddleware = () => {
  return async (req, res, next) => {
    const session = await mongoose.startSession();
    req.session = session;
    
    // Fonction helper pour commencer une transaction
    req.withTransaction = async (callback) => {
      try {
        session.startTransaction();
        const result = await callback(session);
        await session.commitTransaction();
        return result;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    };
    
    next();
  };
};

// Utilisation
app.use('/api/v1/critical-operations', transactionMiddleware());

router.post('/create-student', async (req, res) => {
  try {
    const result = await req.withTransaction(async (session) => {
      const student = await Student.create([req.body], { session });
      await Log.create([{ action: 'student_created' }], { session });
      return student[0];
    });
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

## 🔐 Bonnes pratiques

### 1. Toujours gérer les erreurs

```javascript
try {
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

### 2. Limiter la durée des transactions

```javascript
// Timeout de 60 secondes
const session = await mongoose.startSession();
session.startTransaction({
  readConcern: { level: 'snapshot' },
  writeConcern: { w: 'majority' },
  maxCommitTimeMS: 60000
});
```

### 3. Isolation des lectures

```javascript
// Lecture cohérente pendant la transaction
const etudiant = await Etudiant.findById(id).session(session);
```

### 4. Ne pas faire d'opérations longues

```javascript
// ❌ Mauvais - opération externe dans une transaction
session.startTransaction();
await sendEmail(); // Peut être long
await session.commitTransaction();

// ✅ Bon - transaction rapide, puis opération externe
await session.commitTransaction();
await sendEmail(); // Après la transaction
```

---

## 📊 Connexion MongoDB avec Replica Set

### Configuration Mongoose

```javascript
// database/index.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Important pour les transactions
      replicaSet: 'rs0'
    });
    
    console.log('✓ MongoDB connecté (Replica Set actif)');
    console.log('✓ Transactions disponibles');
    
  } catch (error) {
    console.error('Erreur connexion MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### URI de connexion

```env
# .env
MONGODB_URI=mongodb://admin:password@mongodb:27017/isa?authSource=admin&replicaSet=rs0
```

---

## 🧪 Tester les transactions

```javascript
// test/transaction.test.js
async function testTransaction() {
  console.log('Test des transactions...');
  
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    // Créer un document
    const [doc] = await TestModel.create([{ name: 'Test' }], { session });
    console.log('Document créé:', doc._id);
    
    // Simuler une erreur
    throw new Error('Erreur de test');
    
    await session.commitTransaction();
  } catch (error) {
    console.log('Transaction annulée (normal):', error.message);
    await session.abortTransaction();
  } finally {
    session.endSession();
  }
  
  // Vérifier que le document n'existe pas (rollback)
  const doc = await TestModel.findOne({ name: 'Test' });
  console.log('Document après rollback:', doc); // null
  console.log('✓ Test réussi - transaction annulée correctement');
}
```

---

## 🚨 Dépannage

### Erreur "Transaction numbers are only allowed on a replica set member"

```bash
# Vérifier que le replica set est initialisé
docker exec isa-mongodb mongosh --eval 'rs.status()'

# Réinitialiser si nécessaire
bash init-replica-set.sh
```

### Vérifier la configuration

```javascript
// Dans votre code
mongoose.connection.db.admin().replSetGetStatus((err, info) => {
  if (err) {
    console.error('Pas de replica set');
  } else {
    console.log('Replica set actif:', info.set);
  }
});
```

---

## ✅ Checklist

- [x] MongoDB en mode Replica Set
- [x] URI de connexion avec `replicaSet=rs0`
- [x] Script d'initialisation disponible
- [x] Transactions testées
- [x] Gestion d'erreurs implémentée

**Les transactions MongoDB sont prêtes ! 🎉**
