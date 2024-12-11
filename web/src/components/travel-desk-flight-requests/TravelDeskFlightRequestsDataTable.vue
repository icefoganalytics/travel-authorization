<template>
  <v-data-table
    :page.sync="page"
    :items-per-page.sync="perPage"
    :headers="headers"
    :items="travelDeskFlightRequests"
    :loading="isLoading"
    :server-items-length="totalCount"
    disable-sort
  >
    <template #item.datePreference="{ value }">
      {{ formatDate(value) }}
    </template>
  </v-data-table>
</template>

<script setup>
import { computed } from "vue"

import formatDate from "@/utils/format-date"

import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import useTravelDeskFlightRequests from "@/use/use-travel-desk-flight-requests"

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
})

const headers = [
  {
    text: "Depart Location",
    value: "departLocation",
  },
  {
    text: "Arrive Location",
    value: "arriveLocation",
  },
  {
    text: "Date",
    value: "datePreference",
  },
  {
    text: "Time Preference",
    value: "timePreference",
  },
  {
    text: "Seat Preference",
    value: "seatPreference",
  },
]

const page = useRouteQuery(`page${props.routeQuerySuffix}`, "1", {
  transform: integerTransformer,
})
const perPage = useRouteQuery(`perPage${props.routeQuerySuffix}`, props.defaultPerPage, {
  transform: integerTransformer,
})

const travelDeskFlightRequestsQuery = computed(() => ({
  where: props.where,
  filters: props.filters,
  page: page.value,
  perPage: perPage.value,
}))
const { travelDeskFlightRequests, isLoading, totalCount, refresh } = useTravelDeskFlightRequests(
  travelDeskFlightRequestsQuery
)

defineExpose({
  refresh,
})
</script>

<style scoped></style>
