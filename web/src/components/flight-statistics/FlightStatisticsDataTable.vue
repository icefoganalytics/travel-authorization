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
    <!-- TODO: consider moving to parent component -->
    <template
      v-if="isAdmin"
      #top
    >
      <div class="d-flex justify-end">
        <FlightStatisticsExportToCsvButton
          :filters="filters"
          :where="where"
          color="primary"
          outlined
        />

        <PrintReport :flight-report="flightStatistics" />
        <v-btn
          color="secondary"
          class="ml-2"
          @click="openFlightStatisticsJobsModal"
        >
          Update Reports
          <FlightStatisticsJobsModal ref="flightStatisticsJobsModal" />
        </v-btn>
      </div>
    </template>

    <template #item.totalExpenses="{ item }">
      <span>{{ formatCurrency(item.totalExpenses) }}</span>
    </template>
    <template #item.totalFlightCost="{ item }">
      <span>{{ formatCurrency(item.totalFlightCost) }}</span>
    </template>
    <template #item.averageExpensesPerDay="{ item }">
      <span>{{ formatCurrency(item.averageExpensesPerDay) }}</span>
    </template>
    <template #item.averageRoundTripFlightCost="{ item }">
      <span>{{ formatCurrency(item.averageRoundTripFlightCost) }}</span>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"

import { formatCurrency } from "@/utils/formatters"

import {
  type FlightStatisticFiltersOptions,
  type FlightStatisticWhereOptions,
} from "@/api/flight-statistics-api"
import useCurrentUser from "@/use/use-current-user"

import PrintReport from "@/modules/reports/views/Common/PrintReport.vue"
import FlightStatisticsExportToCsvButton from "@/components/flight-statistics/FlightStatisticsExportToCsvButton.vue"
import FlightStatisticsJobsModal from "@/components/flight-statistic-jobs/FlightStatisticsJobsModal.vue"
import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useVuetify2SortByShim from "@/use/utils/use-vuetify2-sort-by-shim"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"
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
    text: "Department",
    value: "department",
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
    key: "department",
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

const { isAdmin } = useCurrentUser<true>()

const flightStatisticsJobsModal = ref<InstanceType<typeof FlightStatisticsJobsModal>>()

function openFlightStatisticsJobsModal() {
  flightStatisticsJobsModal.value?.open()
}

defineExpose({
  refresh,
})
</script>

<style scoped>
::v-deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
