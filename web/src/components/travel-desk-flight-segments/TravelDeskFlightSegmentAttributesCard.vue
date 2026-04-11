<template>
  <v-card variant="outlined">
    <v-card-title class="blue--text font-weight-bold">
      Flight: {{ travelDeskFlightSegmentAttributes.flightNumber }}
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text>
      <v-row class="easy-reading-text">
        <v-col
          cols="12"
          md="6"
        >
          <strong>From:</strong> {{ departLocation }}
          <br />
          Terminal: {{ departTerminal }}
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <strong>Departure:</strong>
          {{ formatDate(travelDeskFlightSegmentAttributes.departAt, "HH:mm dd MMM yyyy") }}
        </v-col>
      </v-row>
      <v-row class="easy-reading-text">
        <v-col
          cols="12"
          md="6"
        >
          <strong>To:</strong> {{ arriveLocation }}
          <br />
          Terminal: {{ arriveTerminal }}
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <strong>Arrival:</strong>
          {{ formatDate(travelDeskFlightSegmentAttributes.arriveAt, "HH:mm dd MMM yyyy") }}
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          md="4"
        >
          <strong>Class:</strong> {{ travelDeskFlightSegmentAttributes.class }}
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <strong>Baggage:</strong> {{ travelDeskFlightSegmentAttributes.baggage }}
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <strong>Duration:</strong> {{ travelDeskFlightSegmentAttributes.duration }}
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from "vue"

import formatDate from "@/utils/format-date"

/** @typedef {import('@/api/travel-desk-flight-segments-api.js').TravelDeskFlightSegment} TravelDeskFlightSegment */

/**
 * @type {{
 *   travelDeskFlightSegmentAttributes: Partial<TravelDeskFlightSegment>
 * }}
 */
const props = defineProps({
  travelDeskFlightSegmentAttributes: {
    type: Object,
    required: true,
  },
})

// TODO: maybe add "terminal" to data model?
const BEFORE_TERMINAL_REGEX = /(.*)\s+Terminal:/i
const AFTER_TERMINAL_REGEX = /Terminal:\s*(.*)/i

const departLocation = computed(() => {
  const match = props.travelDeskFlightSegmentAttributes.departLocation.match(BEFORE_TERMINAL_REGEX)
  if (!match) return props.travelDeskFlightSegmentAttributes.departLocation

  return match[1]
})

const arriveLocation = computed(() => {
  const match = props.travelDeskFlightSegmentAttributes.arriveLocation.match(BEFORE_TERMINAL_REGEX)
  if (!match) return props.travelDeskFlightSegmentAttributes.arriveLocation

  return match[1]
})

const departTerminal = computed(() => {
  const match = props.travelDeskFlightSegmentAttributes.departLocation.match(AFTER_TERMINAL_REGEX)
  if (!match) return ""

  return match[1]
})

const arriveTerminal = computed(() => {
  const match = props.travelDeskFlightSegmentAttributes.arriveLocation.match(AFTER_TERMINAL_REGEX)
  if (!match) return ""

  return match[1]
})
</script>

<style scoped>
.easy-reading-text {
  font-size: 1.2em;
  line-height: 1.5;
}
</style>
