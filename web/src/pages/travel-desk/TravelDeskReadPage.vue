<template>
  <v-container class="px-0 px-md-4">
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
            name: 'travel-desk/TravelDeskEditPage',
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
        <v-row v-if="hasInvoiceNumber">
          <v-col>
            <TravelDeskInvoiceCard :travel-desk-travel-request-id="travelDeskTravelRequest.id" />
          </v-col>
        </v-row>

        <!-- Removed for now see https://github.com/icefoganalytics/travel-authorization/issues/248#issuecomment-2787649358 -->
        <v-row v-if="false">
          <v-col>
            <TravelDeskQuestionsCard
              :travel-desk-travel-request-id="travelDeskTravelRequestIdAsNumber"
            />
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
                  :travel-desk-travel-request-id="travelDeskTravelRequestIdAsNumber"
                  class="borderless-card"
                />
                <TravelDeskRentalCarsCard
                  class="borderless-card"
                  :travel-desk-travel-request-id="travelDeskTravelRequestIdAsNumber"
                />
                <TravelDeskHotelsCard
                  class="borderless-card"
                  :travel-desk-travel-request-id="travelDeskTravelRequestIdAsNumber"
                />
                <TravelDeskOtherTransportationsTable
                  class="borderless-card"
                  :travel-desk-travel-request-id="travelDeskTravelRequestIdAsNumber"
                />
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions>
        <v-btn
          v-if="hasInvoiceNumber"
          color="primary"
          @click="openPrintItineraryDialog"
          >View Itinerary</v-btn
        >
        <v-btn
          :to="{
            name: 'TravelDeskPage',
          }"
          :class="{ 'ml-2': hasInvoiceNumber }"
          outlined
        >
          Back
        </v-btn>
      </v-card-actions>

      <TravelDeskTravelRequestPrintItineraryDialog
        ref="travelDeskTravelRequestPrintItineraryDialog"
      />
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { isNil } from "lodash"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useTravelDeskTravelRequest, {
  TRAVEL_DESK_TRAVEL_REQUEST_STATUSES,
} from "@/use/use-travel-desk-travel-request"

import UserTravelDeskAgentSelect from "@/components/users/UserTravelDeskAgentSelect.vue"

import TravelDeskFlightRequestsCard from "@/components/travel-desk-flight-requests/TravelDeskFlightRequestsCard.vue"
import TravelDeskHotelsCard from "@/components/travel-desk-hotels/TravelDeskHotelsCard.vue"
import TravelDeskOtherTransportationsTable from "@/components/travel-desk-other-transportations/TravelDeskOtherTransportationsTable.vue"
import TravelDeskQuestionsCard from "@/components/travel-desk-questions/TravelDeskQuestionsCard.vue"
import TravelDeskRentalCarsCard from "@/components/travel-desk-rental-cars/TravelDeskRentalCarsCard.vue"
import TravelDeskTravelAgencySelect from "@/components/travel-desk-travel-agencies/TravelDeskTravelAgencySelect.vue"

import TravelDeskInvoiceCard from "@/components/travel-desk-travel-requests/TravelDeskInvoiceCard.vue"
import TravelDeskTravelRequestPrintItineraryDialog from "@/components/travel-desk-travel-requests/TravelDeskTravelRequestPrintItineraryDialog.vue"
import TravelerDetailsCard from "@/components/travel-desk-travel-requests/TravelerDetailsCard.vue"

const props = defineProps<{
  travelDeskTravelRequestId: string
}>()

const travelDeskTravelRequestIdAsNumber = computed(() => parseInt(props.travelDeskTravelRequestId))
const { travelDeskTravelRequest } = useTravelDeskTravelRequest(travelDeskTravelRequestIdAsNumber)

const hasInvoiceNumber = computed(() => !isNil(travelDeskTravelRequest.value?.invoiceNumber))

const travelDeskTravelRequestPrintItineraryDialog = ref<InstanceType<
  typeof TravelDeskTravelRequestPrintItineraryDialog
> | null>(null)

function openPrintItineraryDialog() {
  travelDeskTravelRequestPrintItineraryDialog.value?.open(travelDeskTravelRequestIdAsNumber.value)
}

const breadcrumbs = computed(() => [
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
      params: {
        travelDeskTravelRequestId: props.travelDeskTravelRequestId,
      },
    },
  },
])
useBreadcrumbs(breadcrumbs)
</script>

<style scoped>
.v-card.borderless-card {
  border: none !important;
  box-shadow: none !important;
}
</style>
