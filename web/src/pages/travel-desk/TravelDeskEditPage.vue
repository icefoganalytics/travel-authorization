<template>
  <v-container class="mx-0 mx-md-auto px-0 px-md-4">
    <v-skeleton-loader
      v-if="isNil(travelDeskTravelRequest)"
      type="card"
    />
    <v-card
      v-else
      class="card--outlined"
    >
      <v-card-title>
        <h2>Travel Desk Request</h2>
      </v-card-title>
      <v-card-text class="px-0 px-md-4">
        <v-row>
          <v-col>
            <TravelerDetailsFormCard v-model="travelDeskTravelRequest" />
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
              placeholder="None"
              clearable
              outlined
              persistent-placeholder
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <UserTravelDeskAgentSelect
              v-model="travelDeskTravelRequest.travelDeskOfficer"
              label="Travel Desk Agent Assigned"
              outlined
            />
          </v-col>
        </v-row>
        <div class="d-flex justify-center justify-md-end">
          <v-btn
            color="primary"
            outlined
            :loading="isLoading"
            :block="$vuetify.breakpoint.smAndDown"
            @click="saveTravelDeskTravelRequest"
            >Save Draft
          </v-btn>
        </div>
        <v-divider class="mb-7" />
        <v-row v-if="hasInvoiceNumber">
          <v-col>
            <TravelDeskInvoiceCard :travel-desk-travel-request-id="travelDeskTravelRequest.id" />
          </v-col>
        </v-row>

        <!-- Removed for now see https://github.com/icefoganalytics/travel-authorization/issues/248#issuecomment-2787649358 -->
        <v-row v-if="false">
          <v-col>
            <TravelDeskQuestionsManageCard
              :travel-desk-travel-request-id="travelDeskTravelRequest.id"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <v-card
              class="mt-10 card--outlined"
              large-title
            >
              <v-card-title>
                <h3>Travel Information</h3>
              </v-card-title>
              <v-card-text class="px-0 px-md-4">
                <TravelDeskFlightRequestsManageCard
                  :travel-desk-travel-request-id="travelDeskTravelRequest.id"
                  :travel-authorization-id="travelDeskTravelRequest.travelAuthorizationId"
                  show-flight-options
                />
                <RentalCarRequestTable
                  :flight-requests="travelDeskTravelRequest.flightRequests"
                  :rental-cars="travelDeskTravelRequest.rentalCars"
                />
                <HotelRequestTable
                  :flight-requests="travelDeskTravelRequest.flightRequests"
                  :hotels="travelDeskTravelRequest.hotels"
                />
                <TransportationRequestTable
                  :other-transportations="travelDeskTravelRequest.otherTransportations"
                />
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="d-flex flex-column flex-md-row">
        <v-btn
          :to="{
            name: 'TravelDeskPage',
          }"
          color="grey darken-5"
          class="px-5"
          :block="$vuetify.breakpoint.smAndDown"
        >
          <div>Back</div>
        </v-btn>
        <ItineraryModal
          v-if="hasInvoiceNumber"
          class="ml-auto mr-3"
          :invoice-number="hasInvoiceNumber"
        />
        <UploadPnrModal
          :travel-request="travelDeskTravelRequest"
          :class="hasInvoiceNumber ? 'ml-1 mr-2' : 'ml-auto mr-2'"
          @saveData="saveNewTravelRequest('save')"
          @close="refresh"
        />

        <v-btn
          v-if="isDraftState"
          class="mr-2 px-5"
          color="primary"
          :loading="isLoading"
          :block="$vuetify.breakpoint.smAndDown"
          @click="markTravelRequestAsSubmittedAndReturnToTravelDesk"
        >
          Submit for Traveler
        </v-btn>
        <v-btn
          v-else-if="isSubmittedState"
          class="mr-2 px-5"
          color="primary"
          :loading="isLoading"
          :block="$vuetify.breakpoint.smAndDown"
          @click="markTravelRequestAsOptionsProvidedAndReturnToTravelDesk"
        >
          Send to Traveler
        </v-btn>
        <v-tooltip
          v-else-if="isOptionsProvidedState"
          top
        >
          <template #activator="{ on }">
            <span
              class="align-self-stretch align-self-md-auto"
              v-on="on"
            >
              <v-btn
                class="mx-md-3"
                :loading="isLoading"
                disabled
                :block="$vuetify.breakpoint.smAndDown"
              >
                Booking Complete (?)
              </v-btn>
            </span>
          </template>
          <span>Waiting for traveler to rank flight options, before booking can be finalized.</span>
        </v-tooltip>
        <v-tooltip
          v-else-if="isOptionsRankedState && !hasInvoiceNumber"
          top
        >
          <template #activator="{ on }">
            <span
              class="align-self-stretch align-self-md-auto"
              v-on="on"
            >
              <v-btn
                class="mx-md-3"
                :loading="isLoading"
                disabled
                :block="$vuetify.breakpoint.smAndDown"
              >
                Booking Complete (?)
              </v-btn>
            </span>
          </template>
          <span>Invoice number required. Upload PNR.</span>
        </v-tooltip>
        <v-btn
          v-else-if="isOptionsRankedState && hasInvoiceNumber"
          class="mx-md-3"
          color="primary"
          :loading="isLoading"
          :block="$vuetify.breakpoint.smAndDown"
          @click="openConfirmBookingDialog"
        >
          Booking Complete
        </v-btn>
        <template v-else-if="isBookedState || isCompleteState">
          <!-- No op: travel request is complete -->
        </template>
        <v-alert
          v-else
          type="warning"
        >
          Unhandled state: {{ travelDeskTravelRequest.status }}
        </v-alert>
      </v-card-actions>

      <TravelDeskTravelRequestConfirmBookingDialog
        ref="confirmBookingDialog"
        @booked="returnToTravelDesk"
      />
    </v-card>
  </v-container>
</template>

<script setup>
import { computed, nextTick, ref, toRefs } from "vue"
import { useRouter } from "vue2-helpers/vue-router"
import { cloneDeep, isNil } from "lodash"

import { TRAVEL_DESK_URL } from "@/urls"
import { useSnack } from "@/plugins/snack-plugin"
import http from "@/api/http-client"
import travelDeskTravelRequestsApi, {
  TRAVEL_DESK_TRAVEL_REQUEST_STATUSES,
} from "@/api/travel-desk-travel-requests-api"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useCurrentUser from "@/use/use-current-user"
import useTravelDeskTravelRequest from "@/use/use-travel-desk-travel-request"

import TravelerDetailsFormCard from "@/components/travel-desk-travel-requests/TravelerDetailsFormCard.vue"
import RentalCarRequestTable from "@/modules/travelDesk/views/Requests/RequestDialogs/RentalCarRequestTable.vue"
import HotelRequestTable from "@/modules/travelDesk/views/Requests/RequestDialogs/HotelRequestTable.vue"
import TransportationRequestTable from "@/modules/travelDesk/views/Requests/RequestDialogs/TransportationRequestTable.vue"

import UploadPnrModal from "@/modules/travelDesk/views/Desk/PnrDocument/UploadPnrModal.vue"
import ItineraryModal from "@/modules/travelDesk/views/Requests/Components/ItineraryModal.vue"

import UserTravelDeskAgentSelect from "@/components/users/UserTravelDeskAgentSelect.vue"
import TravelDeskTravelAgencySelect from "@/components/travel-desk-travel-agencies/TravelDeskTravelAgencySelect.vue"
import TravelDeskTravelRequestConfirmBookingDialog from "@/components/travel-desk-travel-requests/TravelDeskTravelRequestConfirmBookingDialog.vue"
import TravelDeskQuestionsManageCard from "@/components/travel-desk-questions/TravelDeskQuestionsManageCard.vue"
import TravelDeskInvoiceCard from "@/components/travel-desk-travel-requests/TravelDeskInvoiceCard.vue"
import TravelDeskFlightRequestsManageCard from "@/components/travel-desk-flight-requests/TravelDeskFlightRequestsManageCard.vue"

const props = defineProps({
  travelDeskTravelRequestId: {
    type: [Number, String],
    required: true,
  },
})

const { currentUser } = useCurrentUser()

const { travelDeskTravelRequestId } = toRefs(props)
const {
  travelDeskTravelRequest,
  isLoading,
  refresh: refreshTravelDeskTravelRequest,
  save: saveTravelDeskTravelRequest,
} = useTravelDeskTravelRequest(travelDeskTravelRequestId)

const isDraftState = computed(
  () => travelDeskTravelRequest.value?.status === TRAVEL_DESK_TRAVEL_REQUEST_STATUSES.DRAFT
)
const isSubmittedState = computed(
  () => travelDeskTravelRequest.value?.status === TRAVEL_DESK_TRAVEL_REQUEST_STATUSES.SUBMITTED
)
const isOptionsProvidedState = computed(
  () =>
    travelDeskTravelRequest.value?.status === TRAVEL_DESK_TRAVEL_REQUEST_STATUSES.OPTIONS_PROVIDED
)
const isOptionsRankedState = computed(
  () => travelDeskTravelRequest.value?.status === TRAVEL_DESK_TRAVEL_REQUEST_STATUSES.OPTIONS_RANKED
)
const isBookedState = computed(
  () => travelDeskTravelRequest.value?.status === TRAVEL_DESK_TRAVEL_REQUEST_STATUSES.BOOKED
)
const isCompleteState = computed(
  () => travelDeskTravelRequest.value?.status === TRAVEL_DESK_TRAVEL_REQUEST_STATUSES.COMPLETE
)
const hasInvoiceNumber = computed(
  () => !isNil(travelDeskTravelRequest.value?.travelDeskPassengerNameRecordDocument?.invoiceNumber)
)

const savingData = ref(false)

async function refresh() {
  await refreshTravelDeskTravelRequest()
  await nextTick()
  if (isNil(travelDeskTravelRequest.value.travelDeskOfficer)) {
    travelDeskTravelRequest.value.travelDeskOfficer = currentUser.value.displayName
  }

  travelDeskTravelRequest.value.internationalTravel =
    travelDeskTravelRequest.value.passportCountry || travelDeskTravelRequest.value.passportNum
}

const router = useRouter()

async function returnToTravelDesk() {
  return router.push({
    name: "TravelDeskPage",
  })
}

const snack = useSnack()

async function markTravelRequestAsSubmittedAndReturnToTravelDesk() {
  isLoading.value = true
  try {
    await travelDeskTravelRequestsApi.submit(travelDeskTravelRequestId.value)
    return router.push({
      name: "TravelDeskPage",
    })
  } catch (error) {
    console.error("Failed to submit travel desk travel request:", error)
    snack.error(`Failed to submit request: ${error}`)
    return false
  } finally {
    isLoading.value = false
  }
}

async function markTravelRequestAsOptionsProvidedAndReturnToTravelDesk() {
  isLoading.value = true
  try {
    await travelDeskTravelRequestsApi.optionsProvided(
      travelDeskTravelRequestId.value,
      travelDeskTravelRequest.value
    )
    return router.push({
      name: "TravelDeskPage",
    })
  } catch (error) {
    console.error("Failed to submit travel desk travel request:", error)
    snack.error(`Failed to submit request: ${error}`)
  } finally {
    isLoading.value = false
  }
}

async function saveNewTravelRequest(saveType, { returnToTravelDeskPageAfter = false } = {}) {
  const body = cloneDeep(travelDeskTravelRequest.value)
  delete body.internationalTravel
  delete body.differentTravelContact
  delete body.office
  delete body.department
  delete body.fullName

  // TODO: move status updates to state specific endpoints
  if (saveType == "save") {
    // no-op
  } else if (saveType == "sendback") {
    body.status = TRAVEL_DESK_TRAVEL_REQUEST_STATUSES.OPTIONS_PROVIDED
  } else if (saveType == "booked") {
    body.status = TRAVEL_DESK_TRAVEL_REQUEST_STATUSES.BOOKED
  }

  savingData.value = true
  try {
    await http.post(`${TRAVEL_DESK_URL}/travel-request/${props.travelDeskTravelRequestId}`, body)

    snack.success("Travel request saved.", {
      color: "success",
    })
    savingData.value = false

    if (returnToTravelDeskPageAfter) {
      return router.push({
        name: "TravelDeskPage",
      })
    } else {
      refresh()
    }
  } catch (error) {
    console.error(error)
    snack.error(`Failed to save travel request: ${error}`)
  } finally {
    savingData.value = false
  }
}

const confirmBookingDialog = ref(null)

function openConfirmBookingDialog() {
  confirmBookingDialog.value.open(props.travelDeskTravelRequestId)
}

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
  {
    text: "Edit",
    to: {
      name: "TravelDeskEditPage",
      params: { travelDeskTravelRequestId: props.travelDeskTravelRequestId },
    },
  },
])
</script>

<style scoped></style>
