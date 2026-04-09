<template>
  <v-stepper
    :key="stepsHash"
    :model-value="currentStepNumber"
    :width="mdAndUp ? 250 : undefined"
  >
    <v-stepper-item
      v-for="(step, index) in steps"
      :key="index"
      :value="index + 1"
      :color="index + 1 === currentStepNumber ? 'primary' : undefined"
      :title="step.title"
      :subtitle="step.subtitle"
      :complete="index + 1 < currentStepNumber"
      :editable="step.editable"
      @click="updateCurrentWizardStepName(step.id, step.editable)"
    >
    </v-stepper-item>
  </v-stepper>
</template>

<script setup>
import { computed } from "vue"
import { useDisplay } from "vuetify"
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

const { mdAndUp } = useDisplay()
</script>
