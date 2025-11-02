<template>
  <div class="mx-10 mb-5">
    <v-row
      v-if="admin && !loadingData"
      class="my-0 mx-0"
    >
      <v-btn
        class="ml-auto"
        color="secondary"
        @click="exportToExcel()"
      >
        Download Data
      </v-btn>

      <print-report
        :flight-report="flightReport"
        @close="printClosed()"
      />
    </v-row>

    <v-data-table
      :headers="headers"
      :items="flightReport"
      :items-per-page="15"
      class="elevation-1 mt-4"
    >
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

<script>
import Vue from "vue"
import { ExportToCsv } from "export-to-csv"
import PrintReport from "@/modules/reports/views/Common/PrintReport.vue"

export default {
  name: "FlightReport",
  components: {
    PrintReport,
  },
  props: {
    flightReport: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      headers: [
        {
          text: "Department",
          value: "dept",
          class: "blue-grey lighten-4",
        },
        {
          text: "Final Destination City",
          value: "finalDestinationCity",
          class: "blue-grey lighten-4",
        },
        {
          text: "Final Destination Province",
          value: "finalDestinationProvince",
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
      ],
      admin: false,
      flightReportInfo: [],
      loadingData: false,
    }
  },
  mounted() {
    this.admin = true
    //TODO: update this
    const temp = Vue.filter("isAdmin")()
    console.log(temp)
    // this.flightReportInfo = this.flightReport;
  },

  methods: {
    exportToExcel() {
      const csvInfo = this.flightReport.map((flight) => {
        return {
          department: flight.dept ? flight.dept : "",
          finalDestinationCity: flight.finalDestinationCity ? flight.finalDestinationCity : "",
          finalDestinationProvince: flight.finalDestinationProvince
            ? flight.finalDestinationProvince
            : "",
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
    },

    printClosed() {
      this.loadingData = true
      Vue.nextTick(() => (this.loadingData = false))
    },
  },
}
</script>

<style scoped>
::v-deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
