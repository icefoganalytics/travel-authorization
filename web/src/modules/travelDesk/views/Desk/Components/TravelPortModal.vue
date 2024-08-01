<template>
  <div>
    <v-dialog
      v-model="travelPortDialog"
      persistent
    >
      <template #activator="{ on, attrs }">
        <v-btn
          size="x-small"
          style="min-width: 0"
          color="blue"
          v-bind="attrs"
          @click="initForm()"
          v-on="on"
        >
          <div class="mx-n2 px-2">Travel Port Text</div>
        </v-btn>
      </template>

      <v-card>
        <v-card-title
          class="primary"
          style="border-bottom: 1px solid black"
        >
          <div class="text-h5">Manage Groups/Flight Options</div>
          <v-btn
            color="grey darken-5"
            class="my-0 ml-auto px-5"
            :loading="savingData"
            @click="closeModal()"
          >
            <div>Close</div>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-row class="mt-5">
            <v-col cols="3">
              <TitleCard
                class="mt-5"
                large-title
              >
                <template #title>
                  <div>Travel Port Text</div>
                </template>
                <template #body>
                  <v-row class="mx-0">
                    <v-btn
                      class="mx-auto mt-7 mb-7"
                      style="min-width: 0"
                      color="blue"
                      @click="parseTravel()"
                    >
                      <div class="mx-0 px-1">Clean and Seperate Options</div>
                    </v-btn>
                  </v-row>
                  <v-textarea
                    v-model="portText"
                    class="mx-5"
                    :error="state.portTextErr"
                    label="Paste Text Here"
                    rows="20"
                    clearable
                    outlined
                    @input="state.portTextErr = false"
                  />
                </template>
              </TitleCard>
            </v-col>
            <v-col cols="9">
              <TitleCard
                class="mt-5"
                large-title
              >
                <template #title>
                  <div>Cost and Group Segments</div>
                </template>
                <template #body>
                  <FlightSegmentsTable
                    :flight-segments="flightSegments"
                    :flight-options="flightOptions"
                    :flight-text="flightText"
                    class="mx-2 mt-10"
                    @cleanPortText="portText = ''"
                  />
                  <FlightOptionsTable
                    :legs="legs"
                    :ungrouped-flight-segments="flightSegments"
                    :flight-options="flightOptions"
                    style="margin: 7rem 0.5rem 2rem 0.5rem"
                  />
                  <v-row class="mx-0">
                    <v-btn
                      class="ml-3 mr-2 my-5 px-3 py-4"
                      style="min-width: 0"
                      color="grey darken-1"
                      :loading="savingData"
                      small
                      @click="closeModal"
                      >Close
                    </v-btn>
                    <v-btn
                      style="min-width: 0"
                      color="red"
                      class="ml-3 my-5 px-3 py-4"
                      :loading="savingData"
                      small
                      @click="deleteFlightOptions(true)"
                      >Delete Travel Port Record
                    </v-btn>
                    <v-btn
                      :disabled="flightOptions.length == 0"
                      style="min-width: 0"
                      color="secondary"
                      class="ml-auto mr-3 my-5 px-3 py-4"
                      :loading="savingData"
                      small
                      @click="removeAllFlightOptions()"
                      >Remove All Groups
                    </v-btn>
                    <v-btn
                      :disabled="flightOptions.length == 0"
                      style="min-width: 0"
                      color="#005A65"
                      class="ml-3 mr-3 my-5 px-3 py-4"
                      :loading="savingData"
                      small
                      @click="saveAllFlightOptions()"
                      >Save Groupings
                    </v-btn>
                  </v-row>
                </template>
              </TitleCard>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import Vue from "vue"

import { TRAVEL_DESK_URL } from "@/urls"
import http from "@/api/http-client"

import TitleCard from "@/modules/travelDesk/views/Common/TitleCard.vue"
import FlightSegmentsTable from "@/modules/travelDesk/views/Desk/Components/FlightSegmentsTable.vue"
import FlightOptionsTable from "@/modules/travelDesk/views/Desk/Components/FlightOptionsTable.vue"

export default {
  name: "TravelPortModal",
  components: {
    TitleCard,
    FlightSegmentsTable,
    FlightOptionsTable,
  },
  props: {
    flightRequests: {
      type: Array,
      required: true,
    },
    travelDeskTravelRequestId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      travelPortDialog: false,
      readonly: false,
      savingData: false,
      portText: "",
      flightOptions: {},
      flightText: {},
      flightSegments: [],
      state: {
        portTextErr: false,
      },
      legs: [],
    }
  },
  mounted() {},
  methods: {
    initForm() {
      this.flightSegments = []
      this.flightOptions = []
      this.legs = []
      for (const flightRequest of this.flightRequests) {
        this.flightOptions.push(...(flightRequest.flightOptions || []))
        // console.log(flightRequest)
        this.legs.push({
          flightRequestID: flightRequest.id,
          text: this.getFlightRequestTxt(flightRequest),
        })
      }
      // console.log(this.legs)
    },

    getFlightRequestTxt(flightRequest) {
      return (
        flightRequest.departLocation +
        " -> " +
        flightRequest.arriveLocation +
        " @ " +
        Vue.filter("beautifyDate")(flightRequest.datePreference)
      )
    },
    checkStates() {
      let complete = true
      for (const flightOption of this.flightOptions) {
        // console.log(flightOption)
        flightOption.state.costErr = flightOption.cost ? false : true
        flightOption.state.legErr = flightOption.flightRequestID ? false : true
        if (flightOption.state.costErr || flightOption.state.legErr) complete = false
      }
      return complete
    },

    deleteFlightOptions(removeSegments) {
      this.savingData = true
      return http
        .delete(`${TRAVEL_DESK_URL}/flight-options/${this.travelDeskTravelRequestId}`)
        .then((resp) => {
          console.log(resp)
          this.flightOptions.splice(0)
          if (removeSegments) this.flightSegments = []
          this.savingData = false
        })
        .catch((e) => {
          console.log(e)
          this.savingData = false
        })
    },

    removeAllFlightOptions() {
      for (const flightOption of this.flightOptions) {
        for (const flightSegment of flightOption.flightSegments) {
          this.flightSegments.push(flightSegment)
        }
      }
      this.flightOptions.splice(0)
      this.deleteFlightOptions(false)
    },

    saveAllFlightOptions() {
      if (this.checkStates()) {
        this.savingData = true
        const body = this.flightOptions

        return http
          .post(`${TRAVEL_DESK_URL}/flight-options/${this.travelDeskTravelRequestId}`, body)
          .then((resp) => {
            console.log(resp)
            this.savingData = false
            this.closeModal()
          })
          .catch((e) => {
            console.log(e)
            this.savingData = false
          })
      }
    },

    parseTravel() {
      if (!this.portText) return
      const parsedTravel = Vue.filter("parseTravel")(this.portText)
      console.log(parsedTravel)
      this.flightText = parsedTravel.flights
    },

    closeModal() {
      this.$emit("close")
      this.travelPortDialog = false
    },
  },
}
</script>

<style scoped>
.label {
  font-weight: 600;
  font-size: 10pt !important;
}
</style>
