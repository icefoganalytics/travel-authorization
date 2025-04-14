<template>
  <HeaderActionsCard title="Purpose">
    <v-row>
      <v-col
        cols="12"
        md="3"
      >
        <DescriptionElement
          label="Purpose"
          vertical
        >
          <TravelPurposeChip :travel-purpose-id="travelAuthorization.purposeId" />
        </DescriptionElement>
      </v-col>
      <v-col
        cols="12"
        xl="9"
      >
        <DescriptionElement
          label="Name of meeting/conference, mission, trade fair or course"
          :value="travelAuthorization.eventName"
          vertical
        />
      </v-col>
      <v-col
        cols="12"
        md="3"
        xl="2"
      >
        <DescriptionElement
          label="In Territory?"
          :value="travelAuthorization.allTravelWithinTerritory ? 'Yes' : 'No'"
          vertical
        />
      </v-col>
      <v-col
        cols="12"
        md="9"
        lg="6"
        xl="4"
      >
        <LocationDescriptionElement
          label="Final Destination"
          :location-id="finalDestination.locationId"
          vertical
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col> </v-col>
    </v-row>
    <v-row>
      <v-col>
        <TextareaDescriptionElement
          label="Objectives"
          :value="travelAuthorization.benefits"
          vertical
        />
      </v-col>
    </v-row>
  </HeaderActionsCard>
</template>

<script setup>
import { computed, toRefs } from "vue"
import { last } from "lodash"

import useTravelAuthorization from "@/use/use-travel-authorization"

import DescriptionElement from "@/components/common/DescriptionElement.vue"
import HeaderActionsCard from "@/components/common/HeaderActionsCard.vue"
import TextareaDescriptionElement from "@/components/common/TextareaDescriptionElement.vue"
import LocationDescriptionElement from "@/components/locations/LocationDescriptionElement.vue"
import TravelPurposeChip from "@/components/travel-purposes/TravelPurposeChip.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

const { travelAuthorizationId } = toRefs(props)
const { travelAuthorization } = useTravelAuthorization(travelAuthorizationId)

const finalDestination = computed(() => {
  return (
    last(travelAuthorization.value.stops) || {
      travelAuthorizationId: travelAuthorizationId.value,
    }
  )
})
</script>
