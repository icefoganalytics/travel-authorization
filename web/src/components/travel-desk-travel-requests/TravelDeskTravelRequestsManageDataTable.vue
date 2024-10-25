<template>
  <div>
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
      <ExportToCsvButton
        :travel-desk-travel-request-ids="selectedRequests.map((request) => request.id)"
        :disabled="isNil(selectedRequests) || isEmpty(selectedRequests)"
        class="my-0"
        color="primary"
      >
        Export To Excel
      </ExportToCsvButton>
    </div>

    <v-data-table
      v-model="selectedRequests"
      :headers="headers"
      :items="travelDeskRequests"
      item-key="id"
      :sort-by="['bookedStatus', 'userTravel', 'startDate']"
      :sort-desc="[false, true, false]"
      :item-class="itemRowBackground"
      multi-sort
      :items-per-page="15"
      show-select
    >
      <template #top>
        <ProcessTravelDeskRequest
          ref="processTravelDeskRequest"
          @closed="getTravelDeskRequests"
        />
      </template>
      <template #item.createdAt="{ item }">
        <div>
          {{ item.createdAt | beautifyDate }}
        </div>
      </template>

      <template #item.fullname="{ item }">
        {{
          [item.travelAuthorization.user.firstName, item.travelAuthorization.user.lastName]
            .filter(Boolean)
            .join(" ") || "Unknown"
        }}
      </template>

      <template #item.department="{ item }">
        {{ item.travelAuthorization.user.department }}
      </template>

      <template #item.branch="{ item }">
        {{ item.travelAuthorization.user.branch }}
      </template>

      <template #item.startDate="{ item }">
        <div>
          {{ determineStartDate(item.travelAuthorization.travelSegments) }}
        </div>
      </template>

      <template #item.endDate="{ item }">
        <div>
          {{
            determineEndDate(
              item.travelAuthorization.travelSegments,
              item.travelAuthorization.dateBackToWork
            )
          }}
        </div>
      </template>

      <template #item.location="{ item }">
        {{ determineLocationsTraveled(item.travelAuthorization.travelSegments) }}
      </template>

      <template #item.requested="{ item }">
        {{ determineRequestedOptions(item) }}
      </template>

      <template #item.status="{ item, value }">
        <div v-if="value == 'submitted' && !item.travelDeskOfficer">
          Not started <v-icon class="red--text">mdi-flag</v-icon>
        </div>
        <div v-else>
          {{ t(`travel_desk_travel_request.status.${value}`, { $default: value }) }}
          <v-icon
            v-if="value == 'submitted'"
            class="red--text"
            >mdi-flag</v-icon
          >
          <v-icon
            v-if="value == 'options_ranked'"
            class="yellow--text"
            >mdi-flag</v-icon
          >
          <v-icon
            v-else-if="value == 'booked'"
            class="green--text"
            >mdi-checkbox-marked</v-icon
          >
        </div>
      </template>

      <template #item.edit="{ item }">
        <v-btn
          class="pr-2"
          color="primary"
          @click="openProcessTravelDeskRequest(item.id)"
        >
          Edit
          <v-icon
            right
            dark
          >
            mdi-pencil
          </v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue"
import { useStore } from "vue2-helpers/vuex"
import { isNil, isEmpty, first, last } from "lodash"

import { useI18n } from "@/plugins/vue-i18n-plugin"
import { TRAVEL_DESK_URL, USERS_URL } from "@/urls"
import http from "@/api/http-client"
import locationsApi from "@/api/locations-api"

import ExportToCsvButton from "@/components/travel-desk-travel-requests/ExportToCsvButton.vue"
import ProcessTravelDeskRequest from "@/modules/travelDesk/views/Desk/ProcessTravelDeskRequest.vue"
import PrintTravelDeskReport from "@/modules/travelDesk/views/Common/PrintTravelDeskReport.vue"

const { t } = useI18n()
const store = useStore()

const travelDeskRequests = ref([])
const selectedRequests = ref([])
const loadingData = ref(false)
const department = ref("")
const alertMsg = ref("")

const headers = ref([
  { text: "Submit Date", value: "createdAt" },
  { text: "Name", value: "fullname", sortable: false },
  { text: "Department", value: "department" },
  { text: "Branch", value: "branch" },
  { text: "Travel Start Date", value: "startDate" },
  {
    text: "Travel End Date",
    value: "endDate",
    sortable: false,
  },
  { text: "Location", value: "location" },
  { text: "Requested", value: "requested" },
  { text: "Status", value: "status" },
  { text: "Travel Desk Officer", value: "travelDeskOfficer" },
  {
    text: "",
    value: "edit",
    cellClass: "px-0 mx-0",
    sortable: false,
  },
])

onMounted(async () => {
  loadingData.value = true
  department.value = store.state.auth.department
  await getDestinations()
  await getTravelDeskUsers()
  await getTravelDeskRequests()
  loadingData.value = false
})

async function getDestinations() {
  const { locations } = await locationsApi.list()
  const formattedLocations = locations.map(({ id, city, province }) => {
    return {
      value: id,
      text: `${city} (${province})`,
      city,
      province,
    }
  })
  store.commit("traveldesk/SET_DESTINATIONS", formattedLocations)
  return formattedLocations
}

async function getTravelDeskUsers() {
  try {
    const { data } = await http.get(`${USERS_URL}/travel-desk-users`)
    store.commit("traveldesk/SET_TRAVEL_DESK_USERS", data)
  } catch (error) {
    alertMsg.value = error.response.data
  }
}

async function getTravelDeskRequests() {
  try {
    const { data } = await http.get(`${TRAVEL_DESK_URL}/`)
    travelDeskRequests.value = data
    travelDeskRequests.value.forEach((travelDeskRequest) => {
      travelDeskRequest.userTravel =
        store.state.auth.fullName == travelDeskRequest.travelDeskOfficer ? 1 : 0
      travelDeskRequest.bookedStatus = travelDeskRequest.status == "booked" ? 1 : 0
      travelDeskRequest.startDate = determineStartDate(
        travelDeskRequest.travelAuthorization.travelSegments
      )
    })
  } catch (error) {
    console.log(error)
  }
}

function determineStartDate(travelSegments) {
  const firstTravelSegment = first(travelSegments)
  return firstTravelSegment.departureOn
}

function determineEndDate(travelSegments, dateBackToWork) {
  if (dateBackToWork) {
    return dateBackToWork.slice(0, 10)
  }

  const lastTravelSegment = last(travelSegments)
  return lastTravelSegment.departureOn
}

function determineLocationsTraveled(travelSegments) {
  const names = new Set()

  for (const travelSegment of travelSegments) {
    const { departureLocation, arrivalLocation } = travelSegment
    const name = `${departureLocation.city} (${departureLocation.province})`
    names.add(name)
  }

  return Array.from(names).join(", ")
}

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
  return item.userTravel > 0 ? "red lighten-5" : ""
}

const processTravelDeskRequest = ref(null)

function openProcessTravelDeskRequest(travelDeskTravelRequestId) {
  processTravelDeskRequest.value?.open(travelDeskTravelRequestId)
}
</script>

<style scoped>
::v-deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
