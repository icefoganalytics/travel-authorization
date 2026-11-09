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
          :travel-location-id="travelLocationId"
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

import {
  TravelAuthorizationStatuses,
  TravelAuthorizationTripTypes,
} from "@/api/travel-authorizations-api"

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

const travelLocationId = computed(() => {
  if (isNil(travelAuthorization.value)) return null

  const { travelSegments, tripTypeActual, tripTypeEstimate } = travelAuthorization.value
  const tripType = tripTypeActual ?? tripTypeEstimate
  const matchingTravelSegments = travelSegments.filter(
    (segment) => segment.isActual === Boolean(tripTypeActual)
  )
  const finalDestinationSegment =
    tripType === TravelAuthorizationTripTypes.ROUND_TRIP
      ? matchingTravelSegments.at(-2)
      : matchingTravelSegments.at(-1)

  return finalDestinationSegment?.arrivalLocationId ?? null
})

const requestorDisplayName = computed(() => {
  return travelAuthorization.value?.user?.displayName ?? ""
})

async function refreshAndEmit(eventName: "approved" | "denied") {
  await refresh()
  emit(eventName)
}
</script>
