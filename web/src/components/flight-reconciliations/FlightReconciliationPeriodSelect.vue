<template>
  <v-select
    :value="value"
    :label="label"
    :items="PERIOD_OPTIONS"
    v-bind="$attrs"
    @input="emit('input', $event)"
  />
</template>

<script setup>
import { range } from "lodash"

const PERIOD_OPTIONS = range(1, 13).concat(14) // [1-12, 14]

defineProps({
  value: {
    type: Number,
    default: null,
  },
  label: {
    type: String,
    default: "Reconciliation period",
  },
})

const emit = defineEmits(["input"])
</script>
