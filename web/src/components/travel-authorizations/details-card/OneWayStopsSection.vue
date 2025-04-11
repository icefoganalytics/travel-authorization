<template>
  <!-- TODO: deuglify this UI -->
  <div>
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <DescriptionElement
          label="From / To"
          vertical
        >
          <LocationChip :location-id="originStop.locationId" />
          -
          <LocationChip :location-id="destinationStop.locationId" />
        </DescriptionElement>
      </v-col>
      <v-col
        cols="12"
        md="3"
      >
        <DescriptionElement
          label="Date / Time (24h)"
          :value="originStop.departureDate + ' at ' + originStop.departureTime"
          vertical
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        md="3"
      >
        <DescriptionElement
          label="Travel Method"
          :value="originStop.transport"
          vertical
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <DescriptionElement
          label="Type of Accommodation"
          :value="originStop.accommodationType"
          vertical
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed, toRefs } from "vue"

import useTravelAuthorization from "@/use/use-travel-authorization"

import DescriptionElement from "@/components/common/DescriptionElement.vue"
import LocationChip from "@/components/locations/LocationChip.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

const { travelAuthorizationId } = toRefs(props)
const { travelAuthorization } = useTravelAuthorization(travelAuthorizationId)

const originStop = computed(() => travelAuthorization.value.stops[0] || {})
const destinationStop = computed(() => travelAuthorization.value.stops[1] || {})
</script>
