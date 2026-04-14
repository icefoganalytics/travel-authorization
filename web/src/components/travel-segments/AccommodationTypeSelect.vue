<template>
  <v-select
    :model-value="modelValue"
    :items="accommodationTypes"
    :label="label"
    v-bind="$attrs"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup>
import { ACCOMMODATION_TYPES } from "@/api/travel-segments-api"

defineProps({
  modelValue: {
    type: String,
    default: ACCOMMODATION_TYPES.HOTEL,
  },
  label: {
    type: String,
    default: "Type of Accommodation",
  },
})

const accommodationTypes = Object.values(ACCOMMODATION_TYPES)
</script>
