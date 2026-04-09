<template>
  <v-data-table-server
    v-model:page="page"
    v-model:items-per-page="perPage"
    v-model:sort-by="sortBy"
    :headers="headers"
    :items="travelDeskRentalCars"
    :loading="isLoading"
    :items-length="totalCount"
    v-bind="$attrs"
  >
    <template #item.matchFlightTimes="{ item }">
      {{ item.matchFlightTimes ? "Yes" : "No" }}
    </template>

    <template #item.pickUpLocation="{ item }">
      <div v-if="item.pickUpLocation === TravelDeskRentalCarLocationTypes.OTHER">
        {{ item.pickUpLocationOther }}
      </div>
      <div v-else>{{ item.pickUpLocation }}</div>
    </template>

    <template #item.dropOffLocation="{ item }">
      <div
        v-if="
          item.sameDropOffLocation && item.pickUpLocation === TravelDeskRentalCarLocationTypes.OTHER
        "
      >
        {{ item.pickUpLocationOther }}
      </div>
      <div v-else-if="item.sameDropOffLocation">{{ item.pickUpLocation }}</div>
      <div v-else>{{ item.dropOffLocation }}</div>
    </template>

    <template #item.pickUpDate="{ value }">
      {{ formatDate(value) }}
    </template>

    <template #item.dropOffDate="{ value }">
      {{ formatDate(value) }}
    </template>

  </v-data-table-server>
</template>

<script setup lang="ts">
import { computed } from "vue"

import formatDate from "@/utils/format-date"

import {
  type TravelDeskRentalCarWhereOptions,
  type TravelDeskRentalCarFiltersOptions,
  TravelDeskRentalCarLocationTypes,
} from "@/api/travel-desk-rental-cars-api"

import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"

import useTravelDeskRentalCars from "@/use/use-travel-desk-rental-cars"

const props = withDefaults(
  defineProps<{
    where?: TravelDeskRentalCarWhereOptions
    filters?: TravelDeskRentalCarFiltersOptions
    routeQuerySuffix?: string
  }>(),
  {
    where: () => ({}),
    filters: () => ({}),
    routeQuerySuffix: "",
  }
)

const headers = [
  {
    title: "Match Flight Times",
    key: "matchFlightTimes",
    sortable: false,
  },
  {
    title: "Pick-Up City",
    key: "pickUpCity",
    sortable: false,
  },
  {
    title: "Pick-up Location",
    key: "pickUpLocation",
    sortable: false,
  },
  {
    title: "Drop-off City",
    key: "dropOffCity",
    sortable: false,
  },
  {
    title: "Drop-off Location",
    key: "dropOffLocation",
    sortable: false,
  },
  {
    title: "Pick-up Date",
    key: "pickUpDate",
  },
  {
    title: "Drop-off Date",
    key: "dropOffDate",
  },
  {
    title: "Vehicle Type",
    key: "vehicleType",
    sortable: false,
  },
  {
    title: "Change Reason",
    key: "vehicleChangeRationale",
    sortable: false,
  },
  {
    title: "Additional Notes",
    key: "additionalNotes",
    sortable: false,
  },
]

const page = useRouteQuery<string, number>(`page${props.routeQuerySuffix}`, "1", {
  transform: integerTransformer,
})
const perPage = useRouteQuery<string, number>(`perPage${props.routeQuerySuffix}`, "5", {
  transform: integerTransformer,
})
const sortBy = useVuetifySortByToSafeRouteQuery(`sortBy${props.routeQuerySuffix}`, [
  {
    key: "pickUpDate",
    order: "asc",
  },
])
const order = useVuetifySortByToSequelizeSafeOrder(sortBy)

const query = computed(() => ({
  where: props.where,
  filters: props.filters,
  order: order.value,
  page: page.value,
  perPage: perPage.value,
}))
const { travelDeskRentalCars, totalCount, isLoading, refresh } = useTravelDeskRentalCars(query)

defineExpose({
  refresh,
})
</script>

<style scoped></style>
