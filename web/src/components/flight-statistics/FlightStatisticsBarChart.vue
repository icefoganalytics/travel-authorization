<template>
  <ApexCharts
    type="bar"
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
  metricName: string
}>()

const series = computed(() => [{ name: props.metricName, data: props.metricTotals }])

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    height: 350,
    type: "line",
    zoom: {
      enabled: false,
    },
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: "straight",
  },
  title: {
    text: "",
    align: "left",
  },
  grid: {
    row: {
      colors: ["#f3f3f3", "transparent"],
      opacity: 0.5,
    },
  },
  xaxis: {
    categories: props.categoryLabels,
  },
}))
</script>
