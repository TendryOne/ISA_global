<template>
  <nav aria-label="breadcrumb" class="breadcrumb-nav">
    <ol class="breadcrumb">
      <li class="breadcrumb-item">
        <RouterLink to="/" class="breadcrumb-link">
          <Icon icon="mdi:home" class="breadcrumb-icon" />
          <span class="breadcrumb-text">Accueil</span>
        </RouterLink>
      </li>
      <li v-for="(segment, index) in pathSegments" :key="index" class="breadcrumb-item">
        <div class="breadcrumb-separator">
          <Icon icon="mdi:chevron-right" />
        </div>
        <span v-if="isLast(index)" class="breadcrumb-current">
          {{ formatSegment(segment) }}
        </span>
        <RouterLink v-else :to="getPathUpTo(index)" class="breadcrumb-link">
          <span class="breadcrumb-text">{{ formatSegment(segment) }}</span>
        </RouterLink>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { Icon } from '@iconify/vue';

const route = useRoute();

// Découpe le chemin en segments
const pathSegments = computed(() => {
  return route.path.split('/').filter(Boolean);
});

// Formate un segment
const formatSegment = (segment: string) => {
  return segment
    .replace(/-/g, ' ')
    .replace(/^\w/, c => c.toUpperCase());
};

// Vérifie si c'est le dernier élément
const isLast = (index: number) => {
  return index === pathSegments.value.length - 1;
};

// Construit le chemin jusqu'au segment donné
const getPathUpTo = (index: number) => {
  const parts = pathSegments.value.slice(0, index + 1);
  return '/' + parts.join('/');
};
</script>

<style scoped>
.breadcrumb-nav {
  padding: 0.5rem 0;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 0.9rem;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.breadcrumb-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-color);
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius);
  transition: all 0.2s ease;
}

.breadcrumb-link:hover {
  background-color: var(--primary-extra-light);
  color: var(--primary-dark);
}

.breadcrumb-current {
  color: var(--gray-dark);
  padding: 0.25rem 0.5rem;
  font-weight: 500;
}

.breadcrumb-icon {
  color: var(--primary-color);
  font-size: 1.1rem;
}

.breadcrumb-separator {
  display: flex;
  color: var(--tertiary-light);
  font-size: 0.9rem;
}

/* Animation pour le survol */
.breadcrumb-link:hover .breadcrumb-icon {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

/* Style pour mobile */
@media (max-width: 768px) {
  .breadcrumb {
    flex-wrap: wrap;
    gap: 0.5rem;
    font-size: 0.8rem;
  }

  .breadcrumb-separator {
    display: none;
  }

  .breadcrumb-item {
    position: relative;
    padding-left: 1rem;
  }

  .breadcrumb-item:not(:first-child)::before {
    content: '/';
    position: absolute;
    left: 0.25rem;
    color: var(--tertiary-light);
  }
}
</style>
