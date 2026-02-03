<template>
  <div class="step-progress-container">
    <div class="steps-wrapper">
      <div v-for="step in stepData" :key="step.step" class="step" :class="{
        'active': currentStep >= step.step,
        'completed': currentStep > step.step
      }">
        <div class="step-connector" v-if="step.step > 1"></div>
        <div class="step-indicator">
          <span v-if="currentStep > step.step" class="step-icon">
            <Icon :name="step.icons" />
          </span>
          <span v-else class="step-number">{{ step.step }}</span>
        </div>
        <span class="step-label">{{ step.title }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import type { StepDataInterface } from '~/interfaces/stepData';




defineProps<{
  stepData: StepDataInterface[],
  currentStep: number
}>()



</script>

<style scoped>
.step-progress-container {
  width: 100%;
  padding: 1rem 2rem;
}

.steps-wrapper {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
}

.step-connector {
  position: absolute;
  top: 20px;
  left: -50%;
  right: 50%;
  height: 4px;
  background: #e0e0e0;
  z-index: 1;
}

.step.active .step-connector {
  background: var(--primary-color, #3b82f6);
}

.step.completed .step-connector {
  background: var(--success-color, #10b981);
}

.step-indicator {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
}

.step-number {
  color: #909090;
  font-weight: 600;
}

.step-icon {
  color: white;
  font-weight: bold;
  font-size: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-label {
  font-size: 0.9rem;
  color: #909090;
  text-align: center;
  padding: 0 0.5rem;
}

/* Styles actifs */
.step.active .step-indicator {
  background: var(--primary-color, #3b82f6);
  color: white;
}

.step.active .step-number {
  color: white;
}

.step.active .step-label {
  color: var(--primary-color, #3b82f6);
  font-weight: 600;
}

/* Styles complétés */
.step.completed .step-indicator {
  background: var(--success-color, #10b981);
}

/* Animation */
.step-indicator {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

@media (max-width: 768px) {
  .step-label {
    font-size: 0.8rem;
  }

  .step-indicator {
    width: 32px;
    height: 32px;
  }
}
</style>