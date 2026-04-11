<template>
  <v-card :loading="isLoading">
    <v-card-title>
      <h4>Import Flight Segments from Travelport&trade; Text</h4>
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col>
          <v-textarea
            v-model="rawTravelPortalText"
            label="Paste Text Here"
            rows="8"
            clearable
            variant="outlined"
            hide-details
            @keydown.ctrl.enter="parseRawTravelPortalText"
          />
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn
        :loading="isLoading"
        color="primary"
        @click="parseRawTravelPortalText"
      >
        Import Flight Segments
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref } from "vue"
import { isNil, sortBy } from "lodash"

import { parseTravelportalFlights, parseHumanizedDate } from "@/utils/travelportal-parsers"

import useSnack from "@/use/use-snack"

const emit = defineEmits(["imported"])

const rawTravelPortalText = ref("")

const isLoading = ref(false)
const snack = useSnack()

// TODO: build a simplified travel parser that only returns flight segment information.
// This parser should also clean the data, so it returns it as TravelDeskFlightSegment creation attributes
async function parseRawTravelPortalText() {
  isLoading.value = true
  try {
    if (!rawTravelPortalText.value) return
    const parsedFlightsData = parseTravelportalFlights(rawTravelPortalText.value)

    if (isNil(parsedFlightsData)) {
      snack.error("Failed to parse travel text")
      return
    }

    const travelDeskFlightSegmentsAttributes = []
    for (const parsedFlightData of parsedFlightsData) {
      const travelDeskFlightSegmentAttributes =
        convertParsedFlightDataToFlightSegmentAttributes(parsedFlightData)
      travelDeskFlightSegmentsAttributes.push(travelDeskFlightSegmentAttributes)
    }

    const sortedTravelDeskFlightSegmentsAttributes = sortBy(travelDeskFlightSegmentsAttributes, [
      "departAt",
      "arriveAt",
    ])
    sortedTravelDeskFlightSegmentsAttributes.forEach((flightSegmentAttributes, index) => {
      flightSegmentAttributes.sortOrder = index + 1
    })

    emit("imported", sortedTravelDeskFlightSegmentsAttributes)
    rawTravelPortalText.value = ""
  } catch (error) {
    console.error("Failed to import flight segments:", error)
    snack.error(`Failed to import flight segments: ${error}`)
  } finally {
    isLoading.value = false
  }
}

function convertParsedFlightDataToFlightSegmentAttributes(rawFlightSegmentAttributes) {
  const {
    arrivalDate,
    arrivalTime,
    arrivalAirport,
    arrivalAirportCode,
    arrivalTerminal,
    departureDate,
    departureTime,
    departureAirport,
    departureAirportCode,
    departureTerminal,
    duration,
    status,
    class: klass,
    flightNumber,
    airline,
  } = rawFlightSegmentAttributes
  const arriveAt = parseHumanizedDate(arrivalDate)
  const departAt = parseHumanizedDate(departureDate)

  const flightSegmentAttributes = {
    sortOrder: 0,
    flightNumber: `${airline} ${flightNumber}`,
    departAt,
    departDay: departAt.toISOString().slice(0, 10),
    departTime: departureTime,
    // TODO: make TravelDeskFlightSegment -> terminal its own field
    departLocation: `${departureAirport} ${departureAirportCode} Terminal: ${
      departureTerminal || "N/A"
    }`,
    arriveAt,
    arriveDay: arriveAt.toISOString().slice(0, 10),
    arriveTime: arrivalTime,
    arriveLocation: `${arrivalAirport} ${arrivalAirportCode} Terminal: ${arrivalTerminal || "N/A"}`,
    duration,
    status,
    class: klass,
  }

  return flightSegmentAttributes
}
</script>
