<template>
  <v-select
    :model-value="modelValue"
    :label="label"
    :items="PERIOD_OPTIONS"
    v-bind="$attrs"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>

<script setup>
import { range } from "lodash"

const PERIOD_OPTIONS = range(1, 13).concat(14) // [1-12, 14]

defineProps({
  modelValue: {
    type: Number,
    default: null,
  },
  label: {
    type: String,
    default: "Reconciliation period",
  },
})

const emit = defineEmits(["update:modelValue"])
</script>
