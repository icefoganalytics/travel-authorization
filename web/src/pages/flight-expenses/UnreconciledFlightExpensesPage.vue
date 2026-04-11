<template>
  <FlightReconciliationsDataTableServer
    ref="flightReconciliationsDataTable"
    v-model="selectedFlightReconciliationIds"
    :filters="filters"
    :where="where"
    unreconciled
    show-select
  >
    <template #top="{ order }">
      <v-row>
        <v-spacer />
        <v-col
          cols="12"
          md="2"
        >
          <ExportToCsvButton
            :flight-reconciliation-ids="selectedFlightReconciliationIds"
            :order="order"
            :disabled="isEmpty(selectedFlightReconciliationIds)"
            color="primary"
            block
          />
        </v-col>
        <v-col
          cols="12"
          md="2"
        >
          <v-btn
            color="primary"
            :disabled="isEmpty(selectedFlightReconciliationIds)"
            block
            @click="showBulkReconcileDialog(selectedFlightReconciliationIds)"
          >
            Reconcile
          </v-btn>
        </v-col>
      </v-row>

      <!-- TODO: consider if I should support reconciling on a per-row basis as well? -->
      <FlightReconciliationsBulkReconcileDialog
        ref="flightReconciliationsBulkReconcileDialog"
        @saved="refresh"
      />
    </template>
  </FlightReconciliationsDataTableServer>
</template>

<script setup>
import { computed, ref } from "vue"
import { isNil, isEmpty } from "lodash"

import ExportToCsvButton from "@/components/flight-reconciliations/ExportToCsvButton.vue"
import FlightReconciliationsBulkReconcileDialog from "@/components/flight-reconciliations/FlightReconciliationsBulkReconcileDialog.vue"
import FlightReconciliationsDataTableServer from "@/components/flight-reconciliations/FlightReconciliationsDataTableServer.vue"

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
  const baseFilters = {}

  if (
    !isNil(props.startDate) &&
    !isEmpty(props.startDate) &&
    !isNil(props.endDate) &&
    !isEmpty(props.endDate)
  ) {
    baseFilters.invoiceBookingDateBetween = [props.startDate, props.endDate]
  }

  return baseFilters
})
const where = computed(() => ({
  reconciled: false,
}))

const selectedFlightReconciliationIds = ref([])

/** @type {import("vue").Ref<InstanceType<typeof FlightReconciliationsBulkReconcileDialog> | null>} */
const flightReconciliationsBulkReconcileDialog = ref(null)

function showBulkReconcileDialog(flightReconciliationIds) {
  flightReconciliationsBulkReconcileDialog.value.show(flightReconciliationIds)
}

/** @type {import("vue").Ref<InstanceType<typeof FlightReconciliationsDataTableServer> | null>} */
const flightReconciliationsDataTable = ref(null)

function refresh() {
  flightReconciliationsDataTable.value?.refresh()
}
</script>

<style scoped>
:deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
