<template>
  <div class="d-flex flex-column ga-4 my-4">
    <v-card>
      <v-card-title>Rental Car Requests</v-card-title>
      <TravelDeskRentalCarsDataTableServer
        :where="{ travelRequestId: travelDeskTravelRequestId }"
        route-query-suffix="ReviewRentalCars"
      />
    </v-card>
    <v-card>
      <v-card-title>Hotel Requests</v-card-title>
      <TravelDeskHotelsDataTableServer
        :where="{ travelRequestId: travelDeskTravelRequestId }"
        route-query-suffix="ReviewHotels"
      />
    </v-card>
    <v-card>
      <v-card-title>Other Transportation Requests</v-card-title>
      <TravelDeskOtherTransportationsDataTableServer
        :where="{ travelRequestId: travelDeskTravelRequestId }"
        route-query-suffix="ReviewOtherTransportations"
      />
    </v-card>
    <v-btn
      v-if="status === TravelDeskTravelRequestStatuses.BOOKED && !isNil(invoiceNumber)"
      @click="openBookedItinerary"
    >
      View Booked Itinerary
    </v-btn>
    <TravelDeskTravelRequestPrintItineraryDialog ref="itineraryDialog" />
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef } from "vue"
import { isNil } from "lodash"

import { TravelDeskTravelRequestStatuses } from "@/api/travel-desk-travel-requests-api"

import TravelDeskHotelsDataTableServer from "@/components/travel-desk-hotels/TravelDeskHotelsDataTableServer.vue"
import TravelDeskOtherTransportationsDataTableServer from "@/components/travel-desk-other-transportations/TravelDeskOtherTransportationsDataTableServer.vue"
import TravelDeskRentalCarsDataTableServer from "@/components/travel-desk-rental-cars/TravelDeskRentalCarsDataTableServer.vue"
import TravelDeskTravelRequestPrintItineraryDialog from "@/components/travel-desk-travel-requests/TravelDeskTravelRequestPrintItineraryDialog.vue"

const props = defineProps<{
  travelDeskTravelRequestId: number
  status: TravelDeskTravelRequestStatuses
  invoiceNumber: string | null
}>()

const itineraryDialog = useTemplateRef("itineraryDialog")

function openBookedItinerary() {
  if (isNil(props.invoiceNumber)) return

  itineraryDialog.value?.open(props.travelDeskTravelRequestId)
}
</script>
