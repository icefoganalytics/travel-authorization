<template>
  <v-select
    :value="value"
    :label="label"
    :items="locationTypeOptions"
    v-bind="$attrs"
    @input="emit('input', $event)"
    v-on="$listeners"
  />
</template>

<script setup lang="ts">
import { computed } from "vue"

import { TravelDeskRentalCarLocationTypes } from "@/api/travel-desk-rental-cars-api"

withDefaults(
  defineProps<{
    value?: string | null
    label?: string
  }>(),
  {
    value: null,
    label: "Location Type",
  }
)

const emit = defineEmits<{
  (event: "input", value: string): void
}>()

const locationTypeOptions = computed(() => [
  {
    text: "Airport",
    value: TravelDeskRentalCarLocationTypes.AIRPORT,
  },
  {
    text: "Hotel",
    value: TravelDeskRentalCarLocationTypes.HOTEL,
  },
  {
    text: "Downtown",
    value: TravelDeskRentalCarLocationTypes.DOWNTOWN,
  },
  {
    text: "Other",
    value: TravelDeskRentalCarLocationTypes.OTHER,
  },
])
</script>
