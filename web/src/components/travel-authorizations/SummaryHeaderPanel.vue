<template>
  <v-card>
    <v-card-text>
      <v-row dense>
        <v-col
          class="d-flex align-center justify-center justify-md-start"
          :cols="mdAndUp ? undefined : 12"
        >
          <h2 class="mb-0">Travel</h2>
        </v-col>
        <v-col :cols="mdAndUp ? undefined : 12">
          <DescriptionElement
            label="Purpose"
            :vertical="mdAndUp"
          >
            <TravelPurposeChip :travel-purpose-id="travelAuthorization.purposeId" />
          </DescriptionElement>
        </v-col>
        <v-col :cols="mdAndUp ? undefined : 12">
          <LocationDescriptionElement
            label="Final Destination"
            :location-id="finalDestination.locationId"
            :vertical="mdAndUp"
          />
        </v-col>
        <v-col :cols="mdAndUp ? undefined : 12">
          <DescriptionElement
            label="Depart"
            :value="initialDestination.departureDate"
            :vertical="mdAndUp"
          />
        </v-col>
        <v-col :cols="mdAndUp ? undefined : 12">
          <DescriptionElement
            label="Return"
            :value="finalDestinationDepartureDate"
            :vertical="mdAndUp"
          />
        </v-col>
        <v-col
          class="d-flex align-center justify-center justify-md-start"
          :cols="mdAndUp ? undefined : 12"
        >
          <UserChip :user-id="currentUser.id" />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, toRefs } from "vue"

import useVuetify2 from "@/use/utils/use-vuetify2"
import useCurrentUser from "@/use/use-current-user"
import { useTravelAuthorization } from "@/use/use-travel-authorization"

import DescriptionElement from "@/components/common/DescriptionElement.vue"
import UserChip from "@/components/users/UserChip.vue"
import LocationDescriptionElement from "@/components/locations/LocationDescriptionElement.vue"
import TravelPurposeChip from "@/components/travel-purposes/TravelPurposeChip.vue"

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
