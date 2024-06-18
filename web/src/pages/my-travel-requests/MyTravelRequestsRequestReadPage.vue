<template>
  <v-container class="px-0 px-md-6">
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

    TODO: build read page for TravelDeskTravelRequest#{{ travelDeskTravelRequestId }}
    <br />
    status: {{ travelDeskTravelRequest?.status }}
  </v-container>
</template>

<script setup>
import { isNil } from "lodash"
import { computed } from "vue"

import useTravelDeskTravelRequests from "@/use/use-travel-desk-travel-requests"

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
</script>
