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
              v-if="!isLoading"
              class=""
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

            <v-tabs-items
              v-if="!isLoading"
              v-model="selectedTab"
            >
              <v-tab-item>
                <div class="my-3 ml-4">Group By</div>

                <v-card
                  style="padding: 1.5rem"
                  class="mt-2 mx-4"
                  flat
                >
                  <v-radio-group
                    v-for="(pieGroup, pieGroupInx) in chartsFilter.groupBy"
                    :key="pieGroupInx"
                    v-model="pieChartSelectedGroupBy"
                  >
                    <v-radio
                      :value="pieGroup"
                      :label="pieGroup"
                      @change="selectPieOption"
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
                    v-for="(pieShow, pieShowInx) in chartsFilter.show"
                    :key="pieShowInx"
                    v-model="pieChartSelectedDisplayField"
                  >
                    <v-radio
                      :value="pieShow"
                      :label="pieShow"
                      @change="selectPieOption"
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
                    v-for="(barGroup, barGroupInx) in chartsFilter.groupBy"
                    :key="barGroupInx"
                    v-model="barChartSelectedGroupBy"
                  >
                    <v-radio
                      :value="barGroup"
                      :label="barGroup"
                      @change="selectBarOption"
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
                    v-for="(barShow, barShowInx) in chartsFilter.show"
                    :key="barShowInx"
                    v-model="barChartSelectedDisplayField"
                  >
                    <v-radio
                      :value="barShow"
                      :label="barShow"
                      @change="selectBarOption"
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

const chartsFilter = ref({
  groupBy: Object.values(FlightStatisticsDataGroups),
  show: Object.values(FlightStatisticsDataFilters),
})

const pieChartSelectedGroupBy = ref<string>(FlightStatisticsDataGroups.DESTINATION_CITY)
const pieChartSelectedDisplayField = ref<string>(FlightStatisticsDataFilters.TOTAL_TRIPS)

const barChartSelectedGroupBy = ref<string>(FlightStatisticsDataGroups.DESTINATION_CITY)
const barChartSelectedDisplayField = ref<string>(FlightStatisticsDataFilters.TOTAL_TRIPS)

const pieId = ref(0)
const barId = ref(0)

async function resetIntefaceAndAggregateData() {
  resetInterface()

  if (selectedTab.value === 0) {
    await selectPieOption()
  } else if (selectedTab.value === 1) {
    await selectBarOption()
  }
}

async function resetInterface() {
  pieChartSelectedGroupBy.value = FlightStatisticsDataGroups.DESTINATION_CITY
  pieChartSelectedDisplayField.value = FlightStatisticsDataFilters.TOTAL_TRIPS

  barChartSelectedGroupBy.value = FlightStatisticsDataGroups.DESTINATION_CITY
  barChartSelectedDisplayField.value = FlightStatisticsDataFilters.TOTAL_TRIPS
}

async function selectPieOption() {
  await nextTick()

  if (pieChartSelectedGroupBy.value && pieChartSelectedDisplayField.value) {
    extractData(pieChartSelectedGroupBy.value, pieChartSelectedDisplayField.value)
  }
  pieId.value++
}

async function selectBarOption() {
  await nextTick()

  if (barChartSelectedGroupBy.value && barChartSelectedDisplayField.value) {
    extractData(barChartSelectedGroupBy.value, barChartSelectedDisplayField.value)
  }
  barId.value++
}

async function extractData(labelGroup: string, displayFields: string) {
  if (labelGroup === FlightStatisticsDataGroups.DESTINATION_CITY) {
    setupValues("destinationCity", displayFields)
  } else if (labelGroup === FlightStatisticsDataGroups.PROVINCE) {
    setupValues("destinationProvince", displayFields)
  } else if (labelGroup === FlightStatisticsDataGroups.DEPARTMENT) {
    setupValues("department", displayFields)
  }
}

function setupValues(groupByField: keyof FlightStatisticAsIndex, displayFields: string) {
  const categoryLabels = extractUniqueCategoriesFrom(groupByField)
  const metricTotalsPerCategory = categoryLabels.map((label) =>
    calculateTotalMetricForCategory(label, groupByField, displayFields)
  )

  const isPieChartSelected = selectedTab.value === 0
  if (isPieChartSelected) {
    configurePieChart(categoryLabels, metricTotalsPerCategory)
  } else {
    configureBarOrLineChart(categoryLabels, metricTotalsPerCategory, displayFields)
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

function configureBarOrLineChart(labels: string[], values: number[], metricName: string) {
  series.value = [{ name: metricName, data: values }]
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
  metricName: string
): number {
  const flightStatiticsInCategory = flightStatistics.value.filter(
    (flightStatitic) => flightStatitic[groupByField] === category
  )

  let metricValues: number[]

  if (metricName === FlightStatisticsDataFilters.TOTAL_TRIPS) {
    metricValues = map(flightStatiticsInCategory, "totalTrips")
  } else if (metricName === FlightStatisticsDataFilters.TOTAL_EXPENSES) {
    metricValues = map(flightStatiticsInCategory, "totalExpenses")
  } else if (metricName === FlightStatisticsDataFilters.TOTAL_FLIGHT_COST) {
    metricValues = map(flightStatiticsInCategory, "totalFlightCost")
  } else if (metricName === FlightStatisticsDataFilters.AVERAGE_DURATION) {
    metricValues = map(flightStatiticsInCategory, "averageDurationDays")
  } else {
    metricValues = []
  }

  return metricValues.reduce((sum, value) => sum + Number(value), 0)
}
</script>
