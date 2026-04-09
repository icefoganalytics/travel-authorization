<template>
  <v-select
    :model-value="modelValue"
    :label="label"
    :items="locationTypeOptions"
    v-bind="$attrs"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
import { computed } from "vue"

import { TravelDeskRentalCarLocationTypes } from "@/api/travel-desk-rental-cars-api"

withDefaults(
  defineProps<{
    modelValue?: string | null
    label?: string
  }>(),
  {
    modelValue: null,
    label: "Location Type",
  }
)

const emit = defineEmits<{
  (event: "update:modelValue", value: string | null): void
}>()

const locationTypeOptions = computed(() => [
  {
    title: "Airport",
    value: TravelDeskRentalCarLocationTypes.AIRPORT,
  },
  {
    title: "Hotel",
    value: TravelDeskRentalCarLocationTypes.HOTEL,
  },
  {
    title: "Downtown",
    value: TravelDeskRentalCarLocationTypes.DOWNTOWN,
  },
  {
    title: "Other",
    value: TravelDeskRentalCarLocationTypes.OTHER,
  },
])
</script>
