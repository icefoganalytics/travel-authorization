<template>
  <v-sheet>
    <v-skeleton-loader
      v-if="isNil(travelDeskTravelRequest)"
      type="card"
    />
    <div
      v-else
      class="grey lighten-4"
    >
      <v-card>
        <v-card-title>
          <SectionHeader
            title="1. Review and Manage Booking"
            icon="mdi-clipboard-check-outline"
            tag="h4"
          />
        </v-card-title>
        <v-card-text>
          <v-alert
            v-if="isDraftState"
            type="info"
            outlined
          >
            This request is still in draft. Review the booking details, then submit it for the
            traveler.
          </v-alert>
          <v-alert
            v-else-if="isSubmittedState"
            type="info"
            outlined
          >
            This request is ready to be sent to the traveler with the available booking options.
          </v-alert>
          <v-alert
            v-else-if="isOptionsProvidedState"
            type="info"
            outlined
          >
            Waiting for the traveler to rank flight options before booking can be finalized.
          </v-alert>
          <v-alert
            v-else-if="isOptionsRankedState && !hasInvoiceNumber"
            type="warning"
            outlined
          >
            Upload a PNR with an invoice number before marking the booking complete.
          </v-alert>
          <v-alert
            v-else-if="isOptionsRankedState && hasInvoiceNumber"
            type="info"
            outlined
          >
            The traveler has ranked their options. Review the itinerary, then mark the booking
            complete when finalized.
          </v-alert>
          <v-alert
            v-else-if="isBookedState || isCompleteState"
            type="success"
            outlined
          >
            This travel request is already booked and no further workflow action is required.
          </v-alert>
          <v-alert
            v-else-if="!isKnownWorkflowState"
            type="warning"
            outlined
          >
            Unhandled state: {{ travelDeskTravelRequest.status }}
          </v-alert>
        </v-card-text>
      </v-card>

      <div class="d-flex flex-column flex-md-row">
        <v-btn
          v-if="isDraftState"
          color="primary"
          :loading="isWorkflowLoading"
          :block="smAndDown"
          @click="markTravelRequestAsSubmittedAndReturnToTravelDesk"
        >
          Submit for Traveler
        </v-btn>
        <v-btn
          v-else-if="isSubmittedState"
          color="primary"
          :loading="isWorkflowLoading"
          :block="smAndDown"
          @click="markTravelRequestAsOptionsProvidedAndReturnToTravelDesk"
        >
          Send to Traveler
        </v-btn>
        <template v-else-if="isOptionsRankedState && hasInvoiceNumber">
          <v-btn
            color="primary"
            :loading="isWorkflowLoading"
            :block="smAndDown"
            @click="openConfirmBookingDialog"
          >
            Booking Complete
            <TravelDeskTravelRequestConfirmBookingDialog
              ref="confirmBookingDialog"
              @booked="returnToTravelDesk"
            />
          </v-btn>
        </template>
        <v-btn
          v-if="hasInvoiceNumber"
          class="ml-md-2"
          color="secondary"
          :block="smAndDown"
          @click="openPrintItineraryDialog"
        >
          View Itinerary
          <TravelDeskTravelRequestPrintItineraryDialog
            ref="travelDeskTravelRequestPrintItineraryDialog"
          />
        </v-btn>
        <v-spacer />
        <v-btn
          color="warning"
          outlined
          :to="{
            name: 'travel-desk/edit/TravelDeskRequestTripInformationPage',
            params: {
              travelDeskTravelRequestId: props.travelDeskTravelRequestId,
            },
          }"
          :loading="isWorkflowLoading"
          :block="smAndDown"
        >
          Back
        </v-btn>
      </div>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { isNil } from "lodash"
import { useRouter } from "vue2-helpers/vue-router"

import travelDeskTravelRequestsApi, {
  TravelDeskTravelRequestStatuses,
} from "@/api/travel-desk-travel-requests-api"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useSnack from "@/use/use-snack"
import useTravelDeskTravelRequest from "@/use/use-travel-desk-travel-request"
import useDisplayVuetify2 from "@/use/utils/use-display-vuetify2"

import SectionHeader from "@/components/common/SectionHeader.vue"
import TravelDeskTravelRequestConfirmBookingDialog from "@/components/travel-desk-travel-requests/TravelDeskTravelRequestConfirmBookingDialog.vue"
import TravelDeskTravelRequestPrintItineraryDialog from "@/components/travel-desk-travel-requests/TravelDeskTravelRequestPrintItineraryDialog.vue"

const props = defineProps<{
  travelDeskTravelRequestId: string
}>()

const travelDeskTravelRequestIdAsNumber = computed(() => parseInt(props.travelDeskTravelRequestId))
const { travelDeskTravelRequest } = useTravelDeskTravelRequest(travelDeskTravelRequestIdAsNumber)

const invoiceNumber = computed(() => travelDeskTravelRequest.value?.invoiceNumber)
const hasInvoiceNumber = computed(() => !isNil(invoiceNumber.value))
const isDraftState = computed(
  () => travelDeskTravelRequest.value?.status === TravelDeskTravelRequestStatuses.DRAFT
)
const isSubmittedState = computed(
  () => travelDeskTravelRequest.value?.status === TravelDeskTravelRequestStatuses.SUBMITTED
)
const isOptionsProvidedState = computed(
  () => travelDeskTravelRequest.value?.status === TravelDeskTravelRequestStatuses.OPTIONS_PROVIDED
)
const isOptionsRankedState = computed(
  () => travelDeskTravelRequest.value?.status === TravelDeskTravelRequestStatuses.OPTIONS_RANKED
)
const isBookedState = computed(
  () => travelDeskTravelRequest.value?.status === TravelDeskTravelRequestStatuses.BOOKED
)
const isCompleteState = computed(
  () => travelDeskTravelRequest.value?.status === TravelDeskTravelRequestStatuses.COMPLETE
)
const isKnownWorkflowState = computed(
  () =>
    isDraftState.value ||
    isSubmittedState.value ||
    isOptionsProvidedState.value ||
    isOptionsRankedState.value ||
    isBookedState.value ||
    isCompleteState.value
)

const snack = useSnack()
const isWorkflowLoading = ref(false)

async function markTravelRequestAsSubmittedAndReturnToTravelDesk() {
  isWorkflowLoading.value = true
  try {
    await travelDeskTravelRequestsApi.submit(travelDeskTravelRequestIdAsNumber.value)
    returnToTravelDesk()
  } catch (error) {
    console.error("Failed to submit travel desk travel request:", error)
    snack.error(`Failed to submit request: ${error}`)
  } finally {
    isWorkflowLoading.value = false
  }
}

async function markTravelRequestAsOptionsProvidedAndReturnToTravelDesk() {
  if (isNil(travelDeskTravelRequest.value)) return

  isWorkflowLoading.value = true
  try {
    await travelDeskTravelRequestsApi.optionsProvided(
      travelDeskTravelRequestIdAsNumber.value,
      travelDeskTravelRequest.value
    )
    returnToTravelDesk()
  } catch (error) {
    console.error("Failed to submit travel desk travel request:", error)
    snack.error(`Failed to submit request: ${error}`)
  } finally {
    isWorkflowLoading.value = false
  }
}

const router = useRouter()

async function returnToTravelDesk() {
  return router.push({
    name: "TravelDeskPage",
  })
}

const confirmBookingDialog = ref<InstanceType<
  typeof TravelDeskTravelRequestConfirmBookingDialog
> | null>(null)

function openConfirmBookingDialog() {
  confirmBookingDialog.value?.open(props.travelDeskTravelRequestId)
}

const travelDeskTravelRequestPrintItineraryDialog = ref<InstanceType<
  typeof TravelDeskTravelRequestPrintItineraryDialog
> | null>(null)

function openPrintItineraryDialog() {
  travelDeskTravelRequestPrintItineraryDialog.value?.open(travelDeskTravelRequestIdAsNumber.value)
}

const { smAndDown } = useDisplayVuetify2()

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
      name: "travel-desk/TravelDeskRequestPage",
      params: {
        travelDeskTravelRequestId: props.travelDeskTravelRequestId,
      },
    },
  },
  {
    text: "Edit",
    to: {
      name: "travel-desk/TravelDeskRequestEditRedirect",
      params: {
        travelDeskTravelRequestId: props.travelDeskTravelRequestId,
      },
    },
  },
  {
    text: "Review and Manage Booking",
    to: {
      name: "travel-desk/edit/TravelDeskRequestReviewManageBookingPage",
      params: {
        travelDeskTravelRequestId: props.travelDeskTravelRequestId,
      },
    },
  },
])
useBreadcrumbs(breadcrumbs)
</script>

<style scoped></style>
