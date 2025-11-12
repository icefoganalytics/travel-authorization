<template>
  <v-skeleton-loader
    v-if="loadingData"
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
            v-if="tabs == 0"
            id="chart"
            :key="pieId"
          >
            <div
              v-if="series.length == 0"
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
            v-else-if="tabs == 1"
            id="chart"
            :key="barId"
          >
            <ApexCharts
              type="bar"
              :options="chartOptions"
              :series="series"
            />
          </div>

          <!-- <div
            v-else-if="tabs == 2"
            id="chart"
            :key="lineId"
          >
            <ApexCharts
              type="line"
              :options="chartOptions"
              :series="series"
            />
          </div> -->
        </v-col>
        <v-col cols="4">
          <v-card style="border: 0px solid white !important">
            <v-toolbar
              v-if="!loadingData"
              class=""
              height="20px"
              flat
            >
              <template #extension>
                <v-tabs
                  v-model="tabs"
                  active-class="primary--text teal lighten-5"
                  @change="selectTab()"
                >
                  <v-tab>Pie</v-tab>
                  <v-tab>Bar</v-tab>
                  <!-- <v-tab>Line</v-tab> -->
                </v-tabs>
              </template>
            </v-toolbar>

            <v-tabs-items
              v-if="!loadingData"
              v-model="tabs"
            >
              <v-tab-item>
                <v-checkbox
                  v-if="filtersApplied"
                  v-model="filteredData"
                  label="Use Filtered Data"
                  class="ml-4"
                  hide-details
                  @change="getData()"
                />
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
                    v-model="pieChartSelectedDisplayFields"
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
                <v-checkbox
                  v-if="filtersApplied"
                  v-model="filteredData"
                  label="Use Filtered Data"
                  class="ml-4"
                  hide-details
                  @change="getData()"
                />

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
                    v-model="barChartSelectedDisplayFields"
                  >
                    <v-radio
                      :value="barShow"
                      :label="barShow"
                      @change="selectBarOption"
                    />
                  </v-radio-group>
                </v-card>
              </v-tab-item>
              <!-- <v-tab-item>
                <v-checkbox
                  v-if="filtersApplied"
                  v-model="filteredData"
                  label="Use Filtered Data"
                  class="ml-4"
                  value="true"
                  hide-details
                />
                <div class="my-3 ml-4">Group By</div>

                <v-card
                  style="padding: 1.5rem"
                  class="mt-2 mx-4"
                  flat
                >
                  <v-radio-group
                    v-for="(lineGroup, lineGroupInx) in chartsFilter.groupBy"
                    :key="lineGroupInx"
                    v-model="lineChartSelectedGroupBy"
                  >
                    <v-radio
                      :value="lineGroup"
                      :label="lineGroup"
                      @change="selectLineOption"
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
                    v-for="(lineShow, lineShowInx) in chartsFilter.show"
                    :key="lineShowInx"
                    v-model="lineChartSelectedDisplayFields"
                  >
                    <v-radio
                      :value="lineShow"
                      :label="lineShow"
                      @change="selectLineOption"
                    />
                  </v-radio-group>
                </v-card>
              </v-tab-item> -->
            </v-tabs-items>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-card>
</template>

<script lang="ts">
type ChartSeries = number[] | { name: string; data: number[] }[]
</script>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from "vue"
import { cloneDeep, compact, uniq } from "lodash"

import ApexCharts from "vue-apexcharts"
import { type ApexOptions } from "apexcharts"

import { type FlightStatisticAsIndex } from "@/api/flight-statistics-api"

const props = withDefaults(
  defineProps<{
    filtersApplied: boolean
    allFlightReports: FlightStatisticAsIndex[]
    filteredFlightReport: FlightStatisticAsIndex[]
    updateGraph: number
  }>(),
  {
    allFlightReports: () => [],
    filteredFlightReport: () => [],
    updateGraph: 0,
  }
)

const tabs = ref(0)
const series = ref<ChartSeries>([])
const chartOptions = ref<ApexOptions>({})
const flightReport = ref<FlightStatisticAsIndex[]>([])
const filteredData = ref(false)

const chartsFilter = ref({
  groupBy: ["Destination City", "Province", "Department"],
  show: ["Total Trips", "Total Expences", "Total Flight Cost", "Average Duration"],
})

const pieChartSelectedGroupBy = ref<string | null>(null)
const pieChartSelectedDisplayFields = ref<string | null>(null)

const lineChartSelectedGroupBy = ref<string | null>(null)
const lineChartSelectedDisplayFields = ref<string | null>(null)

const barChartSelectedGroupBy = ref<string | null>(null)
const barChartSelectedDisplayFields = ref<string | null>(null)

const pieId = ref(0)
const barId = ref(0)
const lineId = ref(0)

const loadingData = ref(false)

watch(
  () => props.updateGraph,
  async () => {
    await getData()
  }
)

onMounted(async () => {
  await initFilters()
})

async function initFilters() {
  pieChartSelectedGroupBy.value = null
  pieChartSelectedDisplayFields.value = null

  barChartSelectedGroupBy.value = null
  barChartSelectedDisplayFields.value = null

  lineChartSelectedGroupBy.value = null
  lineChartSelectedDisplayFields.value = null

  getData()
}

async function getData() {
  loadingData.value = true
  if (filteredData.value) {
    flightReport.value = cloneDeep(props.filteredFlightReport)
  } else {
    flightReport.value = cloneDeep(props.allFlightReports)
  }
  selectTab()

  await nextTick()
  loadingData.value = false
}

async function selectTab() {
  if (tabs.value == 0) {
    pieChartSelectedGroupBy.value = "Destination City"
    pieChartSelectedDisplayFields.value = "Total Trips"
    await selectPieOption()
  } else if (tabs.value == 1) {
    barChartSelectedGroupBy.value = "Destination City"
    barChartSelectedDisplayFields.value = "Total Trips"
    await selectBarOption()
  } else if (tabs.value == 2) {
    lineChartSelectedGroupBy.value = "Destination City"
    lineChartSelectedDisplayFields.value = "Total Trips"
    await selectLineOption()
  }
}

async function selectPieOption() {
  await nextTick()

  if (pieChartSelectedGroupBy.value && pieChartSelectedDisplayFields.value) {
    extractData(pieChartSelectedGroupBy.value, pieChartSelectedDisplayFields.value)
  }
  pieId.value++
}

async function selectBarOption() {
  await nextTick()

  if (barChartSelectedGroupBy.value && barChartSelectedDisplayFields.value) {
    extractData(barChartSelectedGroupBy.value, barChartSelectedDisplayFields.value)
  }
  barId.value++
}

async function selectLineOption() {
  await nextTick()

  if (lineChartSelectedGroupBy.value && lineChartSelectedDisplayFields.value) {
    extractData(lineChartSelectedGroupBy.value, lineChartSelectedDisplayFields.value)
  }
  lineId.value++
}

async function extractData(labelGroup: string, displayFields: string) {
  if (labelGroup == "Destination City") {
    setupValues("destinationCity", displayFields)
  } else if (labelGroup == "Province") {
    setupValues("destinationProvince", displayFields)
  } else if (labelGroup == "Department") {
    setupValues("department", displayFields)
  }
}

function setupValues(groupByField: keyof FlightStatisticAsIndex, displayFields: string) {
  const categoryLabels = extractUniqueCategoriesFrom(groupByField)
  const metricTotalsPerCategory = categoryLabels.map((label) =>
    calculateTotalMetricForCategory(label, groupByField, displayFields)
  )

  const isPieChartSelected = tabs.value === 0
  if (isPieChartSelected) {
    configurePieChart(categoryLabels, metricTotalsPerCategory)
  } else {
    configureBarOrLineChart(categoryLabels, metricTotalsPerCategory, displayFields)
  }
}

function extractUniqueCategoriesFrom(field: keyof FlightStatisticAsIndex): string[] {
  return uniq(compact(flightReport.value.map((flight) => flight[field]?.toString())))
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
  const flightsInCategory = flightReport.value.filter((flight) => flight[groupByField] == category)

  let metricValues: number[]

  if (metricName == "Total Trips") {
    metricValues = flightsInCategory.map((flight) => flight.totalTrips)
  } else if (metricName == "Total Expences") {
    metricValues = flightsInCategory.map((flight) => flight.totalExpenses)
  } else if (metricName == "Total Flight Cost") {
    metricValues = flightsInCategory.map((flight) => flight.totalFlightCost)
  } else if (metricName == "Average Duration") {
    metricValues = flightsInCategory.map((flight) => flight.averageDurationDays)
  } else {
    metricValues = []
  }

  return metricValues.reduce((sum, value) => sum + Number(value), 0)
}
</script>
