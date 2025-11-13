<template>
  <div class="mx-10 mb-5">
    <v-data-table
      :headers="headers"
      :items="flightReport"
      :items-per-page="15"
      class="elevation-1 mt-4"
    >
      <template
        v-if="isAdmin"
        #top
      >
        <v-btn
          class="ml-auto"
          color="secondary"
          @click="exportToExcel"
        >
          Download Data
        </v-btn>

        <PrintReport :flight-report="flightReport" />
      </template>

      <template #item.totalExpenses="{ item }">
        <span v-if="item.totalExpenses > 0"
          >${{ Number(item.totalExpenses).toFixed(2) | currency }}</span
        >
      </template>
      <template #item.totalFlightCost="{ item }">
        <span v-if="item.totalFlightCost > 0"
          >${{ Number(item.totalFlightCost).toFixed(2) | currency }}</span
        >
      </template>
      <template #item.averageExpensesPerDay="{ item }">
        <span v-if="item.averageExpensesPerDay > 0"
          >${{ Number(item.averageExpensesPerDay).toFixed(2) | currency }}</span
        >
      </template>
      <template #item.averageRoundTripFlightCost="{ item }">
        <span v-if="item.averageRoundTripFlightCost > 0"
          >${{ Number(item.averageRoundTripFlightCost).toFixed(2) | currency }}</span
        >
      </template>
    </v-data-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { ExportToCsv } from "export-to-csv"

import { type FlightStatisticAsIndex } from "@/api/flight-statistics-api"
import useCurrentUser from "@/use/use-current-user"

import PrintReport from "@/modules/reports/views/Common/PrintReport.vue"

const props = withDefaults(
  defineProps<{
    flightReport: FlightStatisticAsIndex[]
  }>(),
  {
    flightReport: () => [],
  }
)

const { isAdmin } = useCurrentUser<true>()

const headers = [
  {
    text: "Department",
    value: "department",
    class: "blue-grey lighten-4",
  },
  {
    text: "Final Destination City",
    value: "destinationCity",
    class: "blue-grey lighten-4",
  },
  {
    text: "Final Destination Province",
    value: "destinationProvince",
    class: "blue-grey lighten-4",
  },
  {
    text: "Total Trips",
    value: "totalTrips",
    class: "blue-grey lighten-4",
  },
  {
    text: "Total Expenses",
    value: "totalExpenses",
    class: "blue-grey lighten-4",
  },
  {
    text: "Total Flight Cost",
    value: "totalFlightCost",
    class: "blue-grey lighten-4",
  },
  {
    text: "Average Duration (days)",
    value: "averageDurationDays",
    class: "blue-grey lighten-4",
  },
  {
    text: "Average Expenses per Day",
    value: "averageExpensesPerDay",
    class: "blue-grey lighten-4",
  },
  {
    text: "Average Round Trip Flight Cost",
    value: "averageRoundTripFlightCost",
    class: "blue-grey lighten-4",
  },
]

const loadingData = ref(false)

async function exportToExcel() {
  const csvInfo = props.flightReport.map((flight) => {
    return {
      department: flight.department ? flight.department : "",
      finalDestinationCity: flight.destinationCity ? flight.destinationCity : "",
      finalDestinationProvince: flight.destinationProvince ? flight.destinationProvince : "",
      totalTrips: flight.totalTrips ? flight.totalTrips : "",
      totalExpenses: flight.totalExpenses ? "$ " + Number(flight.totalExpenses).toFixed(2) : "",
      totalFlightCost: flight.totalFlightCost
        ? "$ " + Number(flight.totalFlightCost).toFixed(2)
        : "",
      averageDurationDays: flight.averageDurationDays ? flight.averageDurationDays : "",
      averageExpensesPerDay: flight.averageExpensesPerDay
        ? "$ " + Number(flight.averageExpensesPerDay).toFixed(2)
        : "",
      averageRoundTripFlightCost: flight.averageRoundTripFlightCost
        ? "$ " + Number(flight.averageRoundTripFlightCost).toFixed(2)
        : "",
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
