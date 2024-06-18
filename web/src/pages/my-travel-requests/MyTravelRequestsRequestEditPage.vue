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
    <TravelDeskTravelRequestEditCard
      v-else
      :travel-desk-travel-request-id="travelDeskTravelRequestId"
      @state-changed="emit('state-changed')"
    />
  </v-container>
</template>

<script setup>
import { isNil } from "lodash"
import { computed } from "vue"

import useTravelDeskTravelRequests from "@/use/use-travel-desk-travel-requests"

import TravelDeskTravelRequestEditCard from "@/components/travel-desk-travel-requests/TravelDeskTravelRequestEditCard.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(["state-changed"])

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

const travelDeskTravelRequestId = computed(() => {
  return travelDeskTravelRequests.value[0]?.id
})
</script>
