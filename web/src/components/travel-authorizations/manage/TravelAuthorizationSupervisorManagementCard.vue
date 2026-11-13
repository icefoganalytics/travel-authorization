<template>
  <HeaderActionsCard title="Management">
    <v-row>
      <v-col class="d-flex flex-column flex-md-row">
        <v-skeleton-loader
          v-if="isLoading"
          type="button"
        />
        <TravelAuthorizationApproveDialogButton
          v-else
          :travel-authorization-id="travelAuthorizationId"
          :requestor-display-name="requestorDisplayName"
          :is-disabled="isDisabled"
          :travel-location-id="finalDestinationLocationId"
          @approved="refreshAndEmit('approved')"
        />
        <TravelAuthorizationDenyDialogButton
          :travel-authorization-id="travelAuthorizationId"
          :is-disabled="isDisabled"
          button-classes="ml-md-2"
          @denied="refreshAndEmit('denied')"
        />
        <ReAssignButtonDialog
          :travel-authorization-id="travelAuthorizationId"
          :is-disabled="isDisabled"
          button-classes="ml-md-2"
        />
        <v-spacer />
        <v-btn
          variant="outlined"
          :to="{ name: 'ManageTravelRequests' }"
          >Back</v-btn
        >
      </v-col>
    </v-row>
  </HeaderActionsCard>
</template>

<script setup lang="ts">
import { computed, toRefs } from "vue"
import { isNil } from "lodash"

import determineFinalDestinationSegment from "@/capabilities/travel-itinerary/determine-final-destination-segment"

import { TravelAuthorizationStatuses } from "@/api/travel-authorizations-api"

import useTravelAuthorization from "@/use/use-travel-authorization"

import HeaderActionsCard from "@/components/common/HeaderActionsCard.vue"
import ReAssignButtonDialog from "@/components/travel-authorizations/manage/ReAssignButtonDialog.vue"
import TravelAuthorizationApproveDialogButton from "@/components/travel-authorizations/manage/TravelAuthorizationApproveDialogButton.vue"
import TravelAuthorizationDenyDialogButton from "@/components/travel-authorizations/manage/TravelAuthorizationDenyDialogButton.vue"

const props = defineProps<{
  travelAuthorizationId: number
}>()

const emit = defineEmits<{
  (event: "approved" | "denied"): void
}>()

const { travelAuthorizationId } = toRefs(props)
const { travelAuthorization, isLoading, refresh } = useTravelAuthorization(travelAuthorizationId)

const isDisabled = computed(() => {
  return (
    isLoading.value || travelAuthorization.value?.status !== TravelAuthorizationStatuses.SUBMITTED
  )
})

const finalDestinationLocationId = computed(() => {
  if (isNil(travelAuthorization.value)) return null

  const { travelSegments, tripTypeActual, tripTypeEstimate } = travelAuthorization.value
  const tripType = tripTypeActual ?? tripTypeEstimate
  const useActuals = !isNil(tripTypeActual)
  const matchingTravelSegments = travelSegments.filter((segment) => segment.isActual === useActuals)
  const finalDestinationSegment = determineFinalDestinationSegment(tripType, matchingTravelSegments)
  return finalDestinationSegment?.arrivalLocationId ?? null
})

const requestorDisplayName = computed(() => {
  const displayName = travelAuthorization.value?.user?.displayName
  if (isNil(displayName)) return ""

  return displayName
})

async function refreshAndEmit(eventName: "approved" | "denied") {
  await refresh()
  emit(eventName)
}
</script>
