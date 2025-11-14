<template>
  <v-btn
    v-bind="$attrs"
    :loading="isLoading"
    v-on="$listeners"
    @click="exportToCsv"
  >
    Export to CSV
  </v-btn>
</template>

<script setup>
import { computed } from "vue"
import { ExportToCsv } from "export-to-csv"
import { DateTime } from "luxon"

import { formatCurrency } from "@/utils/formatters"

import { MAX_PER_PAGE } from "@/api/base-api"
import useFlightStatistics from "@/use/use-flight-statistics"

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({}),
  },
  where: {
    type: Object,
    default: () => ({}),
  },
})

const flightStatisticsQuery = computed(() => {
  return {
    filters: props.filters,
    where: props.where,
    perPage: MAX_PER_PAGE, // TODO: support pagination or back-end export to handle large datasets
  }
})
const { flightStatistics, isLoading, fetch } = useFlightStatistics(flightStatisticsQuery, {
  skipWatchIf: () => true, // never fetch automatically
})

// TODO: switch to back-end rendering at a dedicated endpoint via
// fast-csv, see https://github.com/icefoganalytics/internal-data-portal/blob/0eb01fff60c6b5d72b060f89e92cf15336225531/api/src/controllers/download/datasets-controller.ts#L28
async function exportToCsv() {
  await fetch()
  // NOTE: department field contains mail codes, not department names
  const csvInfo = flightStatistics.value.map((flightStatistic) => {
    return {
      ["Department"]: flightStatistic.department ?? "",
      ["Final Destination City"]: flightStatistic.destinationCity ?? "",
      ["Final Destination Province"]: flightStatistic.destinationProvince ?? "",
      ["Total Trips"]: flightStatistic.totalTrips ?? "",
      ["Total Expenses"]: formatCurrency(flightStatistic.totalExpenses),
      ["Total Flight Cost"]: formatCurrency(flightStatistic.totalFlightCost),
      ["Average Duration (days)"]: flightStatistic.averageDurationDays ?? "",
      ["Average Expenses per Day"]: formatCurrency(flightStatistic.averageExpensesPerDay),
      ["Average Round Trip Flight Cost"]: formatCurrency(
        flightStatistic.averageRoundTripFlightCost
      ),
    }
  })

  const timestamp = DateTime.now().toFormat("yyyy-MM-dd_HHmm")

  const options = {
    fieldSeparator: ",",
    quoteStrings: '"',
    decimalSeparator: ".",
    showLabels: true,
    showTitle: false,
    title: "",
    // TODO: use better, or new library to get _ (underscores) out of file name
    filename: `Export, Flight Statistics, ${timestamp}`,
    useTextFile: false,
    useBom: true,
    useKeysAsHeaders: true,
  }
  const csvExporter = new ExportToCsv(options)
  csvExporter.generateCsv(csvInfo)
}
</script>
