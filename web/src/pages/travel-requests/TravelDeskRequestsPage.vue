<template>
  <v-container>
    <v-row>
      <v-col>
        <h1 class="text-h4">Travel Desk Requests</h1>
      </v-col>
    </v-row>
    <v-alert
      v-if="isErrored"
      type="error"
      class="mb-4"
    >
      Travel Desk Requests could not be loaded.
    </v-alert>
    <v-data-table-server
      v-model:page="page"
      v-model:items-per-page="perPage"
      v-model:sort-by="sortBy"
      :headers="headers"
      :items="travelAuthorizations"
      :items-length="totalCount"
      :loading="isLoading"
      item-value="id"
      hide-default-footer
    >
      <template #item.name="{ item }">
        {{ item.firstName ?? "" }} {{ item.lastName ?? "" }}
      </template>
      <template #item.departingAt="{ item }">
        {{ item.departingAt ? formatDate(item.departingAt) : "—" }}
      </template>
      <template #item.returningAt="{ item }">
        {{ item.returningAt ? formatDate(item.returningAt) : "—" }}
      </template>
      <template #item.locationIds="{ item }">
        <div class="d-flex flex-wrap ga-1">
          <LocationChip
            v-for="locationId in item.locationIds"
            :key="locationId"
            :location-id="locationId"
          />
        </div>
      </template>
      <template #item.status="{ item }">
        {{ formatStatus(item.status) }}
      </template>
      <template #item.travelDeskTravelRequest="{ item }">
        {{
          item.travelDeskTravelRequest
            ? formatStatus(item.travelDeskTravelRequest.status)
            : "Not created"
        }}
      </template>
      <template #item.actions="{ item }">
        <v-btn
          :to="{
            name: 'travel-requests/TravelDeskRequestPage',
            params: { travelAuthorizationId: item.id },
          }"
          variant="text"
        >
          {{ requestActionLabel(item.travelDeskTravelRequest?.status) }}
        </v-btn>
      </template>
    </v-data-table-server>
    <EnhancedPagination
      v-model="page"
      v-model:per-page="perPage"
      :total-count="totalCount"
    />
  </v-container>
</template>

<script setup lang="ts">
import { computed } from "vue"

import formatDate from "@/utils/format-date"
import { type TravelDeskTravelAuthorizationsQueryOptions } from "@/api/travel-desk-travel-authorizations-api"
import { TravelDeskTravelRequestStatuses } from "@/api/travel-desk-travel-requests-api"
import useTravelDeskTravelAuthorizations from "@/use/use-travel-desk-travel-authorizations"
import useRouteQueryPagination from "@/use/utils/use-route-query-pagination"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"

import EnhancedPagination from "@/components/common/EnhancedPagination.vue"
import LocationChip from "@/components/locations/LocationChip.vue"

const headers = [
  { title: "Travel Auth #", key: "id" },
  { title: "Traveller", key: "name", sortable: false },
  { title: "Purpose", key: "purposeText", sortable: false },
  { title: "Departure", key: "departingAt", sortable: false },
  { title: "Return", key: "returningAt", sortable: false },
  { title: "Locations", key: "locationIds", sortable: false },
  { title: "Authorization Status", key: "status" },
  { title: "Travel Desk Status", key: "travelDeskTravelRequest", sortable: false },
  { title: "Actions", key: "actions", sortable: false },
] as const

const { page, perPage } = useRouteQueryPagination({ perPage: 15, routeQuerySuffix: "TravelDesk" })
const sortBy = useVuetifySortByToSafeRouteQuery("travelDeskSortBy", [{ key: "id", order: "desc" }])
const order = useVuetifySortByToSequelizeSafeOrder(sortBy)
const queryOptions = computed<TravelDeskTravelAuthorizationsQueryOptions>(() => ({
  page: page.value,
  perPage: perPage.value,
  order: order.value,
}))
const { travelAuthorizations, totalCount, isLoading, isErrored } =
  useTravelDeskTravelAuthorizations(queryOptions)

function formatStatus(status: string) {
  return status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function requestActionLabel(status: TravelDeskTravelRequestStatuses | undefined) {
  if (status === TravelDeskTravelRequestStatuses.DRAFT) return "Submit Travel Desk Request"
  if (status === TravelDeskTravelRequestStatuses.OPTIONS_PROVIDED) return "Review Travel Options"

  return "View Request"
}
</script>
