<template>
  <v-data-table-server
    v-model:page="page"
    v-model:items-per-page="perPage"
    v-model:sort-by="sortBy"
    :headers="headers"
    :items="travelDeskOtherTransportations"
    :loading="isLoading"
    :items-length="totalCount"
    v-bind="$attrs"
  >
    <template #item.date="{ value }">
      {{ formatDate(value) }}
    </template>

    <template
      v-for="(_, slotName) in $slots"
      #[slotName]="slotData"
    >
      <slot
        :name="slotName"
        v-bind="slotData"
      ></slot>
    </template>
  </v-data-table-server>
</template>

<script setup lang="ts">
import { computed } from "vue"

import formatDate from "@/utils/format-date"

import {
  type TravelDeskOtherTransportationWhereOptions,
  type TravelDeskOtherTransportationFiltersOptions,
} from "@/api/travel-desk-other-transportations-api"

import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"

import useTravelDeskOtherTransportations from "@/use/use-travel-desk-other-transportations"

const props = withDefaults(
  defineProps<{
    where?: TravelDeskOtherTransportationWhereOptions
    filters?: TravelDeskOtherTransportationFiltersOptions
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
    title: "Type",
    key: "transportationType",
    sortable: false,
  },
  {
    title: "Depart Location",
    key: "depart",
    sortable: false,
  },
  {
    title: "Arrive Location",
    key: "arrive",
    sortable: false,
  },
  {
    title: "Date",
    key: "date",
  },
  {
    title: "Additional Information",
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
    key: "date",
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
const { travelDeskOtherTransportations, totalCount, isLoading, refresh } =
  useTravelDeskOtherTransportations(query)

defineExpose({
  refresh,
})
</script>
