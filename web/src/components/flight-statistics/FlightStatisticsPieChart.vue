<template>
  <ApexCharts
    type="pie"
    height="550"
    :options="chartOptions"
    :series="series"
  />
</template>

<script setup lang="ts">
import { computed } from "vue"

import ApexCharts from "vue-apexcharts"
import { type ApexOptions } from "apexcharts"

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
