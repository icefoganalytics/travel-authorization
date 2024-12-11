<template>
  <v-card
    class="card--outlined"
    :loading="isLoading"
  >
    <v-card-title>
      <h4>Options</h4>
    </v-card-title>
    <v-card-text class="d-flex flex-column gap-6 px-0 px-md-4">
      <TravelDeskFlightOptionPreferenceOrderFormCard
        v-for="(travelDeskFlightRequest, index) in travelDeskFlightRequests"
        ref="travelDeskFlightOptionPreferenceOrderFormCards"
        :key="travelDeskFlightRequest.id"
        :title="`Leg ${index + 1}`"
        :subtitle="buildFlightRequestDescription(travelDeskFlightRequest)"
        :travel-desk-flight-request-id="travelDeskFlightRequest.id"
      />
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, ref } from "vue"
import { isNil } from "lodash"

import formatDate from "@/utils/format-date"
import useTravelDeskFlightRequests from "@/use/use-travel-desk-flight-requests"

import TravelDeskFlightOptionPreferenceOrderFormCard from "@/components/travel-desk-flight-options/TravelDeskFlightOptionPreferenceOrderFormCard.vue"

const props = defineProps({
  travelDeskTravelRequestId: {
    type: Number,
    required: true,
  },
})

const travelDeskFlightRequestsQuery = computed(() => ({
  where: {
    travelRequestId: props.travelDeskTravelRequestId,
  },
}))
const { travelDeskFlightRequests, isLoading } = useTravelDeskFlightRequests(
  travelDeskFlightRequestsQuery
)

/** @typedef {import('@/api/travel-desk-flight-requests-api.js').TravelDeskFlightRequest} TravelDeskFlightRequest */

/**
 * @param travelDeskFlightRequest {TravelDeskFlightRequest}
 */
function buildFlightRequestDescription(travelDeskFlightRequest) {
  if (isNil(travelDeskFlightRequest)) return "..."

  const { departLocation, arriveLocation, datePreference } = travelDeskFlightRequest
  const formattedDate = formatDate(datePreference)
  return `${departLocation} -> ${arriveLocation} @ ${formattedDate}`
}

/** @type {import("vue").Ref<InstanceType<typeof TravelDeskFlightOptionPreferenceOrderFormCard>[]>} */
const travelDeskFlightOptionPreferenceOrderFormCards = ref([])

async function save() {
  let result = true
  for (const travelDeskFlightOptionPreferenceOrderFormCard of travelDeskFlightOptionPreferenceOrderFormCards.value) {
    result &&= await travelDeskFlightOptionPreferenceOrderFormCard.save()
  }
  return result
}

defineExpose({
  save,
})
</script>

<style scoped>
.gap-6 {
  gap: 1.5rem; /* 24px */
}
</style>
