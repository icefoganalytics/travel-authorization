<template>
  <v-data-table-server
    v-model:page="page"
    v-model:items-per-page="perPage"
    :headers="headers"
    :items="travelDeskFlightRequests"
    :loading="isLoading"
    :items-length="totalCount"
    disable-sort
  >
    <template #item.datePreference="{ value }">
      {{ formatDate(value) }}
    </template>
  </v-data-table-server>
</template>

<script setup>
import { computed } from "vue"

import formatDate from "@/utils/format-date"

import useRouteQuery, { integerTransformerLegacy } from "@/use/utils/use-route-query"
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
    title: "Depart Location",
    key: "departLocation",
  },
  {
    title: "Arrive Location",
    key: "arriveLocation",
  },
  {
    title: "Date",
    key: "datePreference",
  },
  {
    title: "Time Preference",
    key: "timePreference",
  },
  {
    title: "Seat Preference",
    key: "seatPreference",
  },
]

const page = useRouteQuery(`page${props.routeQuerySuffix}`, "1", {
  transform: integerTransformerLegacy,
})
const perPage = useRouteQuery(`perPage${props.routeQuerySuffix}`, props.defaultPerPage, {
  transform: integerTransformerLegacy,
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
