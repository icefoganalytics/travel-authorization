<template>
  <FlightStatisticsDataTable :filters="filters" />
</template>

<script setup lang="ts">
import { type FlightStatisticFiltersOptions } from "@/api/flight-statistics-api"

import FlightStatisticsDataTable from "@/components/flight-statistics/FlightStatisticsDataTable.vue"

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
