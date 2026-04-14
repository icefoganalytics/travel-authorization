<template>
  <v-card
    :loading="loadingData"
    class="pt-1 borderless-card"
  >
    <div class="d-flex justify-end mr-3">
      <TravelDeskFlightRequestCreateDialog
        v-if="!readonly"
        :travel-desk-travel-request-id="travelDeskTravelRequestId"
        :min-date="minDate"
        :max-date="maxDate"
        @created="updateTable"
      />
    </div>
    <v-row
      v-if="!loadingData"
      class="mb-3 mx-0"
    >
      <v-col
        v-if="flightRequests?.length > 0"
        cols="12"
      >
        <v-data-table
          v-model:expanded="expanded"
          :headers="flightHeaders"
          :items="flightRequests"
          :show-expand="showFlightOptions"
          hide-default-footer
          class="elevation-1"
        >
          <template #top>
            <TravelDeskFlightRequestEditDialog
              ref="editDialog"
              :min-date="minDate"
              :max-date="maxDate"
              @saved="updateTable"
            />
          </template>
          <template #expanded-row="{ item }">
            <td
              v-if="showFlightOptions"
              :colspan="6"
            >
              <!-- {{ item.flightOptions }} -->
              <v-row
                v-for="(flightOption, inx) in item.flightOptions"
                :key="'flight-' + flightOption.id + '-' + inx"
              >
                <v-col>
                  <FlightOptionCard
                    :flight-option="flightOption"
                    :opt-len="item.flightOptions.length"
                    :travel-desk-user="travelDeskUser"
                  />
                </v-col>
              </v-row>
            </td>
          </template>

          <template #[`item.datePreference`]="{ item }">
            {{ formatDateTime(item.datePreference) }}
          </template>

          <template #[`item.edit`]="{ item }">
            <div class="d-flex ga-1 justify-end">
              <v-btn
                v-if="!readonly"
                title="Edit"
                icon="mdi-pencil"
                size="small"
                variant="text"
                color="primary"
                @click="showEditDialog(item.id)"
              />
              <v-btn
                v-if="!readonly"
                title="Delete"
                icon="mdi-close"
                size="small"
                variant="text"
                color="error"
                @click="removeFlight(item)"
              />
            </div>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import { ref } from "vue"

import { TRAVEL_DESK_URL } from "@/urls"

import { formatDateTime } from "@/utils/formatters"

import http from "@/api/http-client"

import FlightOptionCard from "@/modules/travelDesk/views/Requests/RequestDialogs/FlightComponents/FlightOptionCard.vue"
import TravelDeskFlightRequestCreateDialog from "@/components/travel-desk-flight-requests/TravelDeskFlightRequestCreateDialog.vue"
import TravelDeskFlightRequestEditDialog from "@/components/travel-desk-flight-requests/TravelDeskFlightRequestEditDialog.vue"

export default {
  name: "TravelDeskFlightRequestsEditTable",
  components: {
    FlightOptionCard,
    TravelDeskFlightRequestCreateDialog,
    TravelDeskFlightRequestEditDialog,
  },
  props: {
    travelDeskTravelRequestId: {
      type: Number,
      default: () => null,
    },
    flightRequests: {
      type: Array,
      default: () => [],
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    travelDeskUser: {
      type: Boolean,
      default: false,
    },
    showFlightOptions: {
      type: Boolean,
      default: false,
    },
    authorizedTravel: {
      type: Object,
      default: () => ({}),
    },
  },
  setup() {
    /** @type {import("vue").Ref<InstanceType<typeof TravelDeskFlightRequestEditDialog> | null>} */
    const editDialog = ref(null)

    function showEditDialog(travelDeskFlightRequestId) {
      editDialog.value?.show(travelDeskFlightRequestId)
    }

    return {
      showEditDialog,
      editDialog,
    }
  },
  data() {
    return {
      flightHeaders: [
        { title: "", key: "data-table-expand", class: "blue-grey lighten-4" },
        {
          title: "Depart Location",
          key: "departLocation",
          class: "blue-grey lighten-4",
          sortable: false,
        },
        {
          title: "Arrive Location",
          key: "arriveLocation",
          class: "blue-grey lighten-4",
          sortable: false,
        },
        { title: "Date", key: "date", class: "blue-grey lighten-4" },
        {
          title: "Time Preference",
          key: "timePreference",
          class: "blue-grey lighten-4",
          sortable: false,
        },
        {
          title: "Seat Preference",
          key: "seatPreference",
          class: "blue-grey lighten-4",
          sortable: false,
        },
        { title: "", key: "edit", class: "blue-grey lighten-4", width: "4rem", sortable: false },
      ],
      flightRequest: {},
      tmpId: 1,
      admin: false,
      travelerDetails: {},
      savingData: false,
      expanded: [],
      loadingData: false,
      minDate: "",
      maxDate: "",
    }
  },
  mounted() {
    this.initForm()
  },
  methods: {
    formatDateTime,
    async updateTable(type) {
      if (type == "Add New") {
        // console.log(this.flightRequests)
        this.flightRequest.tmpId = this.tmpId
        this.flightRequests.push(JSON.parse(JSON.stringify(this.flightRequest)))
        this.tmpId++
        await this.saveFlightRequests()
      } else if (type == "Edit") {
        await this.saveFlightRequests()
      }
    },

    async initForm() {
      if (this.authorizedTravel?.startDate && this.authorizedTravel?.endDate) {
        this.minDate = this.authorizedTravel.startDate.slice(0, 10)
        this.maxDate = this.authorizedTravel.endDate.slice(0, 10)
      }
      if (this.travelDeskTravelRequestId) await this.loadFlightRequests()
      const flightRequest = {}
      flightRequest.id = null
      flightRequest.tmpId = null

      flightRequest.departLocation = ""
      flightRequest.arriveLocation = ""
      flightRequest.datePreference = ""
      flightRequest.timePreference = ""
      flightRequest.seatPreference = ""
      flightRequest.flightOptions = []
      // flightRequest.status="Requested";

      this.flightRequest = flightRequest
    },

    editFlight(item) {
      this.flightRequest = item
    },

    async removeFlight(item) {
      // console.log(item)
      let delIndex = -1
      if (item.id > 0)
        delIndex = this.flightRequests.findIndex((flight) => flight.id && flight.id == item.id)
      else
        delIndex = this.flightRequests.findIndex(
          (flight) => flight.tmpId && flight.tmpId == item.tmpId
        )
      // console.log(delIndex)
      if (delIndex >= 0) {
        this.flightRequests.splice(delIndex, 1)
        await this.saveFlightRequests()
      }
    },

    async loadFlightRequests() {
      this.loadingData = true

      return http
        .get(`${TRAVEL_DESK_URL}/flight-request/${this.travelDeskTravelRequestId}`)
        .then((resp) => {
          // console.log(resp.data)
          this.flightRequests.splice(0)
          for (const flightRequest of resp.data) this.flightRequests.push(flightRequest)
          this.loadingData = false
        })
        .catch((e) => {
          console.log(e)
          this.loadingData = false
        })
    },

    async saveFlightRequests() {
      this.loadingData = true
      const body = this.flightRequests

      return http
        .post(`${TRAVEL_DESK_URL}/flight-request/${this.travelDeskTravelRequestId}`, body)
        .then(() => {
          // console.log(resp)
          this.loadFlightRequests()
          this.loadingData = false
        })
        .catch((e) => {
          console.log(e)
          this.loadingData = false
        })
    },
  },
}
</script>

<style scoped>
:deep(.v-data-table > .v-data-table__wrapper tbody tr.v-data-table__expanded__content) {
  background: #f9f9f9 !important;
}

.v-card.borderless-card {
  border: none !important;
  box-shadow: none !important;
}
</style>
