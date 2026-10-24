<template>
  <v-data-table-server
    v-model="selectedTravelDeskTravelRequestIds"
    v-model:page="page"
    v-model:items-per-page="perPage"
    v-model:sort-by="sortBy"
    :headers="headers"
    :items="travelDeskTravelRequests"
    :items-length="totalCount"
    :loading="isLoading"
    :row-props="itemRowProps"
    multi-sort
    show-select
  >
    <template #top>
      <div class="d-flex mb-4">
        <v-spacer />
        <TravelDeskTravelRequestsPrintButton
          :travel-desk-travel-request-ids="selectedTravelDeskTravelRequestIds"
          :disabled="isEmpty(selectedTravelDeskTravelRequestIds)"
          class="my-0 mr-4"
          color="primary"
        />
        <TravelDeskTravelRequestsExportToCsvButton
          :travel-desk-travel-request-ids="selectedTravelDeskTravelRequestIds"
          :disabled="isEmpty(selectedTravelDeskTravelRequestIds)"
          class="my-0"
          color="primary"
        >
          Export To Excel
        </TravelDeskTravelRequestsExportToCsvButton>
      </div>
    </template>
    <template #item.createdAt="{ value }">
      {{ formatDate(value) }}
    </template>

    <template #item.userDisplayName="{ value }">
      {{ value }}
    </template>

    <template #item.department="{ value }">
      {{ value }}
    </template>

    <template #item.branch="{ value }">
      {{ value }}
    </template>

    <template #item.travelStartDate="{ value }">
      {{ formatDate(value) }}
    </template>

    <template #item.travelEndDate="{ value }">
      {{ formatDate(value) }}
    </template>

    <template #item.locationsTraveled="{ value }">
      {{ value }}
    </template>

    <template #item.requestedOptions="{ value }">
      {{ value }}
    </template>

    <template #item.status="{ item }">
      {{ formatTravelDeskTravelRequestStatus(item, t) }}
      <v-icon
        v-if="item.status === TravelDeskTravelRequestStatuses.SUBMITTED"
        color="error"
      >
        mdi-flag
      </v-icon>
      <v-icon
        v-else-if="item.status === TravelDeskTravelRequestStatuses.OPTIONS_RANKED"
        color="warning"
      >
        mdi-flag
      </v-icon>
      <v-icon
        v-else-if="item.status === TravelDeskTravelRequestStatuses.BOOKED"
        color="success"
      >
        mdi-checkbox-marked
      </v-icon>
    </template>

    <template #item.edit="{ item }">
      <v-btn
        v-if="item.status === TravelDeskTravelRequestStatuses.BOOKED"
        prepend-icon="mdi-eye"
        color="primary"
        min-width="6rem"
        :to="{
          name: 'travel-desk/TravelDeskRequestPage',
          params: {
            travelDeskTravelRequestId: item.id.toString(),
          },
        }"
      >
        View
      </v-btn>
      <v-btn
        v-else
        prepend-icon="mdi-pencil"
        color="primary"
        min-width="6rem"
        :to="{
          name: 'travel-desk/TravelDeskRequestEditRedirect',
          params: {
            travelDeskTravelRequestId: item.id.toString(),
          },
        }"
      >
        Edit
      </v-btn>
    </template>
  </v-data-table-server>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { isEmpty } from "lodash"

import formatDate from "@/utils/format-date"
import formatTravelDeskTravelRequestStatus from "@/utils/format-travel-desk-travel-request-status"

import {
  type TravelDeskTravelRequestAsIndex,
  type TravelDeskTravelRequestsQueryOptions,
  TravelDeskTravelRequestStatuses,
} from "@/api/travel-desk-travel-requests-api"

import useRouteQueryPagination from "@/use/utils/use-route-query-pagination"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useTravelDeskTravelRequests from "@/use/use-travel-desk-travel-requests"

import TravelDeskTravelRequestsExportToCsvButton from "@/components/travel-desk-travel-requests/TravelDeskTravelRequestsExportToCsvButton.vue"
import TravelDeskTravelRequestsPrintButton from "@/components/travel-desk-travel-requests/TravelDeskTravelRequestsPrintButton.vue"

const headers = [
  { title: "TA #", key: "travelAuthorizationId" },
  { title: "Submit Date", key: "createdAt" },
  { title: "Name", key: "userDisplayName", sortable: false },
  { title: "Department", key: "department", sortable: false },
  { title: "Branch", key: "branch", sortable: false },
  { title: "Travel Start Date", key: "travelStartDate" },
  { title: "Travel End Date", key: "travelEndDate", sortable: false },
  { title: "Locations Traveled", key: "locationsTraveled", sortable: false },
  { title: "Requested", key: "requestedOptions", sortable: false },
  { title: "Status", key: "status" },
  { title: "Travel Desk Officer", key: "travelDeskOfficer" },
  { title: "Actions", key: "edit", sortable: false, align: "start" },
] as const

const { t } = useI18n()

const { page, perPage } = useRouteQueryPagination({ perPage: 15 })

const sortBy = useVuetifySortByToSafeRouteQuery("sortBy", [
  {
    key: "travelStartDate",
    order: "asc",
  },
])
const order = useVuetifySortByToSequelizeSafeOrder(sortBy)

const travelDeskTravelRequestsQuery = computed<TravelDeskTravelRequestsQueryOptions>(() => {
  return {
    order: order.value,
    page: page.value,
    perPage: perPage.value,
  }
})
const { travelDeskTravelRequests, totalCount, isLoading } = useTravelDeskTravelRequests(
  travelDeskTravelRequestsQuery
)

const selectedTravelDeskTravelRequestIds = ref<number[]>([])

function itemRowProps({ item }: { item: TravelDeskTravelRequestAsIndex }) {
  return {
    class: {
      "bg-red-lighten-5": item.isAssignedToCurrentUser,
    },
  }
}
</script>

<style scoped>
:deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
