<template>
  <form @submit.prevent="handleLogin" class="university-form">
    <!-- Champ Identifiant -->
    <div class="form-group">
      <label for="studentId" class="input-label">
        <svg class="input-icon" viewBox="0 0 24 24">
          <path
            d="M12 4a4 4 0 0 1 4 4 4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4z" />
        </svg>
        Identifiant universitaire
      </label>
      <div class="input-wrapper">
        <input id="studentId" v-model="studentId" type="text" placeholder="ex: et123456" pattern="[a-zA-Z]{2}\d{6}"
          required class="input-field">
      </div>
    </div>

    <!-- Champ Mot de passe -->
    <div class="form-group">
      <label for="password" class="input-label">
        <svg class="input-icon" viewBox="0 0 24 24">
          <path
            d="M12 3a4 4 0 0 1 4 4v3h2.25c.97 0 1.75.78 1.75 1.75v8.5c0 .97-.78 1.75-1.75 1.75H5.75C4.78 22 4 21.22 4 20.25v-8.5C4 10.78 4.78 10 5.75 10H8V7a4 4 0 0 1 4-4m0 1.5A2.5 2.5 0 0 0 9.5 7v3h5V7A2.5 2.5 0 0 0 12 4.5z" />
        </svg>
        Mot de passe
      </label>
      <div class="input-wrapper">
        <input id="password" v-model="password" :type="showPassword ? 'text' : 'password'" required class="input-field"
          placeholder="Votre mot de passe">
        <button type="button" @click="showPassword = !showPassword" class="password-toggle"
          :aria-label="showPassword ? 'Cacher le mot de passe' : 'Afficher le mot de passe'">
          <svg viewBox="0 0 24 24">
            <path v-if="showPassword"
              d="M11.83 9L15 12.16V12a3 3 0 0 0-3-3h-.17m-4.3.8l1.55 1.55c-.05.21-.08.42-.08.65a3 3 0 0 0 3 3c.22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53a5 5 0 0 1-5-5c0-.79.2-1.53.53-2.2M2 4.27l2.28 2.28.45.45C3.08 8.3 1.78 10 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.43.42L19.73 22 21 20.73 3.27 3M12 7a5 5 0 0 1 5 5c0 .64-.13 1.26-.36 1.82l2.93 2.93c1.5-1.25 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-4 .7l2.17 2.15C10.74 7.13 11.35 7 12 7z" />
            <path v-else
              d="M12 9a3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3m0-4.5c5 0 9.27 3.11 11 7.5-1.73 4.39-6 7.5-11 7.5S2.73 16.39 1 12c1.73-4.39 6-7.5 11-7.5M3.18 12a9.821 9.821 0 0 0 17.64 0 9.821 9.821 0 0 0-17.64 0z" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Options -->
    <div class="form-options">
      <label class="remember-me">
        <input type="checkbox" v-model="rememberMe" v-show="false">
        <span class="checkmark"></span>
        Se souvenir de moi
      </label>
      <NuxtLink to="/mot-de-passe-oublie" class="forgot-password">
        Mot de passe oublié ?
      </NuxtLink>
    </div>

    <!-- Bouton de soumission -->
    <button type="submit" class="submit-btn" :disabled="isLoading">
      <span v-if="!isLoading">Se connecter</span>
      <span v-else class="loading">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
        </svg>
        Connexion...
      </span>
    </button>

    <!-- Liens utiles -->
    <div class="form-footer">
      <p>Première connexion ? <NuxtLink to="/activation-compte">Activer mon compte</NuxtLink>
      </p>
      <p>
        <NuxtLink to="/support-technique">Support technique</NuxtLink>
      </p>
    </div>
  </form>
</template>

<script lang="ts" setup>
const studentId = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)
const isLoading = ref(false)

const handleLogin = async () => {
  if (!studentId.value || !password.value) return

  isLoading.value = true
  try {
    // Logique de connexion
    await new Promise(resolve => setTimeout(resolve, 1500))
    console.log('Connexion réussie')
  } finally {
    isLoading.value = false
  }
}

definePageMeta({
  layout: 'authentication'
})
</script>

<style scoped>
.university-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--gray-dark);
}

.input-icon {
  width: 20px;
  height: 20px;
  fill: var(--primary-color);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-field {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid var(--gray-light);
  border-radius: var(--radius);
  font-size: 1rem;
  transition: all 0.2s;
  background-color: var(--white);
}

.input-field:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-color-extra-light);
  outline: none;
}

.input-hint {
  font-size: 0.75rem;
  color: var(--gray);
}

.password-toggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
}

.password-toggle svg {
  width: 20px;
  height: 20px;
  fill: var(--gray);
}

.password-toggle:hover svg {
  fill: var(--primary-color);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: var(--gray-dark);
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 1px solid var(--gray-light);
  border-radius: 4px;
  display: inline-block;
  position: relative;
}

.remember-me input:checked+.checkmark {
  background-color: var(--secondary-color);
  border-color: var(--secondary-color);
}

.remember-me input:checked+.checkmark::after {
  content: "✓";
  position: absolute;
  color: white;
  font-size: 0.7rem;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.forgot-password {
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-password:hover {
  text-decoration: underline;
  color: var(--primary-dark);
}

.submit-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 0.5rem;
}

.submit-btn:hover {
  background-color: var(--primary-dark);
}

.submit-btn:disabled {
  background-color: var(--gray-light);
  cursor: not-allowed;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.loading svg {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.form-footer {
  margin-top: 1rem;
  font-size: 0.85rem;
  text-align: center;
  color: var(--gray-dark);
}

.form-footer a {
  color: var(--secondary-color);
  text-decoration: none;
}

.form-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .forgot-password {
    align-self: flex-end;
  }
}
</style>