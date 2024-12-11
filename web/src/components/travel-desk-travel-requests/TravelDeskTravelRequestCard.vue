<template>
  <v-card>
    <v-card-title
      class="primary"
      style="border-bottom: 1px solid black"
    >
      <div class="text-h5">Travel Desk Request</div>
    </v-card-title>

    <v-card-text>
      <v-row>
        <v-col cols="12">
          <TravelerDetailsCard :travel-desk-travel-request-id="travelDeskTravelRequestId" />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <TitleCard large-title>
            <template #title>
              <div>Travel Information</div>
            </template>
            <template #body>
              <TravelDeskFlightRequestsCard
                class="borderless-card"
                :travel-desk-travel-request-id="travelDeskTravelRequestId"
              />
              <TravelDeskRentalCarsTable
                :travel-desk-travel-request-id="travelDeskTravelRequestId"
              />
              <TravelDeskHotelsTable :travel-desk-travel-request-id="travelDeskTravelRequestId" />
              <TravelDeskOtherTransportationsTable
                :travel-desk-travel-request-id="travelDeskTravelRequestId"
              />
            </template>
          </TitleCard>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import TitleCard from "@/modules/travelDesk/views/Common/TitleCard.vue"

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
