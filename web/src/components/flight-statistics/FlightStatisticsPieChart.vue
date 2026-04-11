<template>
  <ApexCharts
    type="pie"
    height="550"
    :options="chartOptions"
    :series="series"
  />
</template>

<script setup lang="ts">
import { type ApexOptions } from "apexcharts"
import ApexCharts from "vue3-apexcharts"

import { computed } from "vue"

const props = defineProps<{
  categoryLabels: string[]
  metricTotals: number[]
  yFormatterFunction: (value: number) => string
}>()

const series = computed(() => props.metricTotals)

const chartOptions = computed<ApexOptions>(() => ({
  labels: props.categoryLabels,
  tooltip: {
    y: {
      formatter: props.yFormatterFunction,
    },
  },
  dataLabels: {
    formatter: props.yFormatterFunction,
  },
}))
</script>
