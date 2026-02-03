<template>
  <div class="elite-document-container" :class="`type-${type}`">
    <!-- En-tête avec effet premium -->
    <div class="document-header">
      <div class="header-accent"></div>
      <div class="document-icon">
        <Icon :icon="headerIcon" width="44" height="44" />
      </div>
      <div class="header-content">
        <h2 class="document-title">{{ title }}</h2>
        <div class="document-meta">
          <span class="document-version">
            <Icon icon="mdi:certificate" /> Version {{ version }}
          </span>

        </div>
      </div>
      <div class="watermark" aria-hidden="true">{{ watermarkText }}</div>
    </div>

    <!-- Contenu structuré -->
    <div class="document-content">
      <div class="content-scroll">
        <article v-for="(section, index) in sections" :key="index" class="document-section"
          :class="{ 'last-section': index === sections.length - 1 }">
          <div class="section-header">
            <div class="section-number">
              <span class="number-background"></span>
              <span class="number-value">{{ index + 1 }}</span>
            </div>
            <h3 class="section-title">{{ section.title }}</h3>
          </div>

          <div class="section-content">
            <p class="section-text">{{ section.content }}</p>

            <!-- Sous-sections avec effet premium -->
            <div v-if="section.subsection" class="subsection-container">
              <div v-for="(sub, subIndex) in section.subsection" :key="sub.id" class="subsection">
                <div class="subsection-marker">
                  <div class="marker-number">{{ subIndex + 1 }}</div>
                </div>
                <div class="subsection-content">
                  <div class="subsection-header">
                    <h4 class="subsection-title">
                      {{ sub.title }}
                    </h4>
                    <span class="subsection-id" v-if="showSubsectionIds">#{{ sub.id }}</span>
                  </div>
                  <p class="subsection-text">{{ sub.content }}</p>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>

    <!-- Zone de signature élégante -->
    <div class="acceptance-section">
      <div class="acceptance-border"></div>
      <div class="acceptance-content">
        <Field :name="fieldName" type="checkbox" :id="fieldName" :value="true" class="elite-checkbox"
          @change="toggleApproval" :rules="validation" />
        <label :for="fieldName" class="acceptance-label">
          <div class="signature-icon">
            <Icon :icon="acceptanceIcon" width="22" height="22" />
          </div>
          <span class="acceptance-text">{{ acceptanceText }}</span>
        </label>
      </div>
      <div class="seal-container" :class="{ 'approved': isApproved }">
        <div class="seal">
          <Icon icon="mdi:seal" width="30" height="30" />
        </div>
        <span class="seal-text">{{ isApproved ? 'APPROUVÉ' : 'EN ATTENTE' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Field } from 'vee-validate';
import { Icon } from '@iconify/vue';
import { computed, ref } from 'vue';



interface Subsection {
  id: string;
  title: string;
  content: string;
}

interface Section {
  title: string;
  content: string;
  subsection?: Subsection[];
}

const props = defineProps({
  type: {
    type: String,
    default: 'contract',
    validator: (value: string) => ['contract', 'terms', 'privacy', 'charter'].includes(value)
  },
  title: {
    type: String,
    default: 'DOCUMENT CONTRACTUEL'
  },
  version: {
    type: String,
    default: '1.0.0'
  },
  sections: {
    type: Array as () => Section[],
    default: () => []
  },
  fieldName: {
    type: String,
    default: 'documentAcceptance'
  },
  acceptanceText: {
    type: String,
    default: 'En cochant cette case, je reconnais avoir pris connaissance et accepté sans réserve les termes du présent document.'
  },
  watermark: {
    type: String,
    default: 'CONFIDENTIEL'
  },
  showSubsectionIds: {
    type: Boolean,
    default: false
  },
  validation: {
    type: [Object]
  }
});

const hoverSubsection = ref<string | null>(null);
const isApproved = ref(false);

const headerIcons = {
  contract: 'mdi:file-document-edit-outline',
  terms: 'mdi:file-certificate-outline',
  privacy: 'mdi:shield-lock-outline',
  charter: 'mdi:laptop-account'
};

const acceptanceIcons = {
  contract: 'mdi:signature-freehand',
  terms: 'mdi:stamp',
  privacy: 'mdi:shield-check-outline',
  charter: 'mdi:account-check-outline'
};

const toggleApproval = () => {
  isApproved.value = !isApproved.value;
};

const headerIcon = computed(() => headerIcons[props.type] || 'mdi:file-document-outline');
const acceptanceIcon = computed(() => acceptanceIcons[props.type] || 'mdi:check-circle-outline');
const watermarkText = computed(() => props.watermark.toUpperCase());

</script>

<style scoped>
.elite-document-container {
  background: var(--white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-dark);
  border: 1px solid var(--gray-lighter);
  padding: 0;
  margin: 2rem auto;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.elite-document-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 6px;
  height: 100%;
  background: linear-gradient(to bottom,
      var(--primary-dark) 0%,
      var(--primary-color) 100%);
}

.document-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem 2.5rem;
  position: relative;
  background: var(--white);
  border-bottom: 1px solid var(--gray-lighter);
}

.header-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg,
      var(--primary-dark) 0%,
      var(--primary-color) 50%,
      var(--primary-dark) 100%);
  opacity: 0.8;
}

.document-icon {
  color: var(--primary-color);
  flex-shrink: 0;
  background: var(--white);
  border-radius: var(--rounded);
  padding: 10px;
  border: 1px solid var(--gray-lighter);
  box-shadow: var(--shadow-light);
  z-index: 1;
}

.header-content {
  flex-grow: 1;
}

.document-title {
  color: var(--primary-dark);
  margin: 0;
  font-size: 1.7rem;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  position: relative;
}

.document-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 60px;
  height: 3px;
  background: var(--primary-color);
}

.document-meta {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.8rem;
  font-size: 0.85rem;
  color: var(--primary-color);
  font-weight: 500;
}

.document-meta svg {
  margin-right: 5px;
  vertical-align: middle;
}

.watermark {
  position: absolute;
  right: 2.5rem;
  top: 50%;
  transform: translateY(-50%) rotate(-15deg);
  font-size: 3rem;
  font-weight: 900;
  color: var(--primary-extra-light);
  pointer-events: none;
  user-select: none;
  z-index: 0;
}

.document-content {
  padding: 0 2.5rem;
  position: relative;
}

.content-scroll {
  max-height: 600px;
  overflow-y: auto;
  padding: 1.5rem 0.5rem 1.5rem 0;
}

.document-section {
  margin-bottom: 2.5rem;
  position: relative;
}

.document-section:not(.last-section)::after {
  content: '';
  position: absolute;
  bottom: -1.25rem;
  left: 36px;
  right: 0;
  height: 1px;
  background: linear-gradient(to right,
      var(--primary-color-light) 0%,
      rgba(80, 134, 193, 0) 100%);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  margin-bottom: 1.25rem;
}

.section-number {
  position: relative;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
}

.number-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--primary-extra-light);
  border-radius: var(--rounded);
}

.number-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1rem;
  font-weight: 700;
  color: var(--primary-color);
}

.section-title {
  color: var(--primary-dark);
  font-size: 1.25rem;
  margin: 0;
  font-weight: 600;
  flex-grow: 1;
}

.section-text {
  color: var(--black);
  line-height: 1.8;
  margin: 0 0 1.5rem 0;
  padding-left: 48px;
  font-size: 0.95rem;
}

.subsection-container {
  margin-top: 1.5rem;
  padding-left: 48px;
}

.subsection {
  margin-bottom: 1.5rem;
  position: relative;
}

.subsection:last-child {
  margin-bottom: 0;
}

.subsection-marker {
  position: absolute;
  left: -38px;
  top: 3px;
}

.marker-number {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--primary-color);
  background: var(--white);
  width: 22px;
  height: 22px;
  border-radius: var(--rounded);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--gray-lighter);
  box-shadow: var(--shadow-light);
}

.subsection-content {
  background: var(--white);
  border-radius: var(--radius);
  padding: 1.25rem;
  border: 1px solid var(--gray-lighter);
  box-shadow: var(--shadow-light);
  position: relative;
  transition: all 0.3s ease;
}

.subsection:hover .subsection-content {
  box-shadow: var(--shadow);
  border-color: var(--primary-light);
}

.subsection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.subsection-title {
  color: var(--primary-dark);
  font-size: 1.05rem;
  margin: 0;
  font-weight: 600;
}

.subsection-id {
  font-size: 0.75rem;
  color: var(--primary-color);
  font-weight: 500;
  letter-spacing: 0.5px;
}

.subsection-text {
  color: var(--black);
  line-height: 1.7;
  margin: 0;
  font-size: 0.9rem;
}

.acceptance-section {
  padding: 2rem 2.5rem;
  background: var(--primary-extra-light);
  border-top: 1px solid var(--gray-lighter);
  position: relative;
}

.acceptance-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(to right,
      var(--primary-dark) 0%,
      var(--primary-color) 50%,
      var(--primary-dark) 100%);
  opacity: 0.3;
}

.acceptance-content {
  display: flex;
  align-items: center;
  gap: 1.2rem;
  position: relative;
  z-index: 1;
}

.elite-checkbox {
  width: 22px;
  height: 22px;
  appearance: none;
  background: var(--white);
  border: 1px solid var(--gray-lighter);
  border-radius: var(--radius);
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.elite-checkbox:checked {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.elite-checkbox:checked::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 8px;
  border-left: 2px solid var(--white);
  border-bottom: 2px solid var(--white);
  transform: translate(-50%, -60%) rotate(-45deg);
}

.acceptance-label {
  color: var(--primary-dark);
  line-height: 1.6;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-weight: 500;
  font-size: 0.95rem;
  flex-grow: 1;
}

.signature-icon {
  color: var(--primary-color);
  flex-shrink: 0;
}

.acceptance-text {
  flex-grow: 1;
}

.seal-container {
  position: absolute;
  right: 2.5rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  transition: all 0.5s ease;
}

.seal {
  color: var(--primary-color);
  transition: all 0.3s ease;
}

.seal-text {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 1px;
  color: var(--primary-color);
  text-transform: uppercase;
}

.seal-container.approved .seal {
  animation: sealApprove 0.8s ease forwards;
  filter: drop-shadow(0 0 8px rgba(80, 134, 193, 0.3));
}

.seal-container.approved .seal-text {
  color: var(--primary-dark);
  font-weight: 700;
}

/* Styles spécifiques par type */
.elite-document-container.type-terms {
  --primary-color: var(--secondary-color);
  --primary-dark: var(--secondary-dark);
  --primary-light: var(--secondary-light);
  --primary-extra-light: var(--secondary-extra-light);
}

.elite-document-container.type-privacy {
  --primary-color: var(--accent-color);
  --primary-dark: var(--accent-dark);
  --primary-light: var(--accent-light);
}

.elite-document-container.type-charter {
  --primary-color: var(--warning);
  --primary-dark: var(--warning-dark);
  --primary-light: var(--warning-light);
  --primary-extra-light: rgba(255, 165, 2, 0.1);
}

/* Animations */
@keyframes sealApprove {
  0% {
    transform: scale(1) rotate(0deg);
  }

  25% {
    transform: scale(1.2) rotate(15deg);
  }

  50% {
    transform: scale(0.9) rotate(-15deg);
  }

  75% {
    transform: scale(1.1) rotate(5deg);
  }

  100% {
    transform: scale(1) rotate(0deg);
  }
}

/* Scrollbar élégante */
.content-scroll::-webkit-scrollbar {
  width: 6px;
}

.content-scroll::-webkit-scrollbar-track {
  background: var(--gray-super-light);
  border-radius: 3px;
}

.content-scroll::-webkit-scrollbar-thumb {
  background: var(--primary-color-light);
  border-radius: 3px;
}

.content-scroll::-webkit-scrollbar-thumb:hover {
  background: var(--primary-color);
}

/* Responsive */
@media (max-width: 768px) {
  .elite-document-container {
    margin: 1rem;
    border-radius: var(--radius-lg);
  }

  .document-header,
  .document-content,
  .acceptance-section {
    padding: 1.5rem;
  }

  .document-title {
    font-size: 1.4rem;
  }

  .watermark {
    right: 1.5rem;
    font-size: 2rem;
  }

  .section-text,
  .subsection-container {
    padding-left: 0;
  }

  .subsection-marker {
    position: static;
    margin-bottom: 0.5rem;
  }

  .seal-container {
    right: 1.5rem;
    top: 30px;
    transform: none;
  }

  .acceptance-content {
    flex-wrap: wrap;
  }

  .acceptance-label {
    width: 100%;
    margin-top: 1rem;
  }
}

@media (max-width: 480px) {
  .document-header {
    flex-wrap: wrap;
  }

  .document-icon {
    order: 1;
  }

  .header-content {
    order: 3;
    width: 100%;
    margin-top: 1rem;
  }

  .watermark {
    order: 2;
    position: static;
    transform: none;
    text-align: right;
    font-size: 1.5rem;
    margin-top: -15px;
  }
}
</style>
