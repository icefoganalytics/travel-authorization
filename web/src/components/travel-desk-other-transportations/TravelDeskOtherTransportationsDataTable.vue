<template>
  <v-data-table
    :page.sync="page"
    :items-per-page.sync="perPage"
    :sort-by.sync="vuetify2SortBy"
    :sort-desc.sync="vuetify2SortDesc"
    :headers="headers"
    :items="travelDeskOtherTransportations"
    :loading="isLoading"
    :server-items-length="totalCount"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template #item.date="{ value }">
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
  type TravelDeskOtherTransportationWhereOptions,
  type TravelDeskOtherTransportationFiltersOptions,
} from "@/api/travel-desk-other-transportations-api"

import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"
import useVuetify2SortByShim from "@/use/utils/use-vuetify2-sort-by-shim"

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
    text: "Type",
    value: "transportationType",
    sortable: false,
  },
  {
    text: "Depart Location",
    value: "depart",
    sortable: false,
  },
  {
    text: "Arrive Location",
    value: "arrive",
    sortable: false,
  },
  {
    text: "Date",
    value: "date",
  },
  {
    text: "Additional Information",
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
    key: "date",
    order: "asc",
  },
])
const { vuetify2SortBy, vuetify2SortDesc } = useVuetify2SortByShim(sortBy)
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
