<template>
  <v-card>
    <v-card-title> Management</v-card-title>
    <v-card-text>
      <!-- TODO: add support for re-assignment to another supervisor -->
      <v-row>
        <v-col class="d-flex justify-end">
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
            button-classes="ml-2"
            @denied="refreshAndEmit('denied')"
          />
          <ReAssignButtonDialog
            :travel-authorization-id="travelAuthorizationId"
            :is-disabled="isDisabled"
            button-classes="ml-2"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from "vue"
import { isEmpty } from "lodash"

import ApproveTravelRequestDialogButton from "./ApproveTravelRequestDialogButton.vue"
import DenyTravelRequestDialogButton from "./DenyTravelRequestDialogButton.vue"
import ReAssignButtonDialog from "@/components/travel-authorizations/manage/ReAssignButtonDialog.vue"

import { useTravelAuthorization } from "@/use/use-travel-authorization"

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
