<template>
  <v-data-table-server
    v-model="selectedRequests"
    v-model:page="page"
    v-model:items-per-page="perPage"
    v-model:sort-by="sortBy"
    :headers="headers"
    :items="travelDeskTravelRequests"
    :items-length="totalCount"
    :loading="isLoading"
    :item-class="itemRowBackground"
    multi-sort
    show-select
  >
    <template #top>
      <div class="d-flex mb-4">
        <v-spacer />
        <PrintTravelDeskReport
          :travel-desk-travel-request-ids="selectedRequests.map((request) => request.id)"
          :activator-props="{
            class: 'my-0 mr-4',
            color: 'primary',
            disabled: isNil(selectedRequests) || isEmpty(selectedRequests),
          }"
        />
        <TravelDeskTravelRequestsExportToCsvButton
          :travel-desk-travel-request-ids="selectedRequests.map((request) => request.id)"
          :disabled="isNil(selectedRequests) || isEmpty(selectedRequests)"
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

    <template #item.requested="{ item }">
      {{ determineRequestedOptions(item) }}
    </template>

    <template #item.status="{ item, value }">
      <template
        v-if="
          (value === TRAVEL_DESK_TRAVEL_REQUEST_STATUSES.SUBMITTED &&
            isNil(item.travelDeskOfficer)) ||
          isEmpty(item.travelDeskOfficer)
        "
      >
        Not started <v-icon class="red--text">mdi-flag</v-icon>
      </template>
      <template v-else>
        {{ t(`travel_desk_travel_request.status.${value}`, value) }}
        <v-icon
          v-if="value === TRAVEL_DESK_TRAVEL_REQUEST_STATUSES.SUBMITTED"
          class="red--text"
          >mdi-flag</v-icon
        >
        <v-icon
          v-else-if="value === TRAVEL_DESK_TRAVEL_REQUEST_STATUSES.OPTIONS_RANKED"
          class="yellow--text"
          >mdi-flag</v-icon
        >
        <v-icon
          v-else-if="value === TRAVEL_DESK_TRAVEL_REQUEST_STATUSES.BOOKED"
          class="green--text"
          >mdi-checkbox-marked</v-icon
        >
      </template>
    </template>

    <template #item.edit="{ item }">
      <v-btn
        v-if="item.status === TRAVEL_DESK_TRAVEL_REQUEST_STATUSES.BOOKED"
        class="mr-4"
        color="primary"
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
        class="mr-4"
        color="primary"
        :to="{
          name: 'travel-desk/TravelDeskRequestEditRedirect',
          params: {
            travelDeskTravelRequestId: item.id.toString(),
          },
        }"
      >
        <v-icon
          left
          dark
        >
          mdi-pencil
        </v-icon>
        Edit
      </v-btn>
    </template>
  </v-data-table-server>
</template>

<script setup>
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { isNil, isEmpty } from "lodash"

import formatDate from "@/utils/format-date"

import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useTravelDeskTravelRequests, {
  TRAVEL_DESK_TRAVEL_REQUEST_STATUSES,
} from "@/use/use-travel-desk-travel-requests"

import TravelDeskTravelRequestsExportToCsvButton from "@/components/travel-desk-travel-requests/TravelDeskTravelRequestsExportToCsvButton.vue"
import PrintTravelDeskReport from "@/modules/travelDesk/views/Common/PrintTravelDeskReport.vue"

const headers = ref([
  { title: "TA #", key: "travelAuthorizationId" },
  { title: "Submit Date", key: "createdAt" },
  { title: "Name", key: "userDisplayName", sortable: false },
  { title: "Department", key: "department", sortable: false },
  { title: "Branch", key: "branch", sortable: false },
  { title: "Travel Start Date", key: "travelStartDate" },
  { title: "Travel End Date", key: "travelEndDate", sortable: false },
  { title: "Locations Traveled", key: "locationsTraveled", sortable: false },
  { title: "Requested", key: "requested", sortable: false },
  { title: "Status", key: "status" },
  { title: "Travel Desk Officer", key: "travelDeskOfficer" },
  { title: "", key: "edit", sortable: false },
])

const { t } = useI18n()

const page = useRouteQuery("page", "1", { transform: integerTransformer })
const perPage = useRouteQuery("perPage", "15", { transform: integerTransformer })

const sortBy = useVuetifySortByToSafeRouteQuery("sortBy", [
  {
    key: "travelStartDate",
    order: "asc",
  },
])
const order = useVuetifySortByToSequelizeSafeOrder(sortBy)

const travelDeskTravelRequestsQuery = computed(() => {
  return {
    order: order.value,
    page: page.value,
    perPage: perPage.value,
  }
})
const { travelDeskTravelRequests, totalCount, isLoading } = useTravelDeskTravelRequests(
  travelDeskTravelRequestsQuery
)

const selectedRequests = ref([])

function determineRequestedOptions(travelDeskTravelRequest) {
  const requested = []

  if (!isEmpty(travelDeskTravelRequest.flightRequests)) {
    requested.push("flight")
  }

  if (!isEmpty(travelDeskTravelRequest.hotels)) {
    requested.push("hotel")
  }

  if (!isEmpty(travelDeskTravelRequest.rentalCars)) {
    requested.push("rental car")
  }

  if (!isEmpty(travelDeskTravelRequest.otherTransportations)) {
    requested.push("transportation")
  }

  return requested.join(", ")
}

function itemRowBackground(item) {
  return item.isAssignedToCurrentUser > 0 ? "red lighten-5" : ""
}
</script>

<style scoped>
:deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
