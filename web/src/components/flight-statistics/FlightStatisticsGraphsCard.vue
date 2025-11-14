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
          @change="resetInterface"
        >
          <v-btn :value="ChartType.PIE"> Pie </v-btn>
          <v-btn :value="ChartType.BAR"> Bar </v-btn>
        </v-btn-toggle>
      </v-col>
    </v-row>
    <v-row class="mt-0">
      <v-col cols="8">
        <FlightStatisticsPieChart
          v-if="selectedChart === ChartType.PIE"
          :key="chartStateBusterKey"
          :category-labels="categoryLabels"
          :metric-totals="metricTotalsPerCategory"
          :y-formatter-function="valueFormatter"
        />
        <FlightStatisticsBarChart
          v-else-if="selectedChart === ChartType.BAR"
          :key="chartStateBusterKey"
          :category-labels="categoryLabels"
          :metric-totals="metricTotalsPerCategory"
          :metric-name="selectedDataFilter"
          :y-formatter-function="valueFormatter"
        />
      </v-col>
      <v-col cols="4">
        <v-sheet>
          <v-card>
            <v-card-title>Group By</v-card-title>
            <v-card-text>
              <v-radio-group
                v-for="(dataGroup, dataGroupInx) in DATA_GROUPS"
                :key="dataGroupInx"
                v-model="selectedDataGroup"
                @change="chartStateBusterKey++"
              >
                <v-radio
                  :value="dataGroup"
                  :label="dataGroup"
                />
              </v-radio-group>
            </v-card-text>
          </v-card>

          <v-card class="mt-4">
            <v-card-title>Show</v-card-title>
            <v-card-text>
              <v-radio-group
                v-for="(dataFilter, dataFilterInx) in DATA_FILTERS"
                :key="dataFilterInx"
                v-model="selectedDataFilter"
                @change="chartStateBusterKey++"
              >
                <v-radio
                  :value="dataFilter"
                  :label="dataFilter"
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
// NOTE: department field contains mail codes, not department names
enum FlightStatisticsDataGroups {
  DESTINATION_CITY = "Destination City",
  PROVINCE = "Province",
  DEPARTMENT = "Department",
}

enum FlightStatisticsDataFilters {
  TOTAL_TRIPS = "Total Trips",
  TOTAL_EXPENSES = "Total Expenses",
  TOTAL_FLIGHT_COST = "Total Flight Cost",
  TOTAL_DAYS = "Total Days",
}

enum ChartType {
  PIE = "pie",
  BAR = "bar",
}
</script>

<script setup lang="ts">
import { computed, ref } from "vue"
import { compact, isNil, map, uniq } from "lodash"

import useRouteQuery from "@/use/utils/use-route-query"

import { MAX_PER_PAGE } from "@/api/base-api"
import useFlightStatistics, {
  type FlightStatisticAsIndex,
  type FlightStatisticFiltersOptions,
} from "@/use/use-flight-statistics"
import { formatCurrency } from "@/utils/formatters"

import FlightStatisticsBarChart from "@/components/flight-statistics/FlightStatisticsBarChart.vue"
import FlightStatisticsPieChart from "@/components/flight-statistics/FlightStatisticsPieChart.vue"

const props = withDefaults(
  defineProps<{
    filters: FlightStatisticFiltersOptions
  }>(),
  {
    filters: () => ({}),
  }
)

const selectedChart = useRouteQuery<ChartType>("selectedChart", ChartType.PIE)
const selectedDataGroup = useRouteQuery<FlightStatisticsDataGroups>(
  "selectedDataGroup",
  FlightStatisticsDataGroups.DESTINATION_CITY
)
const selectedDataFilter = useRouteQuery<FlightStatisticsDataFilters>(
  "selectedDataFilter",
  FlightStatisticsDataFilters.TOTAL_TRIPS
)

const chartStateBusterKey = ref(0)

const DATA_GROUP_TO_FIELD_MAP = Object.freeze(
  new Map<FlightStatisticsDataGroups, keyof FlightStatisticAsIndex>([
    [FlightStatisticsDataGroups.DESTINATION_CITY, "destinationCity"],
    [FlightStatisticsDataGroups.PROVINCE, "destinationProvince"],
    [FlightStatisticsDataGroups.DEPARTMENT, "department"],
  ])
)

const DATA_FILTER_TO_PROPERTY_MAP = Object.freeze(
  new Map<FlightStatisticsDataFilters, keyof FlightStatisticAsIndex>([
    [FlightStatisticsDataFilters.TOTAL_TRIPS, "totalTrips"],
    [FlightStatisticsDataFilters.TOTAL_EXPENSES, "totalExpenses"],
    [FlightStatisticsDataFilters.TOTAL_FLIGHT_COST, "totalFlightCost"],
    [FlightStatisticsDataFilters.TOTAL_DAYS, "totalDays"],
  ])
)

const DATA_GROUPS = Object.freeze(Object.values(FlightStatisticsDataGroups))
const DATA_FILTERS = Object.freeze(Object.values(FlightStatisticsDataFilters))

const flightStatisticsQuery = computed(() => ({
  filters: props.filters,
  perPage: MAX_PER_PAGE, // TODO: aggregate data in back-end to avoid overflow and performance issues.
}))
const { flightStatistics, isLoading, refresh } = useFlightStatistics(flightStatisticsQuery)

const valueFormatter = computed(() => {
  if (
    [
      FlightStatisticsDataFilters.TOTAL_EXPENSES,
      FlightStatisticsDataFilters.TOTAL_FLIGHT_COST,
    ].includes(selectedDataFilter.value)
  ) {
    return (value: number) => formatCurrency(value)
  }

  if (selectedDataFilter.value === FlightStatisticsDataFilters.TOTAL_DAYS) {
    return (value: number) => value.toFixed(0)
  }

  return (value: number) => value.toFixed(1)
})

const groupByField = computed<keyof FlightStatisticAsIndex>(() => {
  const fieldName = DATA_GROUP_TO_FIELD_MAP.get(selectedDataGroup.value)
  if (!isNil(fieldName)) return fieldName

  const validGroups = DATA_GROUPS.join(", ")
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

const metricProperty = computed(() => DATA_FILTER_TO_PROPERTY_MAP.get(selectedDataFilter.value))

const metricTotalsPerCategory = computed(() =>
  categoryLabels.value.map((category) => {
    const flightStatiticsInCategory = flightStatisticsByCategory.value.get(category) ?? []
    const metricValues = map(flightStatiticsInCategory, metricProperty.value)
    return metricValues.reduce<number>((sum, value) => sum + Number(value), 0)
  })
)

async function resetInterface() {
  selectedDataGroup.value = FlightStatisticsDataGroups.DESTINATION_CITY
  selectedDataFilter.value = FlightStatisticsDataFilters.TOTAL_TRIPS
  chartStateBusterKey.value++
}

async function refreshAndBustState() {
  await refresh()
  chartStateBusterKey.value++
}

defineExpose({
  refresh: refreshAndBustState,
})
</script>
