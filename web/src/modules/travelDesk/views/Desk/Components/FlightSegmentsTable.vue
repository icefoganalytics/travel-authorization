<template>
  <div>
    <v-card
      class="mt-5"
      large-title
    >
      <v-card-title>
        <h4>Segments</h4>
      </v-card-title>
      <v-card-text>
        <v-row class="mx-0">
          <v-btn
            style="min-width: 0"
            color="primary"
            class="ml-3 my-5 px-3 py-4"
            small
            @click="addBlankFlightSegment"
            >Add New Flight Segment
          </v-btn>
          <v-btn
            :disabled="selectedSegments.length == 0"
            style="min-width: 0"
            color="red"
            class="ml-auto mr-3 my-5 px-3 py-4"
            small
            @click="removeFlightSegments"
            >Delete Selected
          </v-btn>
          <v-btn
            :disabled="selectedSegments.length == 0"
            style="min-width: 0"
            color="primary"
            class="ml-3 mr-3 my-5 px-3 py-4"
            small
            @click="groupFlightSegments"
            >Group Selected
          </v-btn>
        </v-row>
        <v-data-table
          v-model="selectedSegments"
          :headers="headers"
          :items="flightSegments"
          :items-per-page="-1"
          class="elevation-1 mt-3"
          :hide-default-footer="true"
          :hide-default-header="true"
          item-key="tmpId"
          :show-select="true"
          @item-selected="segmentSelected"
        >
          <!-- <template v-slot:[`header.data-table-select`]></template> -->
          <template #item.name="{ item }">
            <FlightSegment
              class="mx-4 my-8"
              :flight-segment="item"
            />
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { TRAVEL_DESK_QUESTION_REQUEST_TYPES } from "@/api/travel-desk-questions-api"

import FlightSegment from "@/modules/travelDesk/views/Desk/Components/FlightSegment.vue"

export default {
  name: "FlightSegmentsTable",
  components: {
    FlightSegment,
  },
  props: {
    readonly: Boolean,
    flightSegments: {
      type: Array,
      default: () => [],
    },
    flightOptions: {
      type: Array,
      default: () => [],
    },
    flightText: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      tmpId: 1,
      admin: false,
      savingData: false,
      selectedSegments: [],
      headers: [{ text: "", value: "name", class: "" }],
    }
  },
  watch: {
    flightText(val) {
      console.log(val)
      if (val.length > 0) {
        this.addFlightSegment(val)
        // this.flightText.splice(0)
      }
    },
  },

  mounted() {
    // this.initForm()
  },
  methods: {
    // updateTable(type) {

    // 	// if(type=='Add New'){
    // 	// 	this.carRequest.tmpId=this.tmpId
    // 	// 	this.rentalCars.push(JSON.parse(JSON.stringify(this.carRequest)))
    // 	// 	this.tmpId++
    // 	// }
    // },

    newForm() {
      this.questions.push({
        question: "",
        response: "",
        requestType: TRAVEL_DESK_QUESTION_REQUEST_TYPES.HOTEL,
      })
    },

    initForm() {
      // this.selectedSegments=[]
    },

    getState() {
      return {
        flightErr: false,
        departDateErr: false,
        departTimeErr: false,
        departLocationErr: false,
        arriveDateErr: false,
        arriveTimeErr: false,
        arriveLocationErr: false,
        durationErr: false,
        classErr: false,
        statusErr: false,
      }
    },

    addBlankFlightSegment() {
      const flightSegment = {
        tmpId: this.tmpId,
        flightNumber: "",
        departDate: "",
        departDay: "",
        departTime: "",
        departLocation: "",
        arriveDate: "",
        arriveDay: "",
        arriveTime: "",
        arriveLocation: "",
        duration: "",
        status: "",
        class: "",
        sortOrder: null,
        state: this.getState(),
      }
      this.tmpId++
      this.flightSegments.push(flightSegment)
    },

    addFlightSegment(flights) {
      for (const flight of flights) {
        const arrivalDate = this.getFlightDate(flight.arrivalDate)
        const departureDate = this.getFlightDate(flight.departureDate)

        const flightSegment = {
          tmpId: this.tmpId,
          sortOrder: null,
          state: this.getState(),

          flightNumber: this.cleanText(flight.airline + " " + flight.flightNumber),
          departDate: departureDate,
          departDay: departureDate.toISOString().slice(0, 10),
          departTime: this.cleanText(flight.departureTime),
          departLocation: this.cleanText(
            flight.departureAirport +
              " " +
              flight.departureAirportCode +
              " Terminal: " +
              flight.departureTerminal
          ),
          arriveDate: arrivalDate,
          arriveDay: arrivalDate.toISOString().slice(0, 10),
          arriveTime: this.cleanText(flight.arrivalTime),
          arriveLocation: this.cleanText(
            flight.arrivalAirport +
              " " +
              flight.arrivalAirportCode +
              " Terminal: " +
              flight.arrivalTerminal
          ),
          duration: this.cleanText(flight.duration),
          status: this.cleanText(flight.status),
          class: this.cleanText(flight.class),
        }
        this.tmpId++
        this.flightSegments.push(flightSegment)
      }
      this.$emit("cleanPortText")
    },

    cleanText(txt) {
      txt = txt.replace("undefined", "")
      txt = txt.replace(/\s\s+/g, " ")
      txt = txt.trim()
      return txt
    },

    getFlightDate(date) {
      const today = new Date()
      const flightDate = this.cleanText(date)
      let fullDate = new Date()

      const datePattern = /^(\d{1,2})(\/|\s|-)([A-Za-z]{2,3})(,?)(\/|\s|-)(\d{2}|\d{4})$/
      const datePatternI = /^(\d{1,2})(\/|\s|-)([A-Za-z]{3})$/
      const datePatternII = /^([A-Za-z]{3})(\/|\s|-)(\d{1,2})$/

      if (flightDate.match(datePattern)) {
        fullDate = new Date(flightDate)
      } else if (flightDate.match(datePatternI) || flightDate.match(datePatternII)) {
        fullDate = new Date(flightDate + " " + today.getFullYear())
        if (fullDate < today) fullDate = new Date(flightDate + " " + (today.getFullYear() + 1))
      }
      return fullDate
    },

    segmentSelected(event) {
      // console.log(event)
      this.checkStates(event.item)
    },

    checkStates(item) {
      const state = {
        flightErr: item.flightNumber ? false : true,
        departDateErr: item.departDay ? false : true,
        departTimeErr: item.departTime ? false : true,
        departLocationErr: item.departLocation ? false : true,
        arriveDateErr: item.arriveDay ? false : true,
        arriveTimeErr: item.arriveTime ? false : true,
        arriveLocationErr: item.arriveLocation ? false : true,
        durationErr: item.duration ? false : true,
        classErr: item.class ? false : true,
        statusErr: item.status ? false : true,
      }
      item.state = state

      for (const key of Object.keys(state)) {
        if (state[key]) {
          // const delIndex = this.selectedSegments = this.selectedSegments.findIndex(seg => seg.tmpId == item.tmpId);
          // if(delIndex>=0) this.selectedSegments.splice(delIndex,1);
          return false
        }
      }
      return true
    },

    groupFlightSegments() {
      const tmpids = []
      let durationHours = 0
      let durationMinutes = 0
      let sortOrder = 1
      for (const segment of this.selectedSegments) {
        tmpids.push(segment.tmpId)
        segment.sortOrder = sortOrder
        sortOrder++
        const duration = this.extractDuration(segment.duration)
        durationHours += Number(duration.hours)
        durationMinutes += Number(duration.minutes)
        if (this.checkStates(segment) == false) {
          // this.selectedSegments=[];
          return null
        }
      }
      // console.log(durationHours+" Hour(s) "+ durationMinutes+ " Minute(s)")

      const flightOption = {
        cost: "",
        leg: "",
        state: { costErr: false },
        flightPreference: "",
        duration: durationHours + " Hour(s) " + durationMinutes + " Minute(s)",
        flightSegments: JSON.parse(JSON.stringify(this.selectedSegments)),
      }
      this.flightOptions.push(flightOption)
      console.log(tmpids)

      for (const tmpid of tmpids) {
        const delIndex = this.flightSegments.findIndex((segment) => segment.tmpId == tmpid)
        if (delIndex >= 0) this.flightSegments.splice(delIndex, 1)
      }

      this.selectedSegments = []
    },

    extractDuration(duration) {
      // console.log(duration.match(/\d+/g))
      let hours = 0
      let minutes = 0
      const time = duration.match(/\d+/g)
      if (time?.length == 2) {
        hours = time[0]
        minutes = time[1]
      } else if (time?.length == 1) {
        minutes = duration.includes("m") || duration.includes("M") ? time[0] : 0
        hours = duration.includes("h") || duration.includes("H") ? time[0] : 0
      }

      return { hours: hours, minutes: minutes }
    },

    removeFlightSegments() {
      for (const selectedSegment of this.selectedSegments) {
        const delIndex = this.flightSegments.findIndex(
          (segment) => segment.tmpId == selectedSegment.tmpId
        )
        if (delIndex >= 0) this.flightSegments.splice(delIndex, 1)
      }
      this.selectedSegments.splice(0)
    },
  },
}
</script>

<style scoped>
::v-deep table tbody td {
  border: 0px solid white !important;
  background-color: #ffffff !important;
}
</style>
