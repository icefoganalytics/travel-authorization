<template>
  <div v-if="dataReady">
    <v-row class="mt-0 mb-0 mx-0">
      <v-col
        cols="2"
        class="px-0"
      >
        <div
          style="font-size: 9pt"
          :class="state.preferenceErr ? 'my-0 mx-1 pl-1 red white--text' : 'my-0 mx-1'"
        >
          Preference
        </div>
        <v-select
          :readonly="travelDeskUser"
          class="mr-2"
          :items="preferenceList"
          :hint="
            flightOption.flightPreferenceOrder == 'Does Not Work'
              ? travelDeskUser
                ? 'Please see the Additional Information.'
                : 'Please add your comment to the Additional Information field.'
              : ''
          "
          persistent-hint
          :error="state.preferenceErr"
          @input="state.preferenceErr = false"
          label="Preference"
          v-model="flightOption.flightPreferenceOrder"
          solo
        />
      </v-col>

      <v-col
        cols="10"
        class="px-0"
      >
        <v-card
          color="#FAFAFA"
          style="border: 2px solid #aaccff !important"
        >
          <v-row class="mt-1 mx-2">
            <b>COST:</b> <b class="ml-2">$ {{ flightOption.cost }}</b>
          </v-row>
          <div
            class="px-1"
            v-for="(flightSegment, inx) in sortByOrder"
            :key="'segment-' + flightSegment.id + '-' + inx"
          >
            <table style="width: 100%; margin-top: 1rem">
              <tbody>
                <tr style="line-height: 1rem">
                  <td colspan="3">{{ flightSegment.flightNumber }}</td>
                </tr>
                <tr style="background: #f9f9f9">
                  <td style="width: 16%">Departure:</td>
                  <td style="width: 30%">{{ formatDateTime(flightSegment.departAt) }}</td>
                  <td style="width: 50%">{{ flightSegment.departLocation }}</td>
                </tr>
                <tr style="line-height: 1rem">
                  <td style="width: 16%">Arrival:</td>
                  <td style="width: 30%">{{ formatDateTime(flightSegment.arriveAt) }}</td>
                  <td style="width: 50%">{{ flightSegment.arriveLocation }}</td>
                </tr>
                <tr style="background: #f9f9f9">
                  <td style="width: 16%">Duration</td>
                  <td
                    style="width:30%;"
                  >
                    {{ flightSegment.duration }}
                  </td>
                  <td style="width: 50%"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { nextTick } from "vue"

import { formatDateTime } from "@/utils/formatters"

export default {
  name: "FlightOptionCard",
  props: {
    flightOption: {},
    optLen: { type: Number },
    travelDeskUser: { type: Boolean },
  },
  data() {
    return {
      readonly: false,
      preferenceList: [],
      dataReady: false,
      state: {
        preferenceErr: false,
      },
    }
  },
  mounted() {
    this.dataReady = false
    this.preferenceList = ["Does Not Work"]
    for (let i = 1; i <= this.optLen; i++) this.preferenceList.push(String(i))

    if (!this.travelDeskUser) {
      this.state.preferenceErr = this.flightOption.flightPreferenceOrder ? false : true
    }

    nextTick(() => (this.dataReady = true))
  },
  computed: {
    sortByOrder() {
      const flight = JSON.parse(JSON.stringify(this.flightOption.flightSegments))
      flight.sort((a, b) => {
        return a.sortOrder > b.sortOrder ? 1 : -1
      })
      return flight
    },
  },
  methods: {
    formatDateTime,
  },
}
</script>

<style scoped>
::v-deep .v-text-field.v-text-field .v-input__control {
  min-height: 5px;
}
</style>
