<template>
  <v-data-table-server
    v-model:page="page"
    v-model:items-per-page="perPage"
    v-model:sort-by="sortBy"
    :items="flightReconciliations"
    :headers="headers"
    :items-length="totalCount"
    :loading="isLoading"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template #top="slotProps">
      <slot
        name="top"
        :order="order"
        v-bind="slotProps"
      ></slot>
    </template>

    <template #item.invoiceBookingDate="{ value }">
      {{ formatDate(value) }}
    </template>

    <template #item.invoiceDetailSellingFare="{ value }">
      {{ formatCurrency(value) }}
    </template>

    <template #item.invoiceDetailComputedAgentName="{ value }">
      {{ capitalize(value) }}
    </template>

    <template #item.invoiceDetailVendorName="{ value }">
      {{ capitalize(value) }}
    </template>

    <template #item.segmentsComputedFlightInfo="{ item }">
      <div
        v-for="(flight, index) in item.segmentsComputedFlightInfo?.split(',')"
        :key="'flight-info-' + index"
      >
        {{ flight }}
      </div>
    </template>
    <template #item.reconciled="{ value }">
      <v-chip
        v-if="value === true"
        color="success"
        text-color="white"
        size="small"
      >
        Yes
      </v-chip>
      <v-chip
        v-else
        color="warning"
        text-color="white"
        size="small"
      >
        No
      </v-chip>
    </template>
  </v-data-table-server>
</template>

<script setup>
import { computed } from "vue"
import { isNil } from "lodash"

import { capitalize, formatCurrency, formatDate } from "@/utils/formatters"

import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"
import useFlightReconciliations from "@/use/use-flight-reconciliations"

const props = defineProps({
  where: {
    type: Object,
    default: () => ({}),
  },
  filters: {
    type: Object,
    default: () => ({}),
  },
  routeQuerySuffix: {
    type: String,
    default: "",
  },
  reconciled: {
    type: Boolean,
    default: null,
  },
  unreconciled: {
    type: Boolean,
    default: null,
  },
})

const headers = computed(() => {
  const baseHeaders = [
    {
      title: "Purchase Date",
      key: "invoiceBookingDate",
      width: "9rem",
    },
    {
      title: "Cost",
      key: "invoiceDetailSellingFare",
      width: "7rem",
    },
    {
      title: "Agent",
      key: "invoiceDetailComputedAgentName",
      width: "10rem",
    },
    {
      title: "Airline",
      key: "invoiceDetailVendorName",
      width: "10rem",
    },
    {
      title: "Flight Info",
      key: "segmentsComputedFlightInfo",
    },
    {
      title: "Final Destination",
      key: "segmentsComputedFinalDestination",
      width: "10rem",
    },
    {
      title: "Department Mailcode",
      key: "invoiceDepartmentMailcode",
    },
    {
      title: "Traveler First Name",
      key: "invoiceDetailComputedTravelerFirstName",
      width: "11rem",
    },
    {
      title: "Traveler Last Name",
      key: "invoiceDetailComputedTravelerLastName",
      width: "11rem",
    },
  ]

  if (isNil(props.reconciled) && isNil(props.unreconciled)) {
    baseHeaders.push({
      title: "Reconciled",
      key: "reconciled",
      align: "center",
    })
  } else if (props.reconciled === true) {
    baseHeaders.push({
      title: "Reconcile Period",
      key: "reconcilePeriod",
    })
  } else if (props.unreconciled === true) {
    // don't add any headers
  } else {
    // don't add any headers
  }

  return baseHeaders
})

const page = useRouteQuery(`page${props.routeQuerySuffix}`, "1", {
  transform: integerTransformer,
})
const perPage = useRouteQuery(`perPage${props.routeQuerySuffix}`, "10", {
  transform: integerTransformer,
})
const sortBy = useVuetifySortByToSafeRouteQuery(`sortBy${props.routeQuerySuffix}`, [
  {
    key: "invoiceBookingDate",
    order: "desc",
  },
])
const order = useVuetifySortByToSequelizeSafeOrder(sortBy)

const flightReconciliationsQuery = computed(() => ({
  where: props.where,
  filters: props.filters,
  order: order.value,
  page: page.value,
  perPage: perPage.value,
}))
const { flightReconciliations, totalCount, isLoading, refresh } = useFlightReconciliations(
  flightReconciliationsQuery
)

defineExpose({
  refresh,
})
</script>
