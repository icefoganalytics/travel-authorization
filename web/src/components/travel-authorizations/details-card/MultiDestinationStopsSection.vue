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
          <LocationChip :location-id="firstStop.locationId" />
          -
          <LocationChip :location-id="secondStop.locationId" />
        </DescriptionElement>
      </v-col>
      <v-col
        cols="12"
        md="3"
      >
        <DescriptionElement
          label="Date / Time (24h)"
          :value="firstStop.departureDate + ' at ' + firstStop.departureTime"
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
          :value="firstStop.transport"
          vertical
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <DescriptionElement
          label="Type of Accommodation"
          :value="firstStop.accommodationType"
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
          <LocationChip :location-id="secondStop.locationId" />
          -
          <LocationChip :location-id="thirdStop.locationId" />
        </DescriptionElement>
      </v-col>
      <v-col
        cols="12"
        md="3"
      >
        <DescriptionElement
          label="Date / Time (24h)"
          :value="secondStop.departureDate + ' at ' + secondStop.departureTime"
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
          :value="secondStop.transport"
          vertical
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <DescriptionElement
          label="Type of Accommodation"
          :value="secondStop.accommodationType"
          vertical
        />
      </v-col>
    </v-row>

    <template v-if="stops.length > 3">
      <template v-for="(_, index) in stops.slice(0, -3)">
        <v-divider
          :key="`divider-${index}`"
          class="my-3"
        />
        <v-row :key="`row1-${index}`">
          <v-col
            cols="12"
            md="6"
          >
            <DescriptionElement
              :label="index + 3 + ': From / To'"
              vertical
            >
              <LocationChip :location-id="stops[index + 2].locationId" />
              -
              <LocationChip :location-id="stops[index + 3].locationId" />
            </DescriptionElement>
          </v-col>
          <v-col
            cols="12"
            md="3"
          >
            <DescriptionElement
              label="Date / Time (24h)"
              :value="stops[index + 2].departureDate + ' at ' + stops[index + 2].departureTime"
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
              :value="stops[index + 2].transport"
              vertical
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <DescriptionElement
              label="Type of Accommodation"
              :value="stops[index + 2].accommodationType || 'N/A'"
              vertical
            />
          </v-col>
        </v-row>
      </template>
    </template>
  </div>
</template>

<script setup>
import { toRefs, computed } from "vue"
import { first, nth } from "lodash"

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
const firstStop = computed(() => first(stops.value) || {})
const secondStop = computed(() => nth(stops.value, 1) || {})
const thirdStop = computed(() => nth(stops.value, 2) || {})
</script>
