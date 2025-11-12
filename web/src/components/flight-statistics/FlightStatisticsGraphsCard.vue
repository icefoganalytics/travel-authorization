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
import { compact, isNil, map, uniq } from "lodash"

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

const dataGroupToFieldMap = Object.freeze(
  new Map<FlightStatisticsDataGroups, keyof FlightStatisticAsIndex>([
    [FlightStatisticsDataGroups.DESTINATION_CITY, "destinationCity"],
    [FlightStatisticsDataGroups.PROVINCE, "destinationProvince"],
    [FlightStatisticsDataGroups.DEPARTMENT, "department"],
  ])
)

const dataFilterToPropertyMap = Object.freeze(
  new Map<FlightStatisticsDataFilters, keyof FlightStatisticAsIndex>([
    [FlightStatisticsDataFilters.TOTAL_TRIPS, "totalTrips"],
    [FlightStatisticsDataFilters.TOTAL_EXPENSES, "totalExpenses"],
    [FlightStatisticsDataFilters.TOTAL_FLIGHT_COST, "totalFlightCost"],
    [FlightStatisticsDataFilters.AVERAGE_DURATION, "averageDurationDays"],
  ])
)

const flightStatisticsQuery = computed(() => ({
  filters: props.filters,
  perPage: MAX_PER_PAGE, // TODO: aggregate data in back-end to avoid overflow and performance issues.
}))
const { flightStatistics, isLoading } = useFlightStatistics(flightStatisticsQuery)

const selectedChart = ref(ChartType.PIE)

const dataGroups = computed(() => Object.values(FlightStatisticsDataGroups))
const dataFilters = computed(() => Object.values(FlightStatisticsDataFilters))
const selectedDataGroup = ref<FlightStatisticsDataGroups>(
  FlightStatisticsDataGroups.DESTINATION_CITY
)
const selectedDataFilter = ref<FlightStatisticsDataFilters>(FlightStatisticsDataFilters.TOTAL_TRIPS)

const groupByField = computed<keyof FlightStatisticAsIndex>(() => {
  const fieldName = dataGroupToFieldMap.get(selectedDataGroup.value)
  if (!isNil(fieldName)) return fieldName

  const validGroups = Array.from(dataGroupToFieldMap.keys()).join(", ")
  throw new Error(
    `No field mapping found for data group '${selectedDataGroup.value}'. Valid data groups are: ${validGroups}`
  )
})

const categoryLabels = computed(() => {
  return uniq(
    compact(
      flightStatistics.value.map((flightStatistic) =>
        flightStatistic[groupByField.value]?.toString()
      )
    )
  )
})

const flightStatisticsByCategory = computed(() => {
  const categoryMap = new Map<string, FlightStatisticAsIndex[]>()

  for (const flightStatistic of flightStatistics.value) {
    const category = flightStatistic[groupByField.value]?.toString()
    if (isNil(category)) continue

    let statisticsByCategory = categoryMap.get(category)
    if (isNil(statisticsByCategory)) {
      statisticsByCategory = []
      categoryMap.set(category, statisticsByCategory)
    }
    statisticsByCategory.push(flightStatistic)
  }

  return categoryMap
})

const metricProperty = computed(() => dataFilterToPropertyMap.get(selectedDataFilter.value)!)

const metricTotalsPerCategory = computed(() =>
  categoryLabels.value.map((category) => {
    const flightStatiticsInCategory = flightStatisticsByCategory.value.get(category) ?? []
    const metricValues = map(flightStatiticsInCategory, metricProperty.value)
    return metricValues.reduce<number>((sum, value) => sum + Number(value), 0)
  })
)

const series = computed<ChartSeries>(() => {
  if (selectedChart.value === ChartType.PIE) {
    return metricTotalsPerCategory.value
  } else {
    return [{ name: selectedDataFilter.value, data: metricTotalsPerCategory.value }]
  }
})

const chartOptions = computed<ApexOptions>(() => {
  if (selectedChart.value === ChartType.PIE) {
    return { labels: categoryLabels.value }
  } else {
    return {
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
        categories: categoryLabels.value,
      },
    }
  }
})

async function resetIntefaceAndAggregateData() {
  await resetInterface()
}

async function resetInterface() {
  selectedDataGroup.value = FlightStatisticsDataGroups.DESTINATION_CITY
  selectedDataFilter.value = FlightStatisticsDataFilters.TOTAL_TRIPS
}

async function aggregateAndDisplayData() {
  await nextTick()
}
</script>
