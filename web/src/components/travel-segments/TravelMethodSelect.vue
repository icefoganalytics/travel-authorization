<template>
  <v-select
    :value="value"
    :items="travelMethods"
    :label="label"
    v-bind="$attrs"
    v-on="$listeners"
    @input="$emit('input', $event)"
  />
</template>

<script setup>
import { TRAVEL_METHODS } from "@/api/travel-segments-api"

defineProps({
  value: {
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
