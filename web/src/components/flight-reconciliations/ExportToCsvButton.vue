<template>
  <v-btn
    v-bind="$attrs"
    :loading="isLoading"
    v-on="$listeners"
    @click="exportToCsv"
  >
    <template #default>
      <slot> Export To CSV </slot>
    </template>
  </v-btn>
</template>

<script setup>
import { computed } from "vue"
import { ExportToCsv } from "export-to-csv"
import { isNil, isEmpty } from "lodash"
import { DateTime } from "luxon"

import { capitalize, formatDate, formatCurrency } from "@/utils/formatters"
import useFlightReconciliations from "@/use/use-flight-reconciliations"

const props = defineProps({
  flightReconciliationIds: {
    type: Array,
    default: () => [],
  },
  order: {
    type: Array,
    default: () => [],
  },
})

const flightReconciliationsQuery = computed(() => {
  return {
    where: {
      id: props.flightReconciliationIds,
    },
    order: props.order,
  }
})
const { flightReconciliations, isLoading } = useFlightReconciliations(flightReconciliationsQuery, {
  skipWatchIf: () => isNil(props.flightReconciliationIds) || isEmpty(props.flightReconciliationIds),
})

// TODO: switch to back-end rendering at a dedicated endpoint via
// fast-csv, see https://github.com/icefoganalytics/internal-data-portal/blob/0eb01fff60c6b5d72b060f89e92cf15336225531/api/src/controllers/download/datasets-controller.ts#L28
async function exportToCsv() {
  // NOTE: invoiceDepartmentMailcode field contains mail codes, not department names
  const csvInfo = flightReconciliations.value.map((flightReconciliation) => {
    const {
      invoiceBookingDate,
      invoiceDetailSellingFare,
      invoiceDetailComputedAgentName,
      invoiceDetailVendorName,
      segmentsComputedFlightInfo,
      segmentsComputedFinalDestination,
      invoiceDepartmentMailcode,
      invoiceDetailComputedTravelerFirstName,
      invoiceDetailComputedTravelerLastName,
      reconciled,
      reconcilePeriod,
    } = flightReconciliation

    const purchaseDate = formatDate(invoiceBookingDate)
    const cost = formatCurrency(invoiceDetailSellingFare)
    const agent = capitalize(invoiceDetailComputedAgentName)
    const airline = capitalize(invoiceDetailVendorName)
    const flightInfo = formatFlightInfo(segmentsComputedFlightInfo)
    const formattedReconciled = reconciled ? "Yes" : "No"
    const formattedReconcilePeriod = reconcilePeriod ? reconcilePeriod : ""

    return {
      ["Purchase Date"]: purchaseDate,
      ["Cost"]: cost,
      ["Agent"]: agent,
      ["Airline"]: airline,
      ["Flight Info"]: flightInfo,
      ["Final Destination"]: segmentsComputedFinalDestination,
      ["Department Mailcode"]: invoiceDepartmentMailcode,
      ["Traveler First Name"]: invoiceDetailComputedTravelerFirstName,
      ["Traveler Last Name"]: invoiceDetailComputedTravelerLastName,
      ["Reconciled"]: formattedReconciled,
      ["Reconcile Period"]: formattedReconcilePeriod,
    }
  })

  const timestamp = DateTime.now().toFormat("yyyy-LL-dd")

  const options = {
    fieldSeparator: ",",
    quoteStrings: '"',
    decimalSeparator: ".",
    showLabels: true,
    showTitle: false,
    title: "",
    // TODO: use better, or new library to get _ (underscores) out of file name
    filename: `Export, Flight Reconciliations, ${timestamp}`,
    useTextFile: false,
    useBom: true,
    useKeysAsHeaders: true,
  }
  const csvExporter = new ExportToCsv(options)
  csvExporter.generateCsv(csvInfo)
}

function formatFlightInfo(flightInfo) {
  return flightInfo?.split(",")?.join("\r\n")
}
</script>
