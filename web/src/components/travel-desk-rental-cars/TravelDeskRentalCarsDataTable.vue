<template>
  <v-data-table
    :headers="headers"
    :items="travelDeskRentalCars"
    :loading="isLoading"
    v-bind="$attrs"
    v-on="$listeners"
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

    <template
      v-for="(_, slotName) in $scopedSlots"
      #[slotName]="slotData"
    >
      <slot
        :name="slotName"
        v-bind="slotData"
      ></slot>
    </template>
  </v-data-table>
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
    text: "Match Flight Times",
    value: "matchFlightTimes",
    sortable: false,
  },
  {
    text: "Pick-Up City",
    value: "pickUpCity",
    sortable: false,
  },
  {
    text: "Pick-up Location",
    value: "pickUpLocation",
    sortable: false,
  },
  {
    text: "Drop-off City",
    value: "dropOffCity",
    sortable: false,
  },
  {
    text: "Drop-off Location",
    value: "dropOffLocation",
    sortable: false,
  },
  {
    text: "Pick-up Date",
    value: "pickUpDate",
  },
  {
    text: "Drop-off Date",
    value: "dropOffDate",
  },
  {
    text: "Vehicle Type",
    value: "vehicleType",
    sortable: false,
  },
  {
    text: "Change Reason",
    value: "vehicleChangeRationale",
    sortable: false,
  },
  {
    text: "Additional Notes",
    value: "additionalNotes",
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
const { travelDeskRentalCars, isLoading, refresh } = useTravelDeskRentalCars(query)

defineExpose({
  refresh,
})
</script>

<style scoped></style>
