<template>
  <div class="isa-help-center">
    <!-- Barre de contrôle -->
    <div class="control-bar">
      <div class="branding">
        <img src="/logo-write.svg" alt="ISA" class="logo">
        <div class="divider"></div>
        <h1 class="title">Centre d'Aide</h1>
      </div>
      <button class="return-btn" @click="returnToApp">
        <Icon icon="ph:arrow-bend-up-left" />
        <span>Retour à l'application</span>
      </button>
    </div>

    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-badge">
          <Icon icon="ph:sparkle-fill" />
          <span>Support disponible 24/7</span>
        </div>
        <h2 class="hero-title">Comment pouvons-nous vous aider aujourd'hui ?</h2>
        <p class="hero-subtitle">
          Trouvez rapidement des réponses à vos questions ou contactez notre équipe d'assistance
        </p>

        <!-- Recherche intégrée au hero -->
        <div class="hero-search">
          <div class="search-input-wrapper">
            <Icon icon="ph:magnifying-glass" class="search-icon" />
            <input v-model="searchQuery" type="text" placeholder="Rechercher un article, une question..."
              class="search-input">
            <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''">
              <Icon icon="ph:x" />
            </button>
          </div>
        </div>
      </div>

      <!-- Statistiques rapides -->
      <div class="quick-stats">
        <div class="stat-item">
          <div class="stat-icon">
            <Icon icon="ph:article" />
          </div>
          <div class="stat-info">
            <span class="stat-number">{{ HelpArticles.length }}</span>
            <span class="stat-label">Articles</span>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon success">
            <Icon icon="ph:check-circle" />
          </div>
          <div class="stat-info">
            <span class="stat-number">98%</span>
            <span class="stat-label">Satisfaction</span>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon warning">
            <Icon icon="ph:clock" />
          </div>
          <div class="stat-info">
            <span class="stat-number">&lt;2h</span>
            <span class="stat-label">Temps de réponse</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Panneau principal -->
    <div class="help-panel">
      <!-- Catégories visuelles -->
      <div class="categories-section" v-if="!searchQuery">
        <h3 class="section-title">
          <Icon icon="ph:folders" />
          Explorer par catégorie
        </h3>
        <div class="categories-grid">
          <button v-for="category in categories" :key="category.id" class="category-card"
            :class="{ active: activeFilter === category.id }" @click="toggleFilter(category.id)">
            <div class="category-icon" :style="{ background: category.bgColor, color: category.color }">
              <Icon :icon="category.icon" />
            </div>
            <div class="category-info">
              <h4>{{ category.label }}</h4>
              <span>{{ getCategoryCount(category.id) }} articles</span>
            </div>
            <Icon icon="ph:caret-right" class="category-arrow" />
          </button>
        </div>
      </div>

      <!-- Filtre actif -->
      <div v-if="activeFilter || searchQuery" class="active-filter-bar">
        <div class="filter-info">
          <Icon icon="ph:funnel" />
          <span v-if="activeFilter">Catégorie : <strong>{{ getActiveFilterLabel }}</strong></span>
          <span v-if="searchQuery">Recherche : <strong>"{{ searchQuery }}"</strong></span>
        </div>
        <button class="clear-filter" @click="resetFilters">
          <Icon icon="ph:x" />
          Effacer les filtres
        </button>
      </div>

      <!-- Contenu dynamique -->
      <div class="content-section">
        <!-- En-tête de section -->
        <div class="section-header" v-if="hasResults">
          <h3 class="section-title">
            <Icon icon="ph:list-bullets" />
            {{ activeFilter || searchQuery ? 'Résultats' : 'Articles populaires' }}
          </h3>
          <span class="results-count">{{ filteredArticles.length }} article(s)</span>
        </div>

        <!-- Liste des articles -->
        <div v-if="hasResults" class="articles-list">
          <div v-for="article in filteredArticles" :key="article.articleId" class="article-item"
            @click="openModal(article)">
            <div class="article-icon">
              <Icon :icon="article.icon" />
            </div>
            <div class="article-content">
              <div class="article-header">
                <h3>{{ article.title }}</h3>
                <span class="article-badge">{{ getCategoryLabel(article.category) }}</span>
              </div>
              <p>{{ article.description }}</p>
              <div class="article-meta-inline">
                <span>
                  <Icon icon="ph:clock" /> {{ article.readTime }} min
                </span>
              </div>
            </div>
            <div class="article-action">
              <Icon icon="ph:arrow-right" />
            </div>
          </div>
        </div>

        <!-- État vide -->
        <div v-else class="empty-state">
          <div class="empty-illustration">
            <Icon icon="ph:magnifying-glass-minus" />
          </div>
          <h3>Aucun résultat trouvé</h3>
          <p>Nous n'avons pas trouvé d'articles correspondant à votre recherche. Essayez d'autres termes ou explorez nos
            catégories.</p>
          <button class="explore-btn" @click="resetFilters">
            <Icon icon="ph:compass" />
            <span>Explorer toutes les catégories</span>
          </button>
        </div>
      </div>

      <!-- Support Section -->
      <div class="support-section">
        <div class="support-card-main">
          <div class="support-visual">
            <div class="support-avatar">
              <Icon icon="ph:headset" />
            </div>
            <div class="support-wave"></div>
          </div>
          <div class="support-content">
            <h4>Besoin d'une assistance personnalisée côté technique ?</h4>
            <p>Notre équipe est là pour vous aider. N'hésitez pas à nous contacter, nous répondons généralement en moins
              de 2 heures.</p>
            <div class="support-actions">
              <button class="action-btn primary" @click="sendMessage">
                <Icon icon="ph:chat-centered-dots" />
                <span>Démarrer une conversation</span>
              </button>
              <button class="action-btn secondary" @click="sendMail">
                <Icon icon="ph:envelope-simple" />
                <span>Envoyer un email</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Quick links -->
        <div class="quick-links">
          <RouterLink to="/contact" class="quick-link">
            <Icon icon="ph:bug" />
            <span>Signaler un bug</span>
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="help-footer">
      <p>© {{ new Date().getFullYear() }} ISA - Institut Supérieur. Tous droits réservés.</p>
    </div>

    <!-- Modale d'article -->
    <Transition name="modal">
      <div v-if="selectedArticle" class="modal-overlay" @click.self="closeModal">
        <div class="modal-container">
          <div class="modal-header">
            <div class="modal-title">
              <div class="title-icon">
                <Icon :icon="selectedArticle.icon" />
              </div>
              <div class="title-text">
                <h2>{{ selectedArticle.title }}</h2>
                <span class="modal-category">{{ getCategoryLabel(selectedArticle.category) }}</span>
              </div>
            </div>
            <button class="close-btn" @click="closeModal">
              <Icon icon="ph:x" />
            </button>
          </div>
          <div class="modal-content">
            <div class="article-meta">
              <div class="meta-item">
                <Icon icon="ph:calendar" />
                <span>Mis à jour le {{ formatDate(selectedArticle.updatedAt) }}</span>
              </div>
              <div class="meta-item">
                <Icon icon="ph:clock" />
                <span>{{ selectedArticle.readTime }} min de lecture</span>
              </div>
            </div>
            <div class="article-body">
              <pre>{{ selectedArticle.content }}</pre>
            </div>
          </div>
          <div class="modal-footer">

            <button class="action-btn primary" @click="sendMessage">
              <Icon icon="ph:chat-centered-dots" />
              <span>Besoin d'aide supplémentaire ?</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { HelpArticles } from '@/data/help'
import { UnivesityInformation } from '@/data/universityInformation'

const sendMessage = () => {
  window.open(`https://wa.me/261384805260`, '_blank')
}

const sendMail = () => {
  window.location.href = `mailto:${UnivesityInformation.emailScolarite}`
}

const router = useRouter()
const searchQuery = ref('')
const activeFilter = ref(null)
const selectedArticle = ref(null)

// Catégories avec couleurs et icônes
const categories = [
  {
    id: 'auth',
    label: 'Authentification',
    icon: 'ph:lock-key',
    bgColor: 'rgba(80, 134, 193, 0.1)',
    color: '#5086c1'
  },
  {
    id: 'cours',
    label: 'Cours en ligne',
    icon: 'ph:graduation-cap',
    bgColor: 'rgba(48, 168, 85, 0.1)',
    color: '#30a855'
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: 'ph:file-text',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    color: '#f59e0b'
  },
  {
    id: 'notes',
    label: 'Évaluations',
    icon: 'ph:exam',
    bgColor: 'rgba(52, 152, 219, 0.1)',
    color: '#3498db'
  }
]

const filteredArticles = computed(() => {
  let result = HelpArticles
  if (activeFilter.value) {
    result = result.filter(a => a.category === activeFilter.value)
  }
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(a =>
      a.title.toLowerCase().includes(query) ||
      a.description.toLowerCase().includes(query)
    )
  }
  return result
})

const hasResults = computed(() => filteredArticles.value.length > 0)

const getActiveFilterLabel = computed(() => {
  const cat = categories.find(c => c.id === activeFilter.value)
  return cat ? cat.label : ''
})

const getCategoryCount = (categoryId: string) => {
  return HelpArticles.filter(a => a.category === categoryId).length
}

const getCategoryLabel = (categoryId: string) => {
  const cat = categories.find(c => c.id === categoryId)
  return cat ? cat.label : categoryId
}

const toggleFilter = (filterId: string) => {
  activeFilter.value = activeFilter.value === filterId ? null : filterId
}

const resetFilters = () => {
  searchQuery.value = ''
  activeFilter.value = null
}

const returnToApp = () => {
  router.push('/')
}

const openModal = (article: any) => {
  selectedArticle.value = article
}

const closeModal = () => {
  selectedArticle.value = null
}

const openChat = () => {
  console.log('Ouvrir le chat')
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
/* Variables */
.isa-help-center {
  --primary: var(--primary-color, #5086c1);
  --primary-light: var(--primary-lighter, #5aa8e8);
  --primary-dark: var(--primary-dark, #1a252f);
  --primary-bg: var(--primary-extra-light, rgba(80, 134, 193, 0.08));
  --secondary: var(--secondary-color, #30a855);
  --secondary-light: var(--secondary-lighter, #6fd487);
  --success: var(--secondary-color, #30a855);
  --warning: #f59e0b;
  --bg-color: #f8fafc;
  --bg-gradient: linear-gradient(135deg, var(--primary-color, #5086c1) 0%, var(--primary-light, #3498db) 100%);
  --card-bg: #ffffff;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  --border-color: #e2e8f0;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 10px 40px rgba(0, 0, 0, 0.12);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  min-height: 100vh;
  background: var(--bg-color);
  color: var(--text-primary);
  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
}

/* Barre de contrôle */
.control-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: var(--card-bg);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
}

.branding {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  height: 36px;
  width: auto;
}

.divider {
  width: 1px;
  height: 28px;
  background: var(--border-color);
}

.title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
}

.return-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.25rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition);
}

.return-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-bg);
}

/* Hero Section */
.hero-section {
  background: var(--bg-gradient);
  padding: 3rem 2rem;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('/logo-write.svg') no-repeat center;
  background-size: 400px;
  opacity: 0.05;
  pointer-events: none;
}

.hero-content {
  max-width: 700px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  color: white;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  backdrop-filter: blur(10px);
}

.hero-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: white;
  margin: 0 0 1rem 0;
  line-height: 1.3;
}

.hero-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.85);
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

.hero-search {
  max-width: 550px;
  margin: 0 auto;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1.25rem;
  color: var(--text-muted);
  font-size: 1.25rem;
}

.search-input {
  width: 100%;
  padding: 1.1rem 3rem 1.1rem 3.5rem;
  font-size: 1rem;
  border: none;
  background: var(--card-bg);
  border-radius: 50px;
  box-shadow: var(--shadow-lg);
  transition: var(--transition);
}

.search-input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3), var(--shadow-lg);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.clear-search {
  position: absolute;
  right: 1rem;
  background: var(--bg-color);
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition);
}

.clear-search:hover {
  background: var(--primary-bg);
  color: var(--primary);
}

/* Quick Stats */
.quick-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 2.5rem;
  position: relative;
  z-index: 1;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-md);
  backdrop-filter: blur(10px);
}

.stat-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-sm);
  color: white;
  font-size: 1.25rem;
}

.stat-icon.success {
  background: rgba(16, 185, 129, 0.3);
}

.stat-icon.warning {
  background: rgba(245, 158, 11, 0.3);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
}

.stat-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.75);
}

/* Help Panel */
.help-panel {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* Categories Section */
.categories-section {
  margin-bottom: 2.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1.25rem 0;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.category-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition);
  text-align: left;
}

.category-card:hover {
  border-color: var(--primary-light);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.category-card.active {
  border-color: var(--primary);
  background: var(--primary-bg);
}

.category-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  font-size: 1.5rem;
  flex-shrink: 0;
}

.category-info {
  flex: 1;
}

.category-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.category-info span {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.category-arrow {
  color: var(--text-muted);
  font-size: 1.25rem;
  transition: var(--transition);
}

.category-card:hover .category-arrow {
  color: var(--primary);
  transform: translateX(4px);
}

/* Active Filter Bar */
.active-filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: var(--primary-bg);
  border-radius: var(--radius-md);
  margin-bottom: 1.5rem;
}

.filter-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary);
  font-size: 0.9rem;
}

.clear-filter {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid var(--primary);
  border-radius: var(--radius-sm);
  color: var(--primary);
  font-size: 0.85rem;
  cursor: pointer;
  transition: var(--transition);
}

.clear-filter:hover {
  background: var(--primary);
  color: white;
}

/* Content Section */
.content-section {
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.results-count {
  font-size: 0.85rem;
  color: var(--text-muted);
  background: var(--bg-color);
  padding: 0.35rem 0.75rem;
  border-radius: 50px;
}

/* Articles List */
.articles-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.article-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--bg-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition);
  border: 1px solid transparent;
}

.article-item:hover {
  background: var(--card-bg);
  border-color: var(--border-color);
  box-shadow: var(--shadow-sm);
}

.article-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-bg);
  border-radius: var(--radius-sm);
  color: var(--primary);
  font-size: 1.35rem;
  flex-shrink: 0;
}

.article-content {
  flex: 1;
  min-width: 0;
}

.article-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.35rem;
  flex-wrap: wrap;
}

.article-content h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.article-badge {
  font-size: 0.7rem;
  padding: 0.2rem 0.6rem;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 50px;
  color: var(--text-muted);
  font-weight: 500;
}

.article-content p {
  margin: 0 0 0.5rem 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-meta-inline {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.article-meta-inline span {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.article-action {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-bg);
  border-radius: 50%;
  color: var(--primary);
  font-size: 1rem;
  transition: var(--transition);
  flex-shrink: 0;
}

.article-item:hover .article-action {
  background: var(--primary);
  color: white;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-illustration {
  width: 100px;
  height: 100px;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-color);
  border-radius: 50%;
  font-size: 3rem;
  color: var(--text-muted);
}

.empty-state h3 {
  font-size: 1.35rem;
  margin: 0 0 0.75rem 0;
}

.empty-state p {
  color: var(--text-secondary);
  max-width: 400px;
  margin: 0 auto 1.5rem;
  line-height: 1.6;
}

.explore-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1.75rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

.explore-btn:hover {
  background: var(--primary-light);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);
}

/* Support Section */
.support-section {
  margin-bottom: 2rem;
}

.support-card-main {
  display: flex;
  align-items: center;
  gap: 2.5rem;
  padding: 2.5rem;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  border-radius: var(--radius-lg);
  color: white;
  margin-bottom: 1.5rem;
  position: relative;
  overflow: hidden;
}

.support-card-main::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.support-visual {
  position: relative;
  flex-shrink: 0;
}

.support-avatar {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  font-size: 2.5rem;
}

.support-wave {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  animation: wave 2s ease-out infinite;
}

@keyframes wave {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 1;
  }

  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

.support-content {
  flex: 1;
  position: relative;
  z-index: 1;
}

.support-content h4 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.75rem 0;
}

.support-content p {
  font-size: 1rem;
  opacity: 0.9;
  margin: 0 0 1.5rem 0;
  max-width: 450px;
  line-height: 1.6;
}

.support-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1.5rem;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: var(--transition);
}

.action-btn.primary {
  background: white;
  color: var(--primary);
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Quick Links */
.quick-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.quick-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  text-decoration: none;
  font-weight: 500;
  transition: var(--transition);
}

.quick-link:hover {
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.quick-link svg {
  font-size: 1.35rem;
  color: var(--primary);
}

/* Footer */
.help-footer {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
  font-size: 0.85rem;
  border-top: 1px solid var(--border-color);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  padding: 1rem;
}

.modal-container {
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  background: var(--card-bg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  gap: 1rem;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-bg);
  border-radius: var(--radius-sm);
  color: var(--primary);
  font-size: 1.5rem;
  flex-shrink: 0;
}

.title-text h2 {
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
}

.modal-category {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.close-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-color);
  border: none;
  border-radius: 50%;
  color: var(--text-secondary);
  font-size: 1.25rem;
  cursor: pointer;
  transition: var(--transition);
  flex-shrink: 0;
}

.close-btn:hover {
  background: var(--primary-bg);
  color: var(--primary);
}

.modal-content {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.article-body {
  line-height: 1.7;
  color: var(--text-primary);
}

.article-body pre {
  white-space: pre-wrap;
  font-family: inherit;
  margin: 0;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.footer-feedback {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.feedback-buttons {
  display: flex;
  gap: 0.5rem;
}

.feedback-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 1rem;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  cursor: pointer;
  transition: var(--transition);
}

.feedback-btn.positive:hover {
  border-color: var(--success);
  color: var(--success);
  background: rgba(16, 185, 129, 0.1);
}

.feedback-btn.negative:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.modal-footer .action-btn.primary {
  background: var(--primary);
  color: white;
}

.modal-footer .action-btn.primary:hover {
  background: var(--primary-light);
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95) translateY(20px);
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .control-bar {
    padding: 0.75rem 1rem;
  }

  .logo {
    display: none;
  }

  .divider {
    display: none;
  }

  .title {
    font-size: 1.1rem;
  }

  .return-btn span {
    display: none;
  }

  .hero-section {
    padding: 2rem 1rem;
  }

  .hero-title {
    font-size: 1.5rem;
  }

  .hero-subtitle {
    font-size: 0.95rem;
  }

  .quick-stats {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
  }

  .stat-item {
    justify-content: center;
  }

  .help-panel {
    padding: 1rem;
  }

  .categories-grid {
    grid-template-columns: 1fr;
  }

  .support-card-main {
    flex-direction: column;
    text-align: center;
    padding: 2rem 1.5rem;
    gap: 1.5rem;
  }

  .support-content h4 {
    font-size: 1.25rem;
  }

  .support-actions {
    justify-content: center;
    flex-direction: column;
  }

  .quick-links {
    grid-template-columns: 1fr 1fr;
  }

  .modal-container {
    max-height: 95vh;
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-content {
    padding: 1rem;
  }

  .footer-feedback {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .quick-links {
    grid-template-columns: 1fr;
  }

  .active-filter-bar {
    flex-direction: column;
    gap: 0.75rem;
    text-align: center;
  }
}
</style>
