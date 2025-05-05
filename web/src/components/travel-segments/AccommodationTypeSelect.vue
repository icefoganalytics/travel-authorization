<template>
  <v-select
    :value="value"
    :items="accommodationTypes"
    :label="label"
    v-bind="$attrs"
    v-on="$listeners"
    @input="$emit('input', $event)"
  />
</template>

<script setup>
import { ACCOMMODATION_TYPES } from "@/api/travel-segments-api"

defineProps({
  value: {
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
