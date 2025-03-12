<template>
  <v-card>
    <v-card-title>
      <h2 class="text-h5">Travel Desk Request</h2>
    </v-card-title>

    <v-card-text>
      <v-row>
        <v-col cols="12">
          <TravelerDetailsCard :travel-desk-travel-request-id="travelDeskTravelRequestId" />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-card>
            <v-card-title>
              <h3>Travel Information</h3>
            </v-card-title>
            <v-divider />
            <v-card-text class="px-0 px-md-4">
              <TravelDeskFlightRequestsCard
                class="borderless-card"
                :travel-desk-travel-request-id="travelDeskTravelRequestId"
              />
              <TravelDeskRentalCarsTable
                class="borderless-card"
                :travel-desk-travel-request-id="travelDeskTravelRequestId"
              />
              <TravelDeskHotelsTable
                class="borderless-card"
                :travel-desk-travel-request-id="travelDeskTravelRequestId"
              />
              <TravelDeskOtherTransportationsTable
                class="borderless-card"
                :travel-desk-travel-request-id="travelDeskTravelRequestId"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import TravelDeskFlightRequestsCard from "@/components/travel-desk-flight-requests/TravelDeskFlightRequestsCard.vue"
import TravelDeskHotelsTable from "@/components/travel-desk-hotels/TravelDeskHotelsTable.vue"
import TravelDeskOtherTransportationsTable from "@/components/travel-desk-other-transportations/TravelDeskOtherTransportationsTable.vue"
import TravelDeskRentalCarsTable from "@/components/travel-desk-rental-cars/TravelDeskRentalCarsTable.vue"
import TravelerDetailsCard from "@/components/travel-desk-travel-requests/TravelerDetailsCard.vue"

defineProps({
  travelDeskTravelRequestId: {
    type: Number,
    required: true,
  },
})
</script>

<style scoped></style>

<style scoped>
.v-card.borderless-card {
  border: none !important;
  box-shadow: none !important;
}
</style>
