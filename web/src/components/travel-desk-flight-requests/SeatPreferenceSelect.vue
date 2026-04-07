<template>
  <v-select
    :value="value"
    :items="seatPreferences"
    :label="label"
    v-bind="$attrs"
    @input="emit('input', $event)"
  />
</template>

<script setup>
import { SEAT_PREFERENCE_TYPES } from "@/api/travel-desk-flight-requests-api"

defineProps({
  value: {
    type: String,
    default: () => null,
  },
  label: {
    type: String,
    default: "Seat Preference",
  },
})

const emit = defineEmits(["input"])

const seatPreferences = Object.values(SEAT_PREFERENCE_TYPES)
</script>
