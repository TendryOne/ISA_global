<template>
  <section class="teaching-units-section">
    <div class="section-header">
      <h2>
        <Icon name="ph:book-open" />
        <span>Unités d'enseignement</span>
      </h2>
      <div class="total-units">
        <Icon name="ph:hash" />
        <span>{{ totalUnits }} unités · {{ totalCredits }} crédits</span>
      </div>
    </div>

    <div v-if="unitsBySemester.length === 0" class="no-units">
      <Icon name="ph:empty" class="empty-icon" />
      <p>Aucune unité d'enseignement disponible pour cette filière.</p>
    </div>

    <div v-else class="semesters-container">
      <div
        v-for="semester in unitsBySemester"
        :key="semester.name"
        class="semester-section"
      >
        <div class="semester-header">
          <h3>{{ semester.name }}</h3>
          <div class="semester-info">
            <span class="units-count">{{ semester.units.length }} unités</span>
            <span class="credits-count"
              >{{ semester.totalCredits }} crédits</span
            >
          </div>
        </div>

        <div class="units-grid">
          <div v-for="unit in semester.units" :key="unit._id" class="unit-card">
            <div class="unit-header">
              <div class="unit-code">{{ unit.code }}</div>
              <div class="unit-credits">{{ unit.credits }} crédits</div>
            </div>

            <h4 class="unit-name">{{ unit.name }}</h4>

            <p class="unit-description">{{ unit.description }}</p>
            <!--             
            <div class="unit-meta">
              <div class="unit-field">
                <Icon name="ph:graduation-cap" />
                <span>{{ formatField(unit.field) }}</span>
              </div>
              <div class="unit-semester">
                <Icon name="ph:calendar" />
                <span>{{ unit.semester }}</span>
              </div>
            </div> -->

            <button class="details-btn" @click="$emit('showModules', unit)">
              <Icon name="ph:list" />
              <span>Voir les modules</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed } from "vue";
import type { TeachingUnitInterface } from "~/interfaces/teachingUnit.interface";

interface Props {
  teachingUnits: TeachingUnitInterface[] | unknown;
}

interface EmitEvents {
  showModules: [unit: TeachingUnitInterface];
}

const props = defineProps<Props>();
defineEmits<EmitEvents>();

// Safe normalized array to avoid runtime type errors
const safeUnits = computed<TeachingUnitInterface[]>(() =>
  Array.isArray(props.teachingUnits) ? props.teachingUnits : []
);

// Computed properties for organizing data
const unitsBySemester = computed(() => {
  const semesters = ["S1", "S2", "S3", "S4", "S5", "S6"] as const;

  return semesters
    .map((semester) => {
      const units = safeUnits.value.filter(
        (unit) => unit.semester === semester
      );
      const totalCredits = units.reduce(
        (sum, unit) => sum + (Number(unit.credits) || 0),
        0
      );

      return {
        name: `Semestre ${semester.charAt(1)}`,
        semester,
        units,
        totalCredits,
      };
    })
    .filter((semester) => semester.units.length > 0);
});

const totalUnits = computed(() => safeUnits.value.length);

const totalCredits = computed(() =>
  safeUnits.value.reduce((sum, unit) => sum + (Number(unit.credits) || 0), 0)
);

// Helper functions
const formatField = (field: string): string => {
  const fieldNames = {
    informatique: "Informatique",
    gestion: "Gestion",
    btp: "BTP",
  };
  return fieldNames[field as keyof typeof fieldNames] || field;
};
</script>

<style scoped>
.teaching-units-section {
  margin: 3rem 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-header h2 {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  color: var(--primary-color);
  font-size: 1.8rem;
  margin: 0;
}

.section-header h2 svg {
  font-size: 2rem;
}

.total-units {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background-color: rgba(var(--secondary-color-rgb), 0.15);
  border: 1px solid rgba(var(--secondary-color-rgb), 0.3);
  color: var(--secondary-color);
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.9rem;
}

.no-units {
  text-align: center;
  padding: 3rem;
  color: var(--gray-dark);
}

.empty-icon {
  font-size: 3rem;
  color: var(--gray-light);
  margin-bottom: 1rem;
}

.semesters-container {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.semester-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: var(--shadow);
  border-left: 5px solid var(--primary-color);
}

.semester-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.semester-header h3 {
  color: var(--primary-color);
  font-size: 1.4rem;
  margin: 0;
  font-weight: 600;
}

.semester-info {
  display: flex;
  gap: 1rem;
}

.units-count,
.credits-count {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.units-count {
  background-color: rgba(var(--primary-color-rgb), 0.12);
  border: 1px solid rgba(var(--primary-color-rgb), 0.25);
  color: var(--primary-color);
}

.credits-count {
  background-color: rgba(var(--secondary-color-rgb), 0.15);
  border: 1px solid rgba(var(--secondary-color-rgb), 0.3);
  color: var(--secondary-color);
}

.units-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.unit-card {
  background: rgba(var(--primary-color-rgb), 0.04);
  border: 1px solid rgba(var(--primary-color-rgb), 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
}

.unit-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(var(--primary-color-rgb), 0.15);
  border-color: var(--primary-color);
}

.unit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.unit-code {
  background: var(--primary-color);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  font-family: monospace;
}

.unit-credits {
  background: var(--secondary-color);
  color: white;
  padding: 0.3rem 0.7rem;
  border-radius: 15px;
  font-weight: 600;
  font-size: 0.8rem;
}

.unit-name {
  color: var(--primary-color);
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  line-height: 1.3;
}

.unit-description {
  color: var(--gray-dark);
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.unit-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.unit-field,
.unit-semester {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--gray-dark);
}

.unit-field svg,
.unit-semester svg {
  font-size: 1rem;
  color: var(--primary-color);
}

.details-btn {
  width: 100%;
  padding: 0.8rem 1.2rem;
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--secondary-color)
  );
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
}

.details-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(var(--primary-color-rgb), 0.3);
}

.details-btn svg {
  font-size: 1.1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .semester-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .units-grid {
    grid-template-columns: 1fr;
  }

  .unit-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
