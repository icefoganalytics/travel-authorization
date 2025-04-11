<template>
  <!-- TODO: deuglify this UI -->
  <div>
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <DescriptionElement
          label="1: From / To"
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
    <v-divider class="my-3" />
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <DescriptionElement
          label="2: From / To"
          vertical
        >
          <LocationChip :location-id="destinationStop.locationId" />
          -
          <LocationChip :location-id="originStop.locationId" />
        </DescriptionElement>
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <DescriptionElement
          label="Date / Time (24h)"
          :value="destinationStop.departureDate + ' at ' + destinationStop.departureTime"
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
          :value="destinationStop.transport"
          vertical
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <DescriptionElement
          label="Type of Accommodation"
          :value="destinationStop.accommodationType || 'N/A'"
          vertical
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed, toRefs } from "vue"

import useTravelAuthorization from "@/use/use-travel-authorization"

import LocationChip from "@/components/locations/LocationChip.vue"
import DescriptionElement from "@/components/common/DescriptionElement.vue"

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
