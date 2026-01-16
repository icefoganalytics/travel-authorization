<template>
  <v-select
    :value="value"
    :items="travelDeskOtherTransportationTypes"
    v-bind="$attrs"
    v-on="$listeners"
  />
</template>

<script setup lang="ts">
import { computed } from "vue"

import { TravelDeskOtherTransportationTypes } from "@/api/travel-desk-other-transportations-api"

defineProps<{
  value?: string | null
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
