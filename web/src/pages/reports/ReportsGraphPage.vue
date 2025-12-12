<template>
  <FlightStatisticsGraphsCard :filters="filters" />
</template>

<script setup lang="ts">
import { type FlightStatisticFiltersOptions } from "@/api/flight-statistics-api"

import FlightStatisticsGraphsCard from "@/components/flight-statistics/FlightStatisticsGraphsCard.vue"

withDefaults(
  defineProps<{
    filters?: FlightStatisticFiltersOptions
  }>(),
  {
    filters: () => ({}),
  }
)
</script>

<style scoped></style>
