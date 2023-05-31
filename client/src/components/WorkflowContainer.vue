<script setup>
/** import:global **/
import { computed } from 'vue';
/** import:global **/

/** import:components **/
import {
  TButton
} from 'coffeebrew-vue-components';
/** import:components **/

/** section:props **/
const props = defineProps({
  steps: {
    type: Array,
    default() {
      return [];
    },
  },
  currentStepNumber: {
    type: Number,
    default: 0,
  },
});
/** section:props **/

/** section:emit **/
const emit = defineEmits(['prevStep', 'nextStep', 'submit']);
/** section:emit **/

/** section:global **/
const hasPrevStep = computed(() => {
  return props.currentStepNumber < props.steps.length - 1 && props.currentStepNumber > 0;
});

const hasNextStep = computed(() => {
  return props.currentStepNumber < props.steps.length - 1;
});

const submitStep = computed(() => {
  if (props.steps.length === 1) {
    return true;
  } else {
    return props.currentStepNumber === props.steps.length - 2;
  }
});
/** section:global **/

/** section:action **/
function prevStep() {
  if (props.currentStepNumber > 0) {
    emit('prevStep', props.currentStepNumber - 1);
  }
}

function nextStep() {
  if (props.currentStepNumber < props.steps.length - 1) {
    emit('nextStep', props.currentStepNumber + 1);
  }
}

function submit() {
  emit('submit');
}
/** section:action **/

/** section:styles **/
function breadcrumbStyle(i) {
  if (props.currentStepNumber === i) {
    return `step-breadcrumb active`;
  } else {
    return `step-breadcrumb`;
  }
}
/** section:styles **/
</script>

<template>
  <div class="workflow-container">
    <div class="step-breadcrumbs">
      <div
        v-for="(step, i) in steps"
        :key="i"
        :class="breadcrumbStyle(i)"
      >
        <div class="title">
          {{ step.title }}
        </div>
        <i
          v-if="i !== steps.length - 1"
          class="fa-solid fa-caret-right"
        />
      </div> <!-- step-breadcrumb -->
    </div> <!-- step-breadcrumbs -->

    <div
      v-for="(step, i) in steps"
      v-show="currentStepNumber === i"
      :key="i"
      class="step-container"
    >
      <slot
        v-bind="{ step, i }"
        :name="`step-${i}`"
      />
    </div> <!-- step-container -->

    <div class="actions">
      <TButton
        v-if="hasPrevStep"
        value="Prev Step"
        icon="fa-solid fa-arrow-left"
        @click="prevStep()"
      />
      <TButton
        v-if="hasNextStep && !submitStep"
        value="Next Step"
        icon="fa-solid fa-arrow-right"
        @click="nextStep()"
      />
      <TButton
        v-if="submitStep"
        value="Submit"
        icon="fa-solid fa-check"
        @click="submit()"
      />
    </div> <!-- actions -->
  </div> <!-- workflow-container -->
</template>

<style scoped>
.workflow-container {
  margin: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.step-breadcrumbs {
  display: flex;
  gap: 1rem;
}

.step-breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  font-size: 0.8rem;
  color: var(--color-border);
}

.step-breadcrumb.active {
  color: var(--color-text);
}

.step-breadcrumb.active .title {
  font-weight: 900;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}
</style>
