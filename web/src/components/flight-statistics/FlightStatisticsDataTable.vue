<template>
  <v-data-table
    :page.sync="page"
    :items-per-page.sync="perPage"
    :sort-by.sync="vuetify2SortBy"
    :sort-desc.sync="vuetify2SortDesc"
    :headers="headers"
    :items="flightStatistics"
    :server-items-length="totalCount"
    :loading="isLoading"
  >
    <template #item.totalExpenses="{ item }">
      {{ formatCurrency(item.totalExpenses) }}
    </template>
    <template #item.totalFlightCost="{ item }">
      {{ formatCurrency(item.totalFlightCost) }}
    </template>
    <template #item.averageExpensesPerDay="{ item }">
      {{ formatCurrency(item.averageExpensesPerDay) }}
    </template>
    <template #item.averageRoundTripFlightCost="{ item }">
      {{ formatCurrency(item.averageRoundTripFlightCost) }}
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import { computed } from "vue"

import { formatCurrency } from "@/utils/formatters"
import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import useVuetify2SortByShim from "@/use/utils/use-vuetify2-sort-by-shim"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"

import {
  type FlightStatisticFiltersOptions,
  type FlightStatisticWhereOptions,
} from "@/api/flight-statistics-api"
import useFlightStatistics from "@/use/use-flight-statistics"

const props = withDefaults(
  defineProps<{
    filters?: FlightStatisticFiltersOptions
    where?: FlightStatisticWhereOptions
    routeQuerySuffix?: string
  }>(),
  {
    filters: () => ({}),
    where: () => ({}),
    routeQuerySuffix: "",
  }
)

const headers = [
  {
    text: "Department Mailcode",
    value: "departmentMailcode",
  },
  {
    text: "Final Destination City",
    value: "destinationCity",
  },
  {
    text: "Final Destination Province",
    value: "destinationProvince",
  },
  {
    text: "Total Trips",
    value: "totalTrips",
  },
  {
    text: "Total Expenses",
    value: "totalExpenses",
  },
  {
    text: "Total Flight Cost",
    value: "totalFlightCost",
  },
  {
    text: "Average Duration (days)",
    value: "averageDurationDays",
  },
  {
    text: "Average Expenses per Day",
    value: "averageExpensesPerDay",
  },
  {
    text: "Average Round Trip Flight Cost",
    value: "averageRoundTripFlightCost",
  },
]

const page = useRouteQuery<string | undefined, number | undefined>(
  `page${props.routeQuerySuffix}`,
  "1",
  {
    transform: integerTransformer,
  }
)
const perPage = useRouteQuery<string | undefined, number | undefined>(
  `perPage${props.routeQuerySuffix}`,
  "10",
  {
    transform: integerTransformer,
  }
)

const sortBy = useVuetifySortByToSafeRouteQuery(`sortBy${props.routeQuerySuffix}`, [
  {
    key: "departmentMailcode",
    order: "asc",
  },
])
const { vuetify2SortBy, vuetify2SortDesc } = useVuetify2SortByShim(sortBy)
const order = useVuetifySortByToSequelizeSafeOrder(sortBy)

const flightStatisticsQuery = computed(() => {
  return {
    filters: props.filters,
    where: props.where,
    order: order.value,
    page: page.value,
    perPage: perPage.value,
  }
})
const { flightStatistics, totalCount, isLoading, refresh } =
  useFlightStatistics(flightStatisticsQuery)

defineExpose({
  refresh,
})
</script>

<style scoped>
::v-deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
