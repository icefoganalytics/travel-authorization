<template>
  <v-stepper
    :key="stepsHash"
    :value="currentStepNumber"
    vertical
    outlined
    :width="$vuetify.breakpoint.mdAndUp ? 250 : undefined"
  >
    <v-stepper-step
      v-for="(step, index) in steps"
      :key="index"
      :step="index + 1"
      :complete="index + 1 < currentStepNumber"
      :editable="step.editable"
      @click="updateCurrentWizardStepName(step.id, step.editable)"
    >
      {{ step.title }}
      <small v-if="step.subtitle">
        {{ step.subtitle }}
      </small>
    </v-stepper-step>
  </v-stepper>
</template>

<script setup>
import { computed } from "vue"
import md5 from "md5"

const props = defineProps({
  stepName: {
    type: String,
    default: null,
  },
  steps: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(["update:stepName"])

const stepsHash = computed(() => md5(JSON.stringify(props.steps)))

const currentStepNumber = computed(() => {
  return props.steps.findIndex((step) => step.id === props.stepName) + 1
})

function updateCurrentWizardStepName(wizardStepName, editable) {
  if (editable) {
    emit("update:stepName", wizardStepName)
  }
}
</script>
