<template>
  <v-card>
    <v-card-text>
      <div class="d-flex flex-wrap align-center ga-4">
        <h2 class="mb-0 mr-md-2">Travel&nbsp;Auth #{{ paddedTravelAuthorizationId }}</h2>
        <DescriptionElement
          label="Purpose"
          :vertical="mdAndUp"
        >
          <TravelPurposeChip
            v-show="travelPurposeId"
            :travel-purpose-id="travelPurposeId"
          />
        </DescriptionElement>
        <LocationDescriptionElement
          label="Final Destination"
          :location-id="finalDestinationLocationId"
          :vertical="mdAndUp"
        />
        <DescriptionElement
          label="Depart"
          :value="departureDate"
          :vertical="mdAndUp"
        />
        <DescriptionElement
          label="Return"
          :value="returnDate"
          :vertical="mdAndUp"
        />
        <div :class="['align-self-end', { 'w-100': !mdAndUp }]">
          <UserChip
            :loading="isLoading"
            :user-id="userId ?? currentUser.id"
          />
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, toRefs } from "vue"
import { useDisplay } from "vuetify"

import useCurrentUser from "@/use/use-current-user"
import useTravelAuthorizationSummary from "@/use/travel-authorizations/use-travel-authorization-summary"

import DescriptionElement from "@/components/common/DescriptionElement.vue"
import UserChip from "@/components/users/UserChip.vue"
import LocationDescriptionElement from "@/components/locations/LocationDescriptionElement.vue"
import TravelPurposeChip from "@/components/travel-purposes/TravelPurposeChip.vue"

const props = defineProps<{
  travelAuthorizationId: number
}>()

const { travelAuthorizationId } = toRefs(props)

const paddedTravelAuthorizationId = computed(() =>
  travelAuthorizationId.value.toString().padStart(4, "0")
)

const {
  travelPurposeId,
  finalDestinationLocationId,
  departureDate,
  returnDate,
  userId,
  isLoading,
  refresh,
  update,
} = useTravelAuthorizationSummary(travelAuthorizationId)

const { currentUser } = useCurrentUser<true>()

const { mdAndUp } = useDisplay()

defineExpose({
  refresh,
  update,
})
</script>
