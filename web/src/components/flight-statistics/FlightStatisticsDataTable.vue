<template>
  <v-data-table
    :headers="headers"
    :items="flightStatistics"
    :items-per-page="15"
    :loading="isLoading"
  >
    <!-- TODO: consider moving to parent component -->
    <template
      v-if="isAdmin"
      #top
    >
      <div class="d-flex justify-end">
        <v-btn
          color="secondary"
          @click="exportToExcel"
        >
          Download Data
        </v-btn>

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
import { ref } from "vue"
import { ExportToCsv } from "export-to-csv"

import { formatCurrency } from "@/utils/formatters"

import { type FlightStatisticAsIndex } from "@/api/flight-statistics-api"
import useCurrentUser from "@/use/use-current-user"

import PrintReport from "@/modules/reports/views/Common/PrintReport.vue"
import FlightStatisticsJobsModal from "@/components/flight-statistic-jobs/FlightStatisticsJobsModal.vue"

const props = withDefaults(
  defineProps<{
    flightStatistics: FlightStatisticAsIndex[]
  }>(),
  {
    flightStatistics: () => [],
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

const isLoading = ref(false)
const { isAdmin } = useCurrentUser<true>()

const flightStatisticsJobsModal = ref<InstanceType<typeof FlightStatisticsJobsModal>>()

function openFlightStatisticsJobsModal() {
  flightStatisticsJobsModal.value?.open()
}

async function exportToExcel() {
  const csvInfo = props.flightStatistics.map((flightStatistic) => {
    return {
      department: flightStatistic.department || "",
      finalDestinationCity: flightStatistic.destinationCity || "",
      finalDestinationProvince: flightStatistic.destinationProvince || "",
      totalTrips: flightStatistic.totalTrips || "",
      totalExpenses: formatCurrency(flightStatistic.totalExpenses),
      totalFlightCost: formatCurrency(flightStatistic.totalFlightCost),
      averageDurationDays: flightStatistic.averageDurationDays || "",
      averageExpensesPerDay: formatCurrency(flightStatistic.averageExpensesPerDay),
      averageRoundTripFlightCost: formatCurrency(flightStatistic.averageRoundTripFlightCost),
    }
  })
  const options = {
    fieldSeparator: ",",
    quoteStrings: '"',
    decimalSeparator: ".",
    showLabels: true,
    showTitle: false,
    title: "",
    filename: "Flights",
    useTextFile: false,
    useBom: true,
    useKeysAsHeaders: false,
    headers: [
      "Department",
      "Final Destination City",
      "Final Destination Province",
      "Total Trips",
      "Total Expenses",
      "Total Flight Cost",
      "Average Duration (days)",
      "Average Expenses per Day",
      "Average Round Trip Flight Cost",
    ],
  }
  const csvExporter = new ExportToCsv(options)
  csvExporter.generateCsv(csvInfo)
}
</script>

<style scoped>
::v-deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
