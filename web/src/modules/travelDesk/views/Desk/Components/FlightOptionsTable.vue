<template>
  <div>
    <v-card
      class="mt-5"
      large-title
      :border="'1px solid #FFEEDD !important'"
    >
      <v-card-title>
        <span class="brown--text">Grouping</span>
      </v-card-title>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="flightOptions"
          :items-per-page="-1"
          class="mt-3"
          :hide-default-footer="true"
          :hide-default-header="true"
        >
          <template #item.name="{ item, index }">
            <v-card
              class="my-5"
              :border="'1px solid #AAEEFF !important'"
            >
              <v-card-title>
                <v-row class="mx-0 blue--text">Group {{ index + 1 }}</v-row>
              </v-card-title>
              <v-card-text>
                <v-row class="mx-3 mt-0 mb-n8">
                  <v-col cols="3">
                    <v-text-field
                      v-model="item.cost"
                      :error="item.state.costErr"
                      label="Cost"
                      prefix="$"
                      type="number"
                      outlined
                      @input="item.state.costErr = false"
                    />
                  </v-col>
                  <v-col cols="3">
                    <v-text-field
                      v-model="item.duration"
                      readonly
                      label="Travel Duration"
                      outlined
                    />
                  </v-col>
                  <v-col cols="5">
                    <v-select
                      v-model="item.flightRequestID"
                      :items="legs"
                      :error="item.state.legErr"
                      item-value="flightRequestID"
                      label="Leg"
                      outlined
                      @input="item.state.legErr = false"
                    />
                  </v-col>
                </v-row>
                <div
                  v-for="(segment, inx) in item.flightSegments"
                  :key="'group-' + segment.FlightSegmentID + '-' + inx + flightKey"
                >
                  <v-row class="my-0 mx-0">
                    <div style="width: 3%; display: flex; align-items: center">
                      <div
                        style="
                          cursor: pointer;
                          background: #cceefe;
                          border-radius: 5px;
                          margin: 0 0.3rem;
                        "
                        :draggable="true"
                        @dragover.prevent
                        @drop.prevent="drop(item, segment, index)"
                        @dragstart="drag(segment, index)"
                      >
                        <v-icon>mdi-arrow-all</v-icon>
                      </div>
                    </div>
                    <div style="width: 97%">
                      <FlightSegment
                        class="mr-4 mb-2"
                        :flight-segment="segment"
                      />
                    </div>
                  </v-row>
                </div>
              </v-card-text>
            </v-card>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import Vue from "vue"

import FlightSegment from "@/modules/travelDesk/views/Desk/Components/FlightSegment.vue"

export default {
  name: "FlightOptionsTable",
  components: {
    FlightSegment,
  },
  props: {
    readonly: Boolean,
    legs: {
      type: Array,
      required: true,
    },
    flightOptions: {
      type: Array,
      required: true,
    },
    ungroupedFlightSegments: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      tmpId: 1,
      admin: false,
      savingData: false,
      selectedSegments: [],
      headers: [{ text: "", value: "name", class: "red" }],
      source: {},
      sourceInx: -1,
      flightKey: 0,
    }
  },
  computed: {},
  mounted() {
    this.initForm()
  },
  methods: {
    initForm() {
      // const carRequest = {}
    },
    drag(source, index) {
      this.source = source
      this.sourceInx = index
    },
    drop(flightOption, target, index) {
      if (this.sourceInx != index) return

      const sortOrderTarget = target.sortOrder
      target.sortOrder = JSON.parse(JSON.stringify(this.source.sortOrder))
      this.source.sortOrder = JSON.parse(JSON.stringify(sortOrderTarget))
      Vue.nextTick(() => {
        this.sortByOrder(flightOption.flightSegments)
      })
    },
    sortByOrder(flight) {
      flight.sort((a, b) => {
        return a.sortOrder > b.sortOrder ? 1 : -1
      })
      return flight
    },
  },
}
</script>

<style scoped>
/* ::v-deep tbody tr:nth-of-type(even) {
   background-color: #FFFFFF !important;
 } */

::v-deep table tbody td {
  border: 0px solid white !important;
  background-color: #ffffff !important;
}
</style>
