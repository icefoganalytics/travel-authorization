<template>
  <v-skeleton-loader
    v-if="isLoading"
    type="card"
  />
  <v-card v-else>
    <v-card-text>
      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <v-text-field
            label="Preference"
            :value="flightPreferenceOrderText"
            :hint="
              flightOption.flightPreferenceOrder === DOES_NOT_WORK
                ? 'Please see the Additional Information.'
                : ''
            "
            persistent-hint
            outlined
            readonly
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <v-text-field
            label="Cost"
            :value="formatCurrency(flightOption.cost)"
            outlined
            readonly
          />
        </v-col>
      </v-row>
      <v-row class="mb-4">
        <v-col
          cols="12"
          class="d-flex flex-wrap justify-center gap-4"
        >
          <TravelDeskFlightSegmentCard
            v-for="(flightSegment, index) in travelDeskFlightSegments"
            :key="`segment-${flightSegment.id}-${index}`"
            :travel-desk-flight-segment-id="flightSegment.id"
            max-width="600px"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from "vue"

import formatCurrency from "@/utils/format-currency"
import { DOES_NOT_WORK } from "@/api/travel-desk-flight-options-api"
import useTravelDeskFlightSegments from "@/use/use-travel-desk-flight-segments"

import TravelDeskFlightSegmentCard from "@/components/travel-desk-flight-segments/TravelDeskFlightSegmentCard.vue"

const props = defineProps({
  flightOption: {
    type: Object,
    required: true,
  },
  numberOfFlightOptions: {
    type: Number,
    required: true,
  },
})

const travelDeskFlightSegmentsQuery = computed(() => ({
  where: {
    flightOptionId: props.flightOption.id,
  },
}))
const { travelDeskFlightSegments, isLoading } = useTravelDeskFlightSegments(
  travelDeskFlightSegmentsQuery
)

const flightPreferenceOrderText = computed(() => {
  return props.flightOption.flightPreferenceOrder === DOES_NOT_WORK
    ? "Does Not Work"
    : props.flightOption.flightPreferenceOrder
})
</script>

<style scoped>
.gap-4 {
  gap: 1rem; /* 16px */
}
</style>
