<template>
  <v-data-table
    v-model="selectedRequests"
    :page.sync="page"
    :items-per-page.sync="perPage"
    :sort-by.sync="vuetify2SortBy"
    :sort-desc.sync="vuetify2SortDesc"
    :headers="headers"
    :items="travelDeskTravelRequests"
    :server-items-length="totalCount"
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
        {{ t(`travel_desk_travel_request.status.${value}`, { $default: value }) }}
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
          name: 'travel-desk/TravelDeskEditPage',
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
  </v-data-table>
</template>

<script setup>
import { computed, ref } from "vue"
import { isNil, isEmpty } from "lodash"

import { useI18n } from "@/plugins/vue-i18n-plugin"
import formatDate from "@/utils/format-date"

import useRouteQuery, { integerTransformerLegacy } from "@/use/utils/use-route-query"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useVuetify2SortByShim from "@/use/utils/use-vuetify2-sort-by-shim"
import useTravelDeskTravelRequests, {
  TRAVEL_DESK_TRAVEL_REQUEST_STATUSES,
} from "@/use/use-travel-desk-travel-requests"

import TravelDeskTravelRequestsExportToCsvButton from "@/components/travel-desk-travel-requests/TravelDeskTravelRequestsExportToCsvButton.vue"
import PrintTravelDeskReport from "@/modules/travelDesk/views/Common/PrintTravelDeskReport.vue"

const headers = ref([
  { text: "TA #", value: "travelAuthorizationId" },
  { text: "Submit Date", value: "createdAt" },
  { text: "Name", value: "userDisplayName", sortable: false },
  { text: "Department", value: "department", sortable: false },
  { text: "Branch", value: "branch", sortable: false },
  { text: "Travel Start Date", value: "travelStartDate" },
  { text: "Travel End Date", value: "travelEndDate", sortable: false },
  { text: "Locations Traveled", value: "locationsTraveled", sortable: false },
  { text: "Requested", value: "requested", sortable: false },
  { text: "Status", value: "status" },
  { text: "Travel Desk Officer", value: "travelDeskOfficer" },
  { text: "", value: "edit", cellClass: "px-0 mx-0", sortable: false },
])

const { t } = useI18n()

const page = useRouteQuery("page", "1", { transform: integerTransformerLegacy })
const perPage = useRouteQuery("perPage", "15", { transform: integerTransformerLegacy })

const sortBy = useVuetifySortByToSafeRouteQuery("sortBy", [
  {
    key: "travelStartDate",
    order: "asc",
  },
])
const { vuetify2SortBy, vuetify2SortDesc } = useVuetify2SortByShim(sortBy)
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
::v-deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
