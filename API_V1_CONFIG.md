# Configuration API avec préfixe /api/v1

## ✅ Votre code actuel fonctionne sans modification !

### Structure actuelle
```javascript
// Dans votre frontend/vitrine
fetch('https://api.isa-ambato.mg/api/v1/students')
// ou
axios.get('https://api.isa-ambato.mg/api/v1/auth/login')
```

### Ce qui se passe

```
Frontend: https://edu.isa-ambato.mg
    ↓
Appel API: https://api.isa-ambato.mg/api/v1/students
    ↓
Nginx reçoit la requête
    ↓
Proxy vers backend:4000/api/v1/students
    ↓
Backend traite /api/v1/students
    ↓
Retourne la réponse
```

---

## 🔧 Configuration dans vos frontends

### Frontend Vue.js

#### Option 1: Configuration simple (si vous utilisez déjà axios)

```javascript
// src/main.js ou src/plugins/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api/v1',
  withCredentials: true,
  timeout: 30000
});

export default api;
```

**Fichier .env:**
```env
VITE_API_URL=https://api.isa-ambato.mg
```

**Usage:**
```javascript
import api from '@/plugins/axios';

// Appelle automatiquement https://api.isa-ambato.mg/api/v1/students
api.get('/students');
api.post('/auth/login', credentials);
```

#### Option 2: Si vous utilisez fetch directement

```javascript
// src/utils/api.js
const API_BASE = import.meta.env.VITE_API_URL + '/api/v1';

export const api = {
  get: (endpoint) => fetch(`${API_BASE}${endpoint}`, {
    credentials: 'include'
  }).then(r => r.json()),
  
  post: (endpoint, data) => fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  }).then(r => r.json())
};

// Usage
import { api } from '@/utils/api';
api.get('/students');
```

---

### Vitrine Nuxt.js

```javascript
// composables/useApi.js
export const useApi = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiUrl + '/api/v1';

  const fetchData = async (endpoint, options = {}) => {
    return await $fetch(`${baseURL}${endpoint}`, {
      credentials: 'include',
      ...options
    });
  };

  return { fetchData };
};
```

**Usage dans une page:**
```vue
<script setup>
const { fetchData } = useApi();
const { data: students } = await useAsyncData('students', () => 
  fetchData('/students')
);
</script>
```

---

## 🎯 Configuration Backend (si nécessaire)

Si votre backend utilise Express avec des routes préfixées `/api/v1`:

```javascript
// backend-isa/index.js
const express = require('express');
const app = express();

// Vos routes sont déjà sur /api/v1
const routes = require('./routes/index.routes');
app.use('/api/v1', routes);

// Endpoint de santé (sans préfixe)
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});
```

**Nginx transmettra tout tel quel, aucun changement nécessaire !**

---

## 🔍 Vérification

### Test 1: Health check
```bash
curl https://api.isa-ambato.mg/health
```

### Test 2: API v1
```bash
curl https://api.isa-ambato.mg/api/v1/students
```

### Test 3: Depuis le navigateur
```javascript
// Console du navigateur sur https://edu.isa-ambato.mg
fetch('https://api.isa-ambato.mg/api/v1/students', {
  credentials: 'include'
}).then(r => r.json()).then(console.log);
```

---

## ✅ Résumé

- ✅ **Aucun changement dans votre code frontend** (garde `/api/v1`)
- ✅ **Nginx configuré** pour transmettre `/api/v1` au backend
- ✅ **CORS configuré** pour accepter les requêtes cross-domain
- ✅ **Tout fonctionne** de façon transparente !

---

## 💡 Bonus: Variables d'environnement

### Development
```env
# Frontend-isa/.env.development
VITE_API_URL=http://localhost:4000

# vitrine-isa/.env.development  
NUXT_PUBLIC_API_URL=http://localhost:4000
```

### Production
```env
# Frontend-isa/.env.production
VITE_API_URL=https://api.isa-ambato.mg

# vitrine-isa/.env.production
NUXT_PUBLIC_API_URL=https://api.isa-ambato.mg
```

Votre code s'adapte automatiquement selon l'environnement ! 🎉
