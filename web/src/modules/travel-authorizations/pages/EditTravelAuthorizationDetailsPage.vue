<template>
  <div>
    <v-row>
      <v-col>
        <PurposeEditFormCard :travel-authorization-id="travelAuthorizationId" />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <!-- TODO: consider if actuals should only be displayed after travel authorization is approved? -->
        <!-- TODO: consider if edit page should be split into "before travel" and "after travel" pages -->
        <HeaderActionsCard :title="tripDetailsCardTitle">
          <TripDetailsEstimatesEditForm
            v-if="isBeforeTravelStartDate"
            :travel-authorization-id="travelAuthorizationId"
          />
          <TripDetailsActualsEditForm
            v-else
            :travel-authorization-id="travelAuthorizationId"
          />
        </HeaderActionsCard>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <ApprovalsEditFormCard :travel-authorization-id="travelAuthorizationId" />
      </v-col>
    </v-row>
    <div class="d-flex justify-end">
      <v-btn
        :loading="isLoading"
        color="green"
        @click="saveWrapper"
      >
        Save Draft
      </v-btn>
      <!-- TODO: re-add back button once travel authorizatons page exists -->
      <!-- <v-btn
        class="ml-3"
        color="secondary"
        :to="{ name: 'TravelAuthorizationsPage' }"
        >Back</v-btn
      > -->
    </div>
    <v-row>
      <v-col>
        <TravelAuthorizationActionLogsTable :travel-authorization-id="travelAuthorizationId" />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { isNil } from "lodash"

import useTravelSegments from "@/use/use-travel-segments"

import HeaderActionsCard from "@/components/common/HeaderActionsCard.vue"

import PurposeEditFormCard from "@/components/travel-authorizations/PurposeEditFormCard.vue"
import TripDetailsEstimatesEditForm from "@/components/travel-authorizations/TripDetailsEstimatesEditForm.vue"
import TripDetailsActualsEditForm from "@/components/travel-authorizations/TripDetailsActualsEditForm.vue"
import ApprovalsEditFormCard from "@/components/travel-authorizations/ApprovalsEditFormCard.vue"
import TravelAuthorizationActionLogsTable from "@/modules/travel-authorizations/components/TravelAuthorizationActionLogsTable.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

const travelSegmentsQuery = computed(() => ({
  where: {
    travelAuthorizationId: props.travelAuthorizationId,
    isActual: false,
  },
  perPage: 1, // we only need the first travel segment to check if travel has started
}))
const { travelSegments } = useTravelSegments(travelSegmentsQuery)
const isBeforeTravelStartDate = computed(() => {
  const firstTravelSegment = travelSegments.value[0]
  if (isNil(firstTravelSegment)) return true

  return new Date(firstTravelSegment.departureOn) > new Date()
})
const tripDetailsCardTitle = computed(() => {
  if (isBeforeTravelStartDate.value) {
    return "Trip Details (Estimated)"
  }

  return "Trip Details (Actual)"
})

function saveWrapper() {
  alert("TODO: implement save")
}
</script>
