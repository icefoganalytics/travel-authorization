<template>
  <v-select
    :model-value="modelValue"
    :items="seatPreferences"
    :label="label"
    v-bind="$attrs"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>

<script setup>
import { SEAT_PREFERENCE_TYPES } from "@/api/travel-desk-flight-requests-api"

defineProps({
  modelValue: {
    type: String,
    default: () => null,
  },
  label: {
    type: String,
    default: "Seat Preference",
  },
})

const emit = defineEmits(["update:modelValue"])

const seatPreferences = Object.values(SEAT_PREFERENCE_TYPES)
</script>
