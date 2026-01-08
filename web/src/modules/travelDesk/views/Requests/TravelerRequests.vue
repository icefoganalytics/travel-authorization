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
        {{ getLocationName(item.locationIds) }}
      </template>

      <template #item.startDate="{ item }">
        <div v-if="item.isOpenForAnyDate">
          {{ item.month }}
        </div>
        <div v-else>
          <div>
            {{ item.startDate | beautifyDate }}
          </div>
        </div>
      </template>
      <template #item.endDate="{ item }">
        <div v-if="item.isOpenForAnyDate">
          {{ item.month }}
        </div>
        <div v-else>
          <div>
            {{ item.endDate | beautifyDate }}
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
          @updateTable="updateTable"
        />
        <v-btn
          v-if="hasInvoiceNumber(item)"
          class="ml-2"
          color="#005A65"
          x-small
          @click="openPrintItineraryDialog(item.id)"
        >
          View Itinerary
        </v-btn>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import Vue from "vue"
import NewTravelDeskRequest from "@/modules/travelDesk/views/Requests/NewTravelDeskRequest.vue"
import TravelDeskTravelRequestPrintItineraryDialog from "@/components/travel-desk-travel-requests/TravelDeskTravelRequestPrintItineraryDialog.vue"

export default {
  name: "TravelerRequests",
  components: {
    NewTravelDeskRequest,
    TravelDeskTravelRequestPrintItineraryDialog,
  },
  props: {
    authorizedTravels: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      headers: [
        { text: "Name", value: "name", class: "blue-grey lighten-4" },
        { text: "Phase", value: "phase", class: "blue-grey lighten-4" },
        { text: "Location", value: "location", class: "blue-grey lighten-4" },
        { text: "Description", value: "description", class: "blue-grey lighten-4" },
        { text: "Start Date", value: "startDate", class: "blue-grey lighten-4" },
        { text: "End Date", value: "endDate", class: "blue-grey lighten-4" },
        { text: "Travel Auth Status", value: "status", class: "blue-grey lighten-4" },
        {
          text: "Travel Action",
          value: "edit",
          class: "blue-grey lighten-4",
          cellClass: "px-0 mx-0",
          sortable: false,
        },
      ],
      admin: false,
      department: "",
    }
  },
  computed: {
    hasInvoiceNumber() {
      return (item) => item.status === "Approved" && item.phase === "Booked" && item.invoiceNumber
    },
  },
  mounted() {
    this.department = this.$store.state.auth?.department
    this.admin = Vue.filter("isAdmin")()
  },
  methods: {
    updateTable() {
      this.$emit("updateTable")
    },
    openPrintItineraryDialog(travelDeskTravelRequestId) {
      this.$refs.travelDeskTravelRequestPrintItineraryDialog.open(travelDeskTravelRequestId)
    },
    getLocationName(locations) {
      const names = []
      const destinations = this.$store.state.traveldesk.destinations
      for (const locationId of locations) {
        const location = destinations.filter((dest) => dest.value == locationId)
        if (location.length > 0) {
          names.push(location[0].text)
        }
      }
      return names.join(", ")
    },
  },
}
</script>

<style scoped>
::v-deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
