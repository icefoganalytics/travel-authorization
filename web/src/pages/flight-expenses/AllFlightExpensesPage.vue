<template>
  <FlightReconciliationsDataTableServer
    ref="flightReconciliationsDataTable"
    v-model="selectedFlightReconciliationIds"
    :filters="filters"
    show-select
  >
    <template #top="{ order }">
      <v-row>
        <v-spacer />
        <v-col
          cols="12"
          md="3"
        >
          <ExportToCsvButton
            :flight-reconciliation-ids="selectedFlightReconciliationIds"
            :order="order"
            :disabled="isEmpty(selectedFlightReconciliationIds)"
            color="primary"
            block
          />
        </v-col>
      </v-row>
    </template>
  </FlightReconciliationsDataTableServer>
</template>

<script setup>
import { computed, ref } from "vue"
import { isNil, isEmpty } from "lodash"

import useBreadcrumbs from "@/use/use-breadcrumbs"

import FlightReconciliationsDataTableServer from "@/components/flight-reconciliations/FlightReconciliationsDataTableServer.vue"
import ExportToCsvButton from "@/components/flight-reconciliations/ExportToCsvButton.vue"

const props = defineProps({
  startDate: {
    type: String,
    default: "",
  },
  endDate: {
    type: String,
    default: "",
  },
})

const filters = computed(() => {
  if (
    isNil(props.startDate) ||
    isEmpty(props.startDate) ||
    isNil(props.endDate) ||
    isEmpty(props.endDate)
  ) {
    return {}
  }

  return {
    invoiceBookingDateBetween: [props.startDate, props.endDate],
  }
})

const selectedFlightReconciliationIds = ref([])

/** @type {import("vue").Ref<InstanceType<typeof FlightReconciliationsDataTableServer> | null>} */
const flightReconciliationsDataTable = ref(null)

async function refresh() {
  await flightReconciliationsDataTable.value?.refresh()
}

defineExpose({
  refresh,
})

useBreadcrumbs([
  {
    title: "Flight Expenses",
    to: {
      name: "flight-expenses/AllFlightExpensesPage",
    },
  },
  {
    title: "All Flights Expenses",
    to: {
      name: "flight-expenses/AllFlightExpensesPage",
    },
  },
])
</script>

<style scoped>
:deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
