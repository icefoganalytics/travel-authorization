<template>
  <v-container>
    <v-skeleton-loader
      v-if="isNil(travelDeskTravelRequest)"
      type="card"
    />
    <v-card v-else>
      <v-card-title class="d-flex justify-space-between align-baseline">
        <h2>Travel Desk Request</h2>
        <v-btn
          v-if="travelDeskTravelRequest.status !== TRAVEL_DESK_TRAVEL_REQUEST_STATUSES.BOOKED"
          :to="{
            name: 'TravelDeskEditPage',
            params: {
              travelDeskTravelRequestId,
            },
          }"
          color="primary"
          class="my-0"
        >
          <v-icon left> mdi-pencil </v-icon>
          Edit
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col>
            <TravelerDetailsCard :travel-desk-travel-request-id="travelDeskTravelRequest.id" />
          </v-col>
        </v-row>
        <v-row>
          <v-col
            cols="12"
            md="6"
          >
            <TravelDeskTravelAgencySelect
              v-model="travelDeskTravelRequest.travelAgencyId"
              label="Assign Agency"
              append-icon="mdi-lock"
              placeholder="None"
              outlined
              persistent-placeholder
              readonly
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <UserTravelDeskAgentSelect
              v-model="travelDeskTravelRequest.travelDeskOfficer"
              label="Travel Desk Agent Assigned"
              append-icon="mdi-lock"
              readonly
              outlined
            />
          </v-col>
        </v-row>
        <v-row v-if="travelDeskTravelRequest.invoiceNumber">
          <v-col>
            <TravelDeskInvoiceCard :travel-desk-travel-request-id="travelDeskTravelRequest.id" />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <TravelDeskQuestionsCard :travel-desk-travel-request-id="travelDeskTravelRequest.id" />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-card>
              <v-card-title>
                <h3>Travel Information</h3>
              </v-card-title>
              <v-divider />
              <v-card-text>
                <TravelDeskFlightRequestsCard
                  :travel-desk-travel-request-id="travelDeskTravelRequestId"
                  class="borderless-card"
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

      <v-card-actions>
        <v-spacer />
        <v-btn
          :to="{
            name: 'TravelDeskPage',
          }"
          color="primary"
          class="mr-2"
          outlined
        >
          <div>Back</div>
        </v-btn>
        <ItineraryModal
          v-if="travelDeskTravelRequest.invoiceNumber"
          class="ml-auto mr-3"
          :invoice-number="travelDeskTravelRequest.invoiceNumber"
        />
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup>
import { toRefs } from "vue"
import { isNil } from "lodash"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useTravelDeskTravelRequest, {
  TRAVEL_DESK_TRAVEL_REQUEST_STATUSES,
} from "@/use/use-travel-desk-travel-request"

import TravelerDetailsCard from "@/components/travel-desk-travel-requests/TravelerDetailsCard.vue"

import ItineraryModal from "@/modules/travelDesk/views/Requests/Components/ItineraryModal.vue"

import UserTravelDeskAgentSelect from "@/components/users/UserTravelDeskAgentSelect.vue"
import TravelDeskFlightRequestsCard from "@/components/travel-desk-flight-requests/TravelDeskFlightRequestsCard.vue"
import TravelDeskRentalCarsTable from "@/components/travel-desk-rental-cars/TravelDeskRentalCarsTable.vue"
import TravelDeskHotelsTable from "@/components/travel-desk-hotels/TravelDeskHotelsTable.vue"
import TravelDeskInvoiceCard from "@/components/travel-desk-travel-requests/TravelDeskInvoiceCard.vue"
import TravelDeskOtherTransportationsTable from "@/components/travel-desk-other-transportations/TravelDeskOtherTransportationsTable.vue"
import TravelDeskQuestionsCard from "@/components/travel-desk-questions/TravelDeskQuestionsCard.vue"
import TravelDeskTravelAgencySelect from "@/components/travel-desk-travel-agencies/TravelDeskTravelAgencySelect.vue"

const props = defineProps({
  travelDeskTravelRequestId: {
    type: [Number, String],
    required: true,
  },
})

const { travelDeskTravelRequestId } = toRefs(props)
const { travelDeskTravelRequest } = useTravelDeskTravelRequest(travelDeskTravelRequestId)

useBreadcrumbs([
  {
    text: "Travel Desk",
    to: {
      name: "TravelDeskPage",
    },
  },
  {
    text: "Request",
    to: {
      name: "TravelDeskReadPage",
      params: { travelDeskTravelRequestId: props.travelDeskTravelRequestId },
    },
  },
])
</script>

<style scoped>
.v-card.borderless-card {
  border: none !important;
  box-shadow: none !important;
}
</style>
