<template>
  <v-data-table-server
    v-model:page="page"
    v-model:items-per-page="perPage"
    v-model:sort-by="sortBy"
    :headers="headers"
    :items="travelDeskHotels"
    :loading="isLoading"
    :items-length="totalCount"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template #item.isDedicatedConferenceHotelAvailable="{ item }">
      {{ item.isDedicatedConferenceHotelAvailable ? "Yes" : "No" }}
    </template>

    <template #item.checkIn="{ value }">
      {{ formatDate(value) }}
    </template>

    <template #item.checkOut="{ value }">
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
  </v-data-table-server>
</template>

<script setup lang="ts">
import { computed } from "vue"

import formatDate from "@/utils/format-date"

import {
  type TravelDeskHotelWhereOptions,
  type TravelDeskHotelFiltersOptions,
} from "@/api/travel-desk-hotels-api"

import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"

import useTravelDeskHotels from "@/use/use-travel-desk-hotels"

const props = withDefaults(
  defineProps<{
    where?: TravelDeskHotelWhereOptions
    filters?: TravelDeskHotelFiltersOptions
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
    title: "Check-in Date",
    key: "checkIn",
  },
  {
    title: "Check-out Date",
    key: "checkOut",
  },
  {
    title: "City",
    key: "city",
    sortable: false,
  },
  {
    title: "Conference Hotel Available?",
    key: "isDedicatedConferenceHotelAvailable",
    sortable: false,
  },
  {
    title: "Event Name",
    key: "conferenceName",
    sortable: false,
  },
  {
    title: "Hotel Name",
    key: "conferenceHotelName",
    sortable: false,
  },
  {
    title: "Additional Information",
    key: "additionalInformation",
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
    key: "checkIn",
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
const { travelDeskHotels, totalCount, isLoading, refresh } = useTravelDeskHotels(query)

defineExpose({
  refresh,
})
</script>
