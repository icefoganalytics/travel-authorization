<template>
  <HeaderActionsCard title="Details">
    <v-row>
      <v-col cols="12">
        <DescriptionElement label="Trip Type">
          <TravelAuthorizationTripTypeChip :value="travelAuthorization.tripType" />
        </DescriptionElement>
      </v-col>
    </v-row>

    <component
      :is="tripTypeComponent"
      v-if="tripTypeComponent"
      :travel-authorization-id="travelAuthorizationId"
      class="mt-3"
    />
    <div v-else>Trip type {{ travelAuthorization.tripType }} not implemented!</div>

    <v-row>
      <v-col
        cols="12"
        md="2"
      >
        <DescriptionElement
          :value="travelAuthorization.travelDuration"
          label="Travel Days"
          vertical
        />
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <DescriptionElement
          :value="travelAuthorization.daysOffTravelStatus || '0'"
          label="Days on non-travel status"
          vertical
        />
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <DescriptionElement
          :value="travelAuthorization.dateBackToWork"
          label="Expected Date return to work"
          vertical
        />
      </v-col>
    </v-row>
  </HeaderActionsCard>
</template>

<script setup>
import { computed, toRefs } from "vue"

import useTravelAuthorization, { TRIP_TYPES } from "@/use/use-travel-authorization"

import DescriptionElement from "@/components/common/DescriptionElement.vue"
import HeaderActionsCard from "@/components/common/HeaderActionsCard.vue"
import TravelAuthorizationTripTypeChip from "@/components/travel-authorizations/TravelAuthorizationTripTypeChip.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

const { travelAuthorizationId } = toRefs(props)
const { travelAuthorization } = useTravelAuthorization(travelAuthorizationId)

const tripTypeComponent = computed(() => {
  switch (travelAuthorization.value.tripType) {
    case TRIP_TYPES.ROUND_TRIP:
      return () =>
        import("@/components/travel-authorizations/details-card/RoundTripStopsSection.vue")
    case TRIP_TYPES.ONE_WAY:
      return () => import("@/components/travel-authorizations/details-card/OneWayStopsSection.vue")
    case TRIP_TYPES.MULTI_CITY:
      return () =>
        import("@/components/travel-authorizations/details-card/MultiDestinationStopsSection.vue")
    default:
      return null
  }
})
</script>
