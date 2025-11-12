<template>
  <v-skeleton-loader
    v-if="isLoading"
    type="card"
  />
  <v-card
    v-else
    class="px-5 pb-15"
  >
    <div>
      <v-row>
        <v-col
          style="margin: 5rem 0"
          cols="8"
        >
          <div
            v-if="selectedTab === 0"
            id="chart"
            :key="pieId"
          >
            <div
              v-if="series.length === 0"
              class="text-h5"
            >
              No data available
            </div>
            <ApexCharts
              type="pie"
              height="550"
              :options="chartOptions"
              :series="series"
            />
          </div>

          <div
            v-else-if="selectedTab === 1"
            id="chart"
            :key="barId"
          >
            <ApexCharts
              type="bar"
              :options="chartOptions"
              :series="series"
            />
          </div>
        </v-col>
        <v-col cols="4">
          <v-card style="border: 0px solid white !important">
            <v-toolbar
              height="20px"
              flat
            >
              <template #extension>
                <v-tabs
                  v-model="selectedTab"
                  active-class="primary--text teal lighten-5"
                  @change="resetIntefaceAndAggregateData"
                >
                  <v-tab>Pie</v-tab>
                  <v-tab>Bar</v-tab>
                </v-tabs>
              </template>
            </v-toolbar>

            <v-tabs-items v-model="selectedTab">
              <v-tab-item>
                <div class="my-3 ml-4">Group By</div>

                <v-card
                  style="padding: 1.5rem"
                  class="mt-2 mx-4"
                  flat
                >
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
                </v-card>

                <div class="my-3 ml-4">Show</div>

                <v-card
                  style="padding: 1.5rem"
                  class="mt-2 mx-4"
                  flat
                >
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
                </v-card>
              </v-tab-item>
              <v-tab-item>
                <div class="my-3 ml-4">Group By</div>

                <v-card
                  style="padding: 1.5rem"
                  class="mt-2 mx-4"
                  flat
                >
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
                </v-card>

                <div class="my-3 ml-4">Show</div>

                <v-card
                  style="padding: 1.5rem"
                  class="mt-2 mx-4"
                  flat
                >
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
                </v-card>
              </v-tab-item>
            </v-tabs-items>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-card>
</template>

<script lang="ts">
type ChartSeries = number[] | { name: string; data: number[] }[]

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

const selectedTab = ref(0)
const series = ref<ChartSeries>([])
const chartOptions = ref<ApexOptions>({})

const dataGroups = computed(() => Object.values(FlightStatisticsDataGroups))
const dataFilters = computed(() => Object.values(FlightStatisticsDataFilters))

const selectedDataGroup = ref<string>(FlightStatisticsDataGroups.DESTINATION_CITY)
const selectedDataFilter = ref<string>(FlightStatisticsDataFilters.TOTAL_TRIPS)

const pieId = ref(0)
const barId = ref(0)

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

  if (selectedDataGroup.value && selectedDataFilter.value) {
    extractData(selectedDataGroup.value, selectedDataFilter.value)
  }

  if (selectedTab.value === 0) {
    pieId.value++
  } else if (selectedTab.value === 1) {
    barId.value++
  }
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

  const isPieChartSelected = selectedTab.value === 0
  if (isPieChartSelected) {
    configurePieChart(categoryLabels, metricTotalsPerCategory)
  } else {
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
