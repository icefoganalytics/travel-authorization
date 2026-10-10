<template>
  <v-card
    v-if="isLoading || isErrored || travelDeskFlightRequests.length > 0"
    class="mt-4"
    variant="outlined"
  >
    <v-card-title>
      <h4>Traveler Flight Rankings</h4>
    </v-card-title>
    <v-card-text>
      <v-skeleton-loader
        v-if="isLoading"
        type="card"
      />
      <v-alert
        v-else-if="isErrored"
        type="error"
        variant="outlined"
      >
        Failed to load flight requests. Reload the page to try again.
      </v-alert>
      <div
        v-else
        class="d-flex flex-column ga-4"
      >
        <section
          v-for="(travelDeskFlightRequest, index) in travelDeskFlightRequests"
          :key="travelDeskFlightRequest.id"
        >
          <h5 class="text-subtitle-1 font-weight-bold">Leg {{ index + 1 }}</h5>
          <p class="mb-2">
            {{ travelDeskFlightRequest.departLocation }} →
            {{ travelDeskFlightRequest.arriveLocation }} @
            {{ formatDate(travelDeskFlightRequest.datePreference) }}
          </p>
          <TravelDeskFlightOptionsDataIterator
            :where="{ flightRequestId: travelDeskFlightRequest.id }"
            :route-query-suffix="`FlightOptions${travelDeskFlightRequest.id}`"
          />
        </section>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue"

import { MAX_PER_PAGE } from "@/api/base-api"
import formatDate from "@/utils/format-date"
import useTravelDeskFlightRequests from "@/use/use-travel-desk-flight-requests"

import TravelDeskFlightOptionsDataIterator from "@/components/travel-desk-flight-options/TravelDeskFlightOptionsDataIterator.vue"

const props = defineProps<{
  travelDeskTravelRequestId: number
}>()

const travelDeskFlightRequestsQuery = computed(() => ({
  where: {
    travelRequestId: props.travelDeskTravelRequestId,
  },
  perPage: MAX_PER_PAGE,
}))
const { travelDeskFlightRequests, isLoading, isErrored } = useTravelDeskFlightRequests(
  travelDeskFlightRequestsQuery
)
</script>
