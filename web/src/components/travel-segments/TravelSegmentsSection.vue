<template>
  <!-- TODO: deuglify this UI -->
  <div>
    <template v-for="(_, index) in travelSegments">
      <v-divider
        v-if="index > 0"
        :key="`divider-${index}`"
        class="my-3"
      />
      <v-row :key="`row1-${index}`">
        <v-col
          cols="12"
          md="6"
        >
          <DescriptionElement
            :label="`${index + 1}: From / To`"
            vertical
          >
            <LocationChip :location-id="travelSegments[index].departureLocationId" />
            -
            <LocationChip :location-id="travelSegments[index].arrivalLocationId" />
          </DescriptionElement>
        </v-col>
        <v-col
          cols="12"
          md="3"
        >
          <DescriptionElement
            label="Date / Time (24h)"
            :value="
              travelSegments[index].departureOn + ' at ' + travelSegments[index].departureTime
            "
            vertical
          />
        </v-col>
      </v-row>
      <v-row :key="`row2-${index}`">
        <v-col
          cols="12"
          md="3"
        >
          <DescriptionElement
            label="Travel Method"
            :value="buildModeOfTransport(travelSegments[index])"
            vertical
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <DescriptionElement
            label="Type of Accommodation"
            :value="buildAccommodationType(travelSegments[index], 'N/A')"
            vertical
          />
        </v-col>
      </v-row>
    </template>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { isNil } from "lodash"

import useTravelSegments, { ACCOMMODATION_TYPES, TRAVEL_METHODS } from "@/use/use-travel-segments"

import LocationChip from "@/components/locations/LocationChip.vue"
import DescriptionElement from "@/components/common/DescriptionElement.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
  isActual: {
    type: Boolean,
    default: false,
  },
})

const travelSegmentsQuery = computed(() => {
  return {
    where: {
      travelAuthorizationId: props.travelAuthorizationId,
      isActual: props.isActual,
    },
  }
})
const { travelSegments } = useTravelSegments(travelSegmentsQuery)

function buildModeOfTransport(travelSegment) {
  const { modeOfTransport, modeOfTransportOther } = travelSegment

  if (modeOfTransport !== TRAVEL_METHODS.OTHER) {
    return modeOfTransport
  }

  return `Other: ${modeOfTransportOther}`
}

function buildAccommodationType(travelSegment, defaultValue) {
  const { accommodationType, accommodationTypeOther } = travelSegment
  if (isNil(accommodationType)) {
    return defaultValue
  }

  if (accommodationType !== ACCOMMODATION_TYPES.OTHER) {
    return accommodationType
  }

  return `Other: ${accommodationTypeOther}`
}
</script>
