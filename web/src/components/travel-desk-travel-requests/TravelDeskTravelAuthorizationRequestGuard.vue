<template>
  <div>
    <v-skeleton-loader
      v-if="isLoading && isNil(activeTravelAuthorization) && !isErrored"
      type="card"
    />
    <v-alert
      v-else-if="isErrored && isNil(activeTravelAuthorization)"
      type="error"
    >
      The travel authorization could not be loaded.
    </v-alert>
    <v-alert
      v-else-if="isNil(activeTravelAuthorization)"
      type="info"
    >
      This travel authorization is unavailable.
    </v-alert>
    <v-alert
      v-else-if="isNil(activeTravelAuthorization.travelDeskTravelRequest)"
      type="info"
    >
      A Travel Desk Request has not been created for this authorization. Request creation and
      prefill are completed during approval.
    </v-alert>
    <TravelDeskTravelRequestDetails
      v-else
      :key="activeTravelAuthorization.travelDeskTravelRequest.id"
      :travel-desk-travel-request-id="activeTravelAuthorization.travelDeskTravelRequest.id"
      :travel-authorization="activeTravelAuthorization"
      :return-to="returnTo"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from "vue"
import { isNil } from "lodash"

import useTravelAuthorization from "@/use/use-travel-authorization"

import TravelDeskTravelRequestDetails from "@/components/travel-desk-travel-requests/TravelDeskTravelRequestDetails.vue"

const props = defineProps<{
  travelAuthorizationId: number
  returnTo: string
}>()
const { travelAuthorizationId } = toRefs(props)
const { travelAuthorization, isLoading, isErrored } = useTravelAuthorization(travelAuthorizationId)
const activeTravelAuthorization = computed(() => {
  if (travelAuthorization.value?.id !== Number(travelAuthorizationId.value)) return null

  return travelAuthorization.value
})
</script>
