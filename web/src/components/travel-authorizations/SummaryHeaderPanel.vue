<template>
  <v-card>
    <v-card-title>
      <h2 class="d-flex flex-column flex-md-row justify-space-between text-h5 mb-2">
        <span>Trip Summary</span>
        <span class="text-body-1 font-weight-bold"
          >Travel Auth #{{ paddedTravelAuthorizationId }}</span
        >
      </h2>
    </v-card-title>
    <v-card-text>
      <v-row>
        <v-col
          cols="12"
          md="6"
          lg="3"
        >
          <div class="text-caption font-weight-bold text-grey-darken-1 text-uppercase mb-1">
            Traveler
          </div>
          <div class="font-weight-bold">
            <UserChip
              class="ml-n2"
              :loading="isLoading"
              :user-id="userId ?? currentUser.id"
              variant="text"
            />
          </div>
        </v-col>
        <v-col
          cols="12"
          md="6"
          lg="3"
        >
          <div class="text-caption font-weight-bold text-grey-darken-1 text-uppercase mb-1">
            Destination
          </div>
          <div class="font-weight-bold">{{ destinationText }}</div>
        </v-col>
        <v-col
          cols="12"
          md="6"
          lg="3"
        >
          <div class="text-caption font-weight-bold text-grey-darken-1 text-uppercase mb-1">
            Dates
          </div>
          <div class="font-weight-bold">{{ datesText }}</div>
        </v-col>
        <v-col
          cols="12"
          class="ga-2"
        >
          <div class="text-caption font-weight-bold text-grey-darken-1 text-uppercase">
            Purpose of Travel
          </div>
          <div class="d-flex flex-wrap align-center ga-1">
            <span class="font-weight-bold">{{ eventName }}</span>
            <span>
              (<TravelPurposeChip
                class="font-weight-bold mx-0 px-0"
                :travel-purpose-id="travelPurposeId"
                variant="text"
              />)
            </span>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, toRefs } from "vue"
import { isNil } from "lodash"

import useCurrentUser from "@/use/use-current-user"
import useLocation from "@/use/use-location"
import useTravelAuthorizationSummary from "@/use/travel-authorizations/use-travel-authorization-summary"

import UserChip from "@/components/users/UserChip.vue"
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
  eventName,
  finalDestinationLocationId,
  departureDate,
  returnDate,
  userId,
  isLoading,
  refresh,
  update,
} = useTravelAuthorizationSummary(travelAuthorizationId)

const { location } = useLocation(finalDestinationLocationId)

const destinationText = computed(() => {
  if (isNil(location.value)) return "—"

  return `${location.value.city} (${location.value.province})`
})

const datesText = computed(() => {
  if (departureDate.value && returnDate.value) {
    return `${departureDate.value} – ${returnDate.value}`
  }

  return departureDate.value ?? returnDate.value ?? "—"
})

const { currentUser } = useCurrentUser<true>()

defineExpose({
  refresh,
  update,
})
</script>
