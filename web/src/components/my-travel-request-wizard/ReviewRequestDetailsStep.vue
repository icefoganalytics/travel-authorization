<template>
  <v-skeleton-loader
    v-if="isNil(travelDeskTravelRequestId) && !isErrored"
    type="card"
  />
  <v-alert
    v-else-if="isErrored"
    type="error"
  >
    Failed to fetch travel desk travel request.
  </v-alert>

  <TravelDeskTravelRequestCard
    v-else
    :travel-desk-travel-request-id="travelDeskTravelRequestId"
  />
</template>

<script setup>
import { computed } from "vue"
import { isNil } from "lodash"

import useTravelDeskTravelRequests from "@/use/use-travel-desk-travel-requests"

import TravelDeskTravelRequestCard from "@/components/travel-desk-travel-requests/TravelDeskTravelRequestCard.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

// TODO: Consider loading travelAuthorization and pulling travelDeskTravel request from there.
const travelDeskTravelRequestQueryOptions = computed(() => ({
  where: {
    travelAuthorizationId: props.travelAuthorizationId,
  },
  perPage: 1,
}))
const { travelDeskTravelRequests, isErrored } = useTravelDeskTravelRequests(
  travelDeskTravelRequestQueryOptions
)

const travelDeskTravelRequest = computed(() => {
  return travelDeskTravelRequests.value[0]
})

const travelDeskTravelRequestId = computed(() => {
  return travelDeskTravelRequest.value?.id
})

async function initialize(context) {
  context.setEditableSteps([])
}

defineExpose({
  initialize,
})
</script>
