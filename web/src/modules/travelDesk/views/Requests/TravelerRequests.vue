<template>
  <div class="mx-10 mb-5">
    <v-data-table
      :headers="headers"
      :items="authorizedTravels"
      :items-per-page="15"
      class="elevation-1 mt-4"
    >
      <template #top>
        <TravelDeskTravelRequestPrintItineraryDialog
          ref="travelDeskTravelRequestPrintItineraryDialog"
        />
      </template>

      <template #item.name="{ item }">
        {{ item.name.replace(".", " ") }}
      </template>

      <template #item.location="{ item }">
        <div class="d-flex flex-wrap ga-1">
          <LocationChip
            v-for="locationId in item.locationIds"
            :key="locationId"
            :location-id="locationId"
          />
        </div>
      </template>

      <template #item.startDate="{ item }">
        <div v-if="item.isOpenForAnyDate">
          {{ item.month }}
        </div>
        <div v-else>
          <div>
            {{ formatDate(item.startDate) }}
          </div>
        </div>
      </template>
      <template #item.endDate="{ item }">
        <div v-if="item.isOpenForAnyDate">
          {{ item.month }}
        </div>
        <div v-else>
          <div>
            {{ formatDate(item.endDate) }}
          </div>
        </div>
      </template>

      <template #item.edit="{ item }">
        <NewTravelDeskRequest
          v-if="
            item.status == 'Approved' &&
            item.phase != 'Travel Arrangements Requested' &&
            item.phase != 'Options Ranked' &&
            item.phase != 'Booked'
          "
          :type="
            item.phase == 'Travel Approved' || item.phase == 'Request Draft' ? 'Submit' : 'Review'
          "
          :authorized-travel="item"
          :return-to="returnTo"
          @update-table="updateTable"
        />
        <v-btn
          v-if="hasInvoiceNumber(item)"
          class="ml-2"
          color="#005A65"
          size="x-small"
          @click="openPrintItineraryDialog(item.id)"
        >
          View Itinerary
        </v-btn>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import { formatDate } from "@/utils/formatters"

import NewTravelDeskRequest from "@/modules/travelDesk/views/Requests/NewTravelDeskRequest.vue"
import TravelDeskTravelRequestPrintItineraryDialog from "@/components/travel-desk-travel-requests/TravelDeskTravelRequestPrintItineraryDialog.vue"

import LocationChip from "@/components/locations/LocationChip.vue"

export default {
  name: "TravelerRequests",
  components: {
    LocationChip,
    NewTravelDeskRequest,
    TravelDeskTravelRequestPrintItineraryDialog,
  },
  props: {
    authorizedTravels: {
      type: Array,
      default: () => [],
    },
    returnTo: {
      type: String,
      default: undefined,
    },
  },
  emits: ["updateTable"],
  data() {
    return {
      headers: [
        { title: "Name", key: "name", class: "blue-grey lighten-4" },
        { title: "Phase", key: "phase", class: "blue-grey lighten-4" },
        { title: "Location", key: "location", class: "blue-grey lighten-4" },
        { title: "Description", key: "description", class: "blue-grey lighten-4" },
        { title: "Start Date", key: "startDate", class: "blue-grey lighten-4" },
        { title: "End Date", key: "endDate", class: "blue-grey lighten-4" },
        { title: "Travel Auth Status", key: "status", class: "blue-grey lighten-4" },
        {
          title: "Travel Action",
          key: "edit",
          class: "blue-grey lighten-4",
          cellClass: "px-0 mx-0",
          sortable: false,
        },
      ],
    }
  },
  computed: {
    hasInvoiceNumber() {
      return (item) => item.status === "Approved" && item.phase === "Booked" && item.invoiceNumber
    },
  },
  methods: {
    formatDate,
    updateTable() {
      this.$emit("updateTable")
    },
    openPrintItineraryDialog(travelDeskTravelRequestId) {
      this.$refs.travelDeskTravelRequestPrintItineraryDialog.open(travelDeskTravelRequestId)
    },
  },
}
</script>

<style scoped>
:deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
