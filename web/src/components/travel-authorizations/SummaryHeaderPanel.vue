<template>
  <v-card>
    <v-card-text>
      <v-row dense>
        <v-col
          cols="12"
          md="2"
          class="d-flex align-center"
        >
          <h2 class="mb-0">Travel</h2>
        </v-col>
        <v-col
          cols="12"
          md="2"
        >
          <DescriptionElement
            label="Purpose"
            :value="purposeText"
            :vertical="mdAndUp"
          />
        </v-col>
        <v-col
          cols="12"
          md="2"
        >
          <LocationDescriptionElement
            label="Final Destination"
            :location-id="finalDestination.locationId"
            :vertical="mdAndUp"
          />
        </v-col>
        <v-col
          cols="12"
          md="2"
        >
          <DescriptionElement
            label="Depart"
            :value="initialDestination.departureDate"
            :vertical="mdAndUp"
          />
        </v-col>
        <v-col
          cols="12"
          md="2"
        >
          <DescriptionElement
            label="Return"
            :value="finalDestinationDepartureDate"
            :vertical="mdAndUp"
          />
        </v-col>
        <v-col
          cols="12"
          md="2"
          class="d-flex align-center"
        >
          <UserChip :user-id="currentUser.id" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, toRefs } from "vue"

import { MAX_PER_PAGE } from "@/api/base-api"

import useVuetify2 from "@/use/utils/use-vuetify2"
import useTravelPurposes from "@/use/use-travel-purposes"
import useCurrentUser from "@/use/use-current-user"
import { useTravelAuthorization } from "@/use/use-travel-authorization"

import DescriptionElement from "@/components/common/DescriptionElement.vue"
import UserChip from "@/components/users/UserChip.vue"
import LocationDescriptionElement from "@/components/locations/LocationDescriptionElement.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

const { travelAuthorizationId } = toRefs(props)
const {
  travelAuthorization,
  stops,
  firstStop: initialDestination,
  lastStop: finalDestination,
  refresh,
} = useTravelAuthorization(travelAuthorizationId)

const { currentUser } = useCurrentUser()
const { mdAndUp } = useVuetify2()

const travelPurposesQuery = computed(() => {
  return {
    perPage: MAX_PER_PAGE,
  }
})
const { travelPurposes } = useTravelPurposes(travelPurposesQuery)

const purposeText = computed(() => {
  const purpose = travelPurposes.value.find((p) => p.id === travelAuthorization.value.purposeId)
  return purpose?.purpose || ""
})

const finalDestinationDepartureDate = computed(() => {
  if (travelAuthorization.value.multiStop) {
    return stops.value[stops.value.length - 2].departureDate
  }

  return finalDestination.value.departureDate
})

defineExpose({
  refresh,
})
</script>
