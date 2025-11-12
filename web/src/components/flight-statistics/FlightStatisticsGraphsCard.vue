<template>
  <v-skeleton-loader
    v-if="isLoading"
    type="card"
  />
  <v-card
    v-else
    class="px-5 pb-15"
  >
    <v-row>
      <v-col cols="8" />
      <v-col cols="4">
        <v-btn-toggle
          v-model="selectedChart"
          mandatory
          color="primary"
          @change="resetIntefaceAndAggregateData"
        >
          <v-btn :value="ChartType.PIE"> Pie </v-btn>
          <v-btn :value="ChartType.BAR"> Bar </v-btn>
        </v-btn-toggle>
      </v-col>
    </v-row>
    <v-row class="mt-0">
      <v-col cols="8">
        <ApexCharts
          v-if="selectedChart === ChartType.PIE"
          type="pie"
          height="550"
          :options="chartOptions"
          :series="series"
        />
        <ApexCharts
          v-else-if="selectedChart === ChartType.BAR"
          type="bar"
          :options="chartOptions"
          :series="series"
        />
      </v-col>
      <v-col cols="4">
        <v-sheet>
          <v-card>
            <v-card-title>Group By</v-card-title>
            <v-card-text>
              <v-radio-group
                v-for="(dataGroup, dataGroupInx) in dataGroups"
                :key="dataGroupInx"
                v-model="selectedDataGroup"
              >
                <v-radio
                  :value="dataGroup"
                  :label="dataGroup"
                  @change="aggregateAndDisplayData"
                />
              </v-radio-group>
            </v-card-text>
          </v-card>

          <v-card class="mt-4">
            <v-card-title>Show</v-card-title>
            <v-card-text>
              <v-radio-group
                v-for="(dataFilter, dataFilterInx) in dataFilters"
                :key="dataFilterInx"
                v-model="selectedDataFilter"
              >
                <v-radio
                  :value="dataFilter"
                  :label="dataFilter"
                  @change="aggregateAndDisplayData"
                />
              </v-radio-group>
            </v-card-text>
          </v-card>
        </v-sheet>
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
enum FlightStatisticsDataGroups {
  DESTINATION_CITY = "Destination City",
  PROVINCE = "Province",
  DEPARTMENT = "Department",
}

enum FlightStatisticsDataFilters {
  TOTAL_TRIPS = "Total Trips",
  TOTAL_EXPENSES = "Total Expenses",
  TOTAL_FLIGHT_COST = "Total Flight Cost",
  AVERAGE_DURATION = "Average Duration",
}

enum ChartType {
  PIE = "pie",
  BAR = "bar",
}

type ChartSeries = number[] | { name: string; data: number[] }[]
</script>

<script setup lang="ts">
import { computed, nextTick, ref } from "vue"
import { compact, map, uniq } from "lodash"

import ApexCharts from "vue-apexcharts"
import { type ApexOptions } from "apexcharts"

import { MAX_PER_PAGE } from "@/api/base-api"
import useFlightStatistics, {
  type FlightStatisticAsIndex,
  type FlightStatisticFiltersOptions,
} from "@/use/use-flight-statistics"

const props = withDefaults(
  defineProps<{
    filters: FlightStatisticFiltersOptions
    updateGraph: number
  }>(),
  {
    filters: () => ({}),
    updateGraph: 0,
  }
)

const flightStatisticsQuery = computed(() => ({
  filters: props.filters,
  perPage: MAX_PER_PAGE, // TODO: aggregate data in back-end to avoid overflow and performance issues.
}))
const { flightStatistics, isLoading } = useFlightStatistics(flightStatisticsQuery)

const selectedChart = ref(ChartType.PIE)

const dataGroups = computed(() => Object.values(FlightStatisticsDataGroups))
const dataFilters = computed(() => Object.values(FlightStatisticsDataFilters))
const selectedDataGroup = ref<string>(FlightStatisticsDataGroups.DESTINATION_CITY)
const selectedDataFilter = ref<string>(FlightStatisticsDataFilters.TOTAL_TRIPS)

const series = ref<ChartSeries>([])
const chartOptions = ref<ApexOptions>({})

async function resetIntefaceAndAggregateData() {
  resetInterface()
  await aggregateAndDisplayData()
}

async function resetInterface() {
  selectedDataGroup.value = FlightStatisticsDataGroups.DESTINATION_CITY
  selectedDataFilter.value = FlightStatisticsDataFilters.TOTAL_TRIPS
}

async function aggregateAndDisplayData() {
  await nextTick()

  extractData(selectedDataGroup.value, selectedDataFilter.value)
}

async function extractData(dataGroup: string, dataFilter: string) {
  if (dataGroup === FlightStatisticsDataGroups.DESTINATION_CITY) {
    setupValues("destinationCity", dataFilter)
  } else if (dataGroup === FlightStatisticsDataGroups.PROVINCE) {
    setupValues("destinationProvince", dataFilter)
  } else if (dataGroup === FlightStatisticsDataGroups.DEPARTMENT) {
    setupValues("department", dataFilter)
  }
}

function setupValues(groupByField: keyof FlightStatisticAsIndex, dataFilter: string) {
  const categoryLabels = extractUniqueCategoriesFrom(groupByField)
  const metricTotalsPerCategory = categoryLabels.map((label) =>
    calculateTotalMetricForCategory(label, groupByField, dataFilter)
  )

  if (selectedChart.value === ChartType.PIE) {
    configurePieChart(categoryLabels, metricTotalsPerCategory)
  } else if (selectedChart.value === ChartType.BAR) {
    configureBarOrLineChart(categoryLabels, metricTotalsPerCategory, dataFilter)
  }
}

function extractUniqueCategoriesFrom(field: keyof FlightStatisticAsIndex): string[] {
  return uniq(
    compact(flightStatistics.value.map((flightStatistic) => flightStatistic[field]?.toString()))
  )
}

function configurePieChart(labels: string[], values: number[]) {
  series.value = values
  chartOptions.value = { labels }
}

function configureBarOrLineChart(labels: string[], values: number[], dataFilter: string) {
  series.value = [{ name: dataFilter, data: values }]
  chartOptions.value = {
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
      categories: labels,
    },
  }
}

function calculateTotalMetricForCategory(
  category: string,
  groupByField: keyof FlightStatisticAsIndex,
  dataFilter: string
): number {
  const flightStatiticsInCategory = flightStatistics.value.filter(
    (flightStatitic) => flightStatitic[groupByField] === category
  )

  let metricValues: number[]

  if (dataFilter === FlightStatisticsDataFilters.TOTAL_TRIPS) {
    metricValues = map(flightStatiticsInCategory, "totalTrips")
  } else if (dataFilter === FlightStatisticsDataFilters.TOTAL_EXPENSES) {
    metricValues = map(flightStatiticsInCategory, "totalExpenses")
  } else if (dataFilter === FlightStatisticsDataFilters.TOTAL_FLIGHT_COST) {
    metricValues = map(flightStatiticsInCategory, "totalFlightCost")
  } else if (dataFilter === FlightStatisticsDataFilters.AVERAGE_DURATION) {
    metricValues = map(flightStatiticsInCategory, "averageDurationDays")
  } else {
    metricValues = []
  }

  return metricValues.reduce((sum, value) => sum + Number(value), 0)
}
</script>
