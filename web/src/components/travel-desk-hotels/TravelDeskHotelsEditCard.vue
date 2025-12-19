<template>
  <v-skeleton-loader
    v-if="isNil(travelAuthorization)"
    type="card"
  />
  <v-card v-else>
    <v-card-title class="d-flex justify-space-between align-center">
      <h3>Hotel Requests</h3>
      <TravelDeskHotelCreateDialog
        :activator-props="{
          class: 'my-0',
        }"
        :travel-desk-travel-request-id="travelDeskTravelRequestId"
        :min-date="minDate"
        :max-date="maxDate"
        :flight-start="earliestFlightDate"
        :flight-end="latestFlightDate"
        :conference-name="conferenceName"
        @created="refreshTravelDeskHotels"
      />
    </v-card-title>
    <v-card-text>
      <TravelDeskHotelsEditDataTable
        ref="travelDeskHotelsEditDataTable"
        :where="whereClause"
        :min-date="minDate"
        :max-date="maxDate"
        :flight-start="earliestFlightDate"
        :flight-end="latestFlightDate"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref, toRefs } from "vue"
import { isNil } from "lodash"

import useTravelAuthorization from "@/use/use-travel-authorization"
import useTravelAuthorizationSummary from "@/use/travel-authorizations/use-travel-authorization-summary"
import useTravelDeskFlightRequests from "@/use/use-travel-desk-flight-requests"

import TravelDeskHotelCreateDialog from "@/components/travel-desk-hotels/TravelDeskHotelCreateDialog.vue"
import TravelDeskHotelsEditDataTable from "@/components/travel-desk-hotels/TravelDeskHotelsEditDataTable.vue"

const props = defineProps({
  travelDeskTravelRequestId: {
    type: Number,
    required: true,
  },
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

const whereClause = computed(() => ({
  travelRequestId: props.travelDeskTravelRequestId,
}))

const { travelAuthorizationId } = toRefs(props)
const { travelAuthorization } = useTravelAuthorization(travelAuthorizationId)
const { departureDate, returnDate } = useTravelAuthorizationSummary(travelAuthorizationId)

const isConference = computed(() =>
  travelAuthorization.value?.purpose?.purpose?.toLowerCase().includes("conference")
)
const conferenceName = computed(() => {
  if (!isConference.value) return null

  return travelAuthorization.value?.eventName
})

const minDate = computed(() => departureDate.value)
const maxDate = computed(() => returnDate.value)

// TODO: maybe make an optimized query that returns the start/end dates?
const travelDeskFlightRequestsQuery = computed(() => ({
  where: {
    travelRequestId: props.travelDeskTravelRequestId,
  },
  perPage: 1000,
}))
const {
  earliestFlightDate,
  latestFlightDate,
  refresh: refreshFlightRequests,
} = useTravelDeskFlightRequests(travelDeskFlightRequestsQuery)

const travelDeskHotelsEditDataTable = ref<InstanceType<
  typeof TravelDeskHotelsEditDataTable
> | null>(null)

async function refreshTravelDeskHotels() {
  return travelDeskHotelsEditDataTable.value?.refresh()
}

defineExpose({
  refresh: refreshFlightRequests,
})
</script>

<style scoped></style>
