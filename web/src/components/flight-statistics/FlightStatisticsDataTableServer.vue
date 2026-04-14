<template>
  <v-data-table-server
    v-model:page="page"
    v-model:items-per-page="perPage"
    v-model:sort-by="sortBy"
    :headers="headers"
    :items="flightStatistics"
    :items-length="totalCount"
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
  </v-data-table-server>
</template>

<script setup lang="ts">
import { computed } from "vue"

import { formatCurrency } from "@/utils/formatters"
import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
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
    title: "Department Mailcode",
    key: "departmentMailcode",
  },
  {
    title: "Final Destination City",
    key: "destinationCity",
  },
  {
    title: "Final Destination Province",
    key: "destinationProvince",
  },
  {
    title: "Total Trips",
    key: "totalTrips",
  },
  {
    title: "Total Expenses",
    key: "totalExpenses",
  },
  {
    title: "Total Flight Cost",
    key: "totalFlightCost",
  },
  {
    title: "Average Duration (days)",
    key: "averageDurationDays",
  },
  {
    title: "Average Expenses per Day",
    key: "averageExpensesPerDay",
  },
  {
    title: "Average Round Trip Flight Cost",
    key: "averageRoundTripFlightCost",
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
:deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
