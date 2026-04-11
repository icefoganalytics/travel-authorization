<template>
  <FlightStatisticsDataTableServer :filters="filters" />
</template>

<script setup lang="ts">
import { type FlightStatisticFiltersOptions } from "@/api/flight-statistics-api"

import FlightStatisticsDataTableServer from "@/components/flight-statistics/FlightStatisticsDataTableServer.vue"

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
