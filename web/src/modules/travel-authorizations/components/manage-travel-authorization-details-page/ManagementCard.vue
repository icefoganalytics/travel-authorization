<template>
  <HeaderActionsCard title="Management">
    <!-- TODO: add support for re-assignment to another supervisor -->
    <v-row>
      <v-col class="d-flex flex-column flex-md-row">
        <v-skeleton-loader
          v-if="isLoading"
          type="button"
        />
        <ApproveTravelRequestDialogButton
          v-else
          :travel-authorization-id="travelAuthorizationId"
          :requestor-display-name="requestorDisplayName"
          :is-disabled="isDisabled"
          :travel-location-id="travelLocationId"
          @approved="refreshAndEmit('approved')"
        />
        <DenyTravelRequestDialogButton
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
          color="secondary"
          :to="{ name: 'ManageTravelRequests' }"
          >Back</v-btn
        >
      </v-col>
    </v-row>
  </HeaderActionsCard>
</template>

<script setup>
import { computed } from "vue"
import { isEmpty } from "lodash"

import useTravelAuthorization from "@/use/use-travel-authorization"

import HeaderActionsCard from "@/components/common/HeaderActionsCard.vue"
import ApproveTravelRequestDialogButton from "@/modules/travel-authorizations/components/manage-travel-authorization-details-page/ApproveTravelRequestDialogButton.vue"
import DenyTravelRequestDialogButton from "@/modules/travel-authorizations/components/manage-travel-authorization-details-page/DenyTravelRequestDialogButton.vue"
import ReAssignButtonDialog from "@/components/travel-authorizations/manage/ReAssignButtonDialog.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(["approved", "denied"])

const { travelAuthorization, isLoading, refresh, STATUSES } = useTravelAuthorization(
  props.travelAuthorizationId
)

const isDisabled = computed(() => {
  return isLoading.value || travelAuthorization.value.status !== STATUSES.SUBMITTED
})

const travelLocationId = computed(() => {
  const { travelSegments } = travelAuthorization.value
  if (isEmpty(travelSegments)) return null

  const lastTravelSegment = travelSegments[travelSegments.length - 1]
  return lastTravelSegment.departureLocationId
})

const requestorDisplayName = computed(() => {
  const { displayName } = travelAuthorization.value.user
  return displayName
})

async function refreshAndEmit(eventName) {
  await refresh()
  emit(eventName)
}
</script>
