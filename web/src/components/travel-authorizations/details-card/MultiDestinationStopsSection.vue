<template>
  <!-- TODO: deuglify this UI -->
  <div>
    <template v-for="(_, index) in stops.slice(0, -1)">
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
            <LocationChip :location-id="stops[index].locationId" />
            -
            <LocationChip :location-id="stops[index + 1].locationId" />
          </DescriptionElement>
        </v-col>
        <v-col
          cols="12"
          md="3"
        >
          <DescriptionElement
            label="Date / Time (24h)"
            :value="stops[index].departureDate + ' at ' + stops[index].departureTime"
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
            :value="stops[index].transport"
            vertical
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <DescriptionElement
            label="Type of Accommodation"
            :value="stops[index].accommodationType || 'N/A'"
            vertical
          />
        </v-col>
      </v-row>
    </template>
  </div>
</template>

<script setup>
import { toRefs, computed } from "vue"

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

const stops = computed(() => travelAuthorization.value.stops || [])
</script>
