<template>
  <v-select
    :model-value="modelValue"
    :label="label"
    :items="vehicleTypeOptions"
    v-bind="$attrs"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
import { computed } from "vue"

import { TravelDeskRentalCarVehicleTypes } from "@/api/travel-desk-rental-cars-api"

withDefaults(
  defineProps<{
    modelValue?: string | null
    label?: string
  }>(),
  {
    modelValue: null,
    label: "Vehicle Type",
  }
)

const emit = defineEmits<{
  (event: "update:modelValue", value: string | null): void
}>()

const vehicleTypeOptions = computed(() => [
  {
    title: "Economy",
    value: TravelDeskRentalCarVehicleTypes.ECONOMY,
  },
  {
    title: "Compact",
    value: TravelDeskRentalCarVehicleTypes.COMPACT,
  },
  {
    title: "Intermediate",
    value: TravelDeskRentalCarVehicleTypes.INTERMEDIATE,
  },
  {
    title: "Standard",
    value: TravelDeskRentalCarVehicleTypes.STANDARD,
  },
  {
    title: "Full-Size",
    value: TravelDeskRentalCarVehicleTypes.FULL_SIZE,
  },
  {
    title: "Intermediate SUV",
    value: TravelDeskRentalCarVehicleTypes.INTERMEDIATE_SUV,
  },
  {
    title: "Luxury",
    value: TravelDeskRentalCarVehicleTypes.LUXURY,
  },
  {
    title: "Minivan",
    value: TravelDeskRentalCarVehicleTypes.MINIVAN,
  },
  {
    title: "Standard SUV",
    value: TravelDeskRentalCarVehicleTypes.STANDARD_SUV,
  },
  {
    title: "Full-Size SUV",
    value: TravelDeskRentalCarVehicleTypes.FULL_SIZE_SUV,
  },
  {
    title: "Pickup Truck",
    value: TravelDeskRentalCarVehicleTypes.PICKUP_TRUCK,
  },
])
</script>
