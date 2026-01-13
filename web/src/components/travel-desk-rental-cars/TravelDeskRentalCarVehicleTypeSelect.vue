<template>
  <v-select
    :value="value"
    :label="label"
    :items="vehicleTypeOptions"
    v-bind="$attrs"
    @input="emit('input', $event)"
    v-on="$listeners"
  />
</template>

<script setup lang="ts">
import { computed } from "vue"

import { TravelDeskRentalCarVehicleTypes } from "@/api/travel-desk-rental-cars-api"

withDefaults(
  defineProps<{
    value?: string | null
    label?: string
  }>(),
  {
    value: null,
    label: "Vehicle Type",
  }
)

const emit = defineEmits<{
  (event: "input", value: string): void
}>()

const vehicleTypeOptions = computed(() => [
  {
    text: "Economy",
    value: TravelDeskRentalCarVehicleTypes.ECONOMY,
  },
  {
    text: "Compact",
    value: TravelDeskRentalCarVehicleTypes.COMPACT,
  },
  {
    text: "Intermediate",
    value: TravelDeskRentalCarVehicleTypes.INTERMEDIATE,
  },
  {
    text: "Standard",
    value: TravelDeskRentalCarVehicleTypes.STANDARD,
  },
  {
    text: "Full-Size",
    value: TravelDeskRentalCarVehicleTypes.FULL_SIZE,
  },
  {
    text: "Intermediate SUV",
    value: TravelDeskRentalCarVehicleTypes.INTERMEDIATE_SUV,
  },
  {
    text: "Luxury",
    value: TravelDeskRentalCarVehicleTypes.LUXURY,
  },
  {
    text: "Minivan",
    value: TravelDeskRentalCarVehicleTypes.MINIVAN,
  },
  {
    text: "Standard SUV",
    value: TravelDeskRentalCarVehicleTypes.STANDARD_SUV,
  },
  {
    text: "Full-Size SUV",
    value: TravelDeskRentalCarVehicleTypes.FULL_SIZE_SUV,
  },
  {
    text: "Pickup Truck",
    value: TravelDeskRentalCarVehicleTypes.PICKUP_TRUCK,
  },
])
</script>
