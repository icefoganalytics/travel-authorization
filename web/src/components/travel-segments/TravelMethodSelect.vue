<template>
  <v-select
    :model-value="modelValue"
    :items="travelMethods"
    :label="label"
    v-bind="$attrs"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup>
import { TRAVEL_METHODS } from "@/api/travel-segments-api"

defineProps({
  modelValue: {
    type: String,
    default: TRAVEL_METHODS.AIRCRAFT,
  },
  label: {
    type: String,
    default: "Travel Method",
  },
})

const travelMethods = Object.values(TRAVEL_METHODS)
</script>
