<template>
  <v-select
    :model-value="modelValue"
    :items="travelDeskOtherTransportationTypes"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import { computed } from "vue"

import { TravelDeskOtherTransportationTypes } from "@/api/travel-desk-other-transportations-api"

defineProps<{
  modelValue?: string | null
}>()

const travelDeskOtherTransportationTypes = computed(() => [
  {
    text: "Shuttle",
    value: TravelDeskOtherTransportationTypes.SHUTTLE,
  },
  {
    text: "Bus",
    value: TravelDeskOtherTransportationTypes.BUS,
  },
  {
    text: "Train",
    value: TravelDeskOtherTransportationTypes.TRAIN,
  },
])
</script>
