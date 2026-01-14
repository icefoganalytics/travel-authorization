<template>
  <v-skeleton-loader
    v-if="isNil(travelDeskTravelRequest) || isNil(travelAuthorizationId)"
    type="card"
  />
  <v-card v-else>
    <v-card-title>
      <h4 class="text-h6">Travel Information</h4>
    </v-card-title>
    <v-card-text>
      <TravelDeskFlightRequestsEditCard
        :travel-desk-travel-request-id="travelDeskTravelRequestId"
        :travel-authorization-id="travelAuthorizationId"
        @updated="refreshTablesUsingFlightInfo"
      />
      <TravelDeskRentalCarsEditCard
        ref="travelDeskRentalCarsEditCard"
        class="mt-6"
        :travel-desk-travel-request-id="travelDeskTravelRequestId"
      />
      <TravelDeskHotelsEditCard
        ref="travelDeskHotelEditCard"
        class="mt-6"
        :travel-desk-travel-request-id="travelDeskTravelRequestId"
        :travel-authorization-id="travelAuthorizationId"
      />
      <TravelDeskOtherTransportationsEditTable
        :travel-desk-travel-request-id="travelDeskTravelRequestId"
        :travel-authorization-id="travelAuthorizationId"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref, toRefs } from "vue"
import { isNil } from "lodash"

import useTravelDeskTravelRequest from "@/use/use-travel-desk-travel-request"

import TravelDeskFlightRequestsEditCard from "@/components/travel-desk-flight-requests/TravelDeskFlightRequestsEditCard.vue"
import TravelDeskHotelsEditCard from "@/components/travel-desk-hotels/TravelDeskHotelsEditCard.vue"
import TravelDeskOtherTransportationsEditTable from "@/components/travel-desk-other-transportations/TravelDeskOtherTransportationsEditTable.vue"
import TravelDeskRentalCarsEditCard from "@/components/travel-desk-rental-cars/TravelDeskRentalCarsEditCard.vue"

const props = defineProps<{
  travelDeskTravelRequestId: number
}>()

const { travelDeskTravelRequestId } = toRefs(props)
const { travelDeskTravelRequest } = useTravelDeskTravelRequest(travelDeskTravelRequestId)

const travelAuthorizationId = computed(() => travelDeskTravelRequest.value?.travelAuthorizationId)

const travelDeskRentalCarsEditCard = ref<InstanceType<typeof TravelDeskRentalCarsEditCard> | null>(
  null
)
const travelDeskHotelEditCard = ref<InstanceType<typeof TravelDeskHotelsEditCard> | null>(null)

function refreshTablesUsingFlightInfo() {
  travelDeskRentalCarsEditCard.value?.refresh()
  travelDeskHotelEditCard.value?.refresh()
}
</script>

<style scoped></style>

<style scoped>
.v-card.borderless-card {
  border: none !important;
  box-shadow: none !important;
}
</style>
