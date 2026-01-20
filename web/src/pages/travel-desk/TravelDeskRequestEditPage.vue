<template>
  <v-container class="mx-0 mx-md-auto px-0 px-md-4">
    <v-skeleton-loader
      v-if="isNil(travelDeskTravelRequest)"
      type="card"
    />
    <v-card
      v-else
      class="card--outlined"
      style="--card-title-bg: #f5f5f5"
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
            :block="smAndDown"
            @click="saveTravelDeskTravelRequest"
            >Save Draft
          </v-btn>
        </div>
        <v-divider class="mb-7" />
        <v-row v-if="hasInvoiceNumber">
          <v-col>
            <TravelDeskInvoiceCard
              :travel-desk-travel-request-id="travelDeskTravelRequestIdAsNumber"
            />
          </v-col>
        </v-row>

        <!-- Removed for now see https://github.com/icefoganalytics/travel-authorization/issues/248#issuecomment-2787649358 -->
        <!-- <v-row>
          <v-col>
            <TravelDeskQuestionsManageCard
              :travel-desk-travel-request-id="travelDeskTravelRequestIdAsNumber"
            />
          </v-col>
        </v-row> -->

        <v-row>
          <v-col>
            <v-card
              class="mt-10 card--outlined"
              large-title
              style="--card-title-bg: white"
            >
              <v-card-title>
                <h3>Travel Information</h3>
              </v-card-title>
              <v-card-text class="px-0 px-md-4">
                <TravelDeskFlightRequestsManageCard
                  :travel-desk-travel-request-id="travelDeskTravelRequestIdAsNumber"
                  :travel-authorization-id="travelDeskTravelRequest.travelAuthorizationId"
                  show-flight-options
                />
                <TravelDeskRentalCarsEditCard
                  ref="travelDeskRentalCarsEditCard"
                  class="mt-6"
                  :travel-desk-travel-request-id="travelDeskTravelRequestIdAsNumber"
                  :return-to="buildReturnTo('travel-desk-rental-cars-edit-card')"
                />
                <TravelDeskHotelsEditCard
                  ref="travelDeskHotelsEditCard"
                  class="mt-6"
                  :travel-desk-travel-request-id="travelDeskTravelRequestIdAsNumber"
                  :return-to="buildReturnTo('travel-desk-hotels-edit-card')"
                />
                <TravelDeskOtherTransportationEditCard
                  ref="travelDeskOtherTransportationEditCard"
                  class="mt-6"
                  :travel-desk-travel-request-id="travelDeskTravelRequestIdAsNumber"
                  :return-to="buildReturnTo('travel-desk-other-transportation-edit-card')"
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
          :block="smAndDown"
        >
          <div>Back</div>
        </v-btn>
        <v-btn
          v-if="hasInvoiceNumber"
          class="ml-auto mr-3 px-3"
          color="#005A65"
          @click="openPrintItineraryDialog"
          >View Itinerary</v-btn
        >
        <v-btn
          size="x-small"
          style="min-width: 0"
          color="secondary"
          :class="hasInvoiceNumber ? 'ml-1 mr-2' : 'ml-auto mr-2'"
          @click="uploadPassengerNameRecordDocumentDialogRef?.open()"
        >
          <div class="px-2">Upload PNR</div>
        </v-btn>
        <TravelDeskTravelRequestUploadPassengerNameRecordDocumentDialog
          ref="uploadPassengerNameRecordDocumentDialogRef"
          :travel-desk-travel-request-id="travelDeskTravelRequestIdAsNumber"
          @uploaded="refresh"
        />

        <v-btn
          v-if="isDraftState"
          class="mr-2 px-5"
          color="primary"
          :loading="isLoading"
          :block="smAndDown"
          @click="markTravelRequestAsSubmittedAndReturnToTravelDesk"
        >
          Submit for Traveler
        </v-btn>
        <v-btn
          v-else-if="isSubmittedState"
          class="mr-2 px-5"
          color="primary"
          :loading="isLoading"
          :block="smAndDown"
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
                :block="smAndDown"
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
                :block="smAndDown"
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
          :block="smAndDown"
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
      <TravelDeskTravelRequestPrintItineraryDialog
        ref="travelDeskTravelRequestPrintItineraryDialog"
      />
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { computed, nextTick, Ref, ref, watchEffect } from "vue"
import { isNil } from "lodash"
import { useRouter, useRoute } from "vue2-helpers/vue-router"
import goTo from "vuetify/lib/services/goto"

import travelDeskTravelRequestsApi, {
  TravelDeskTravelRequestStatuses,
} from "@/api/travel-desk-travel-requests-api"

import useDisplayVuetify2 from "@/use/utils/use-display-vuetify2"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useCurrentUser from "@/use/use-current-user"
import useSnack from "@/use/use-snack"
import useTravelDeskTravelRequest from "@/use/use-travel-desk-travel-request"

import TravelDeskInvoiceCard from "@/components/travel-desk-travel-requests/TravelDeskInvoiceCard.vue"
import TravelDeskTravelRequestConfirmBookingDialog from "@/components/travel-desk-travel-requests/TravelDeskTravelRequestConfirmBookingDialog.vue"
import TravelDeskTravelRequestPrintItineraryDialog from "@/components/travel-desk-travel-requests/TravelDeskTravelRequestPrintItineraryDialog.vue"
import TravelDeskTravelRequestUploadPassengerNameRecordDocumentDialog from "@/components/travel-desk-travel-requests/TravelDeskTravelRequestUploadPassengerNameRecordDocumentDialog.vue"
import TravelerDetailsFormCard from "@/components/travel-desk-travel-requests/TravelerDetailsFormCard.vue"

import TravelDeskFlightRequestsManageCard from "@/components/travel-desk-flight-requests/TravelDeskFlightRequestsManageCard.vue"
import TravelDeskHotelsEditCard from "@/components/travel-desk-hotels/TravelDeskHotelsEditCard.vue"
import TravelDeskOtherTransportationEditCard from "@/components/travel-desk-other-transportations/TravelDeskOtherTransportationEditCard.vue"
import TravelDeskRentalCarsEditCard from "@/components/travel-desk-rental-cars/TravelDeskRentalCarsEditCard.vue"
import TravelDeskTravelAgencySelect from "@/components/travel-desk-travel-agencies/TravelDeskTravelAgencySelect.vue"

import UserTravelDeskAgentSelect from "@/components/users/UserTravelDeskAgentSelect.vue"

const props = defineProps<{
  travelDeskTravelRequestId: string
}>()

const { smAndDown } = useDisplayVuetify2()

const travelDeskTravelRequestIdAsNumber = computed(() => parseInt(props.travelDeskTravelRequestId))
const {
  travelDeskTravelRequest,
  isLoading,
  refresh: refreshTravelDeskTravelRequest,
  save: saveTravelDeskTravelRequest,
} = useTravelDeskTravelRequest(travelDeskTravelRequestIdAsNumber)

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
const invoiceNumber = computed(() => travelDeskTravelRequest.value?.invoiceNumber)
const hasInvoiceNumber = computed(() => !isNil(invoiceNumber.value))

const { currentUser } = useCurrentUser<true>()

async function refresh() {
  await refreshTravelDeskTravelRequest()
  await nextTick()

  if (isNil(travelDeskTravelRequest.value)) return

  if (isNil(travelDeskTravelRequest.value?.travelDeskOfficer)) {
    travelDeskTravelRequest.value.travelDeskOfficer = currentUser.value.displayName ?? null
  }

  travelDeskTravelRequest.value.isInternationalTravel =
    !isNil(travelDeskTravelRequest.value.passportCountry) ||
    !isNil(travelDeskTravelRequest.value.passportNum)
}

const router = useRouter()

function buildReturnTo(hash: string) {
  const routeLocation = router.resolve({
    name: "travel-desk/TravelDeskRequestEditPage",
    params: {
      travelDeskTravelRequestId: props.travelDeskTravelRequestId,
    },
    hash: `#${hash}`,
  })
  return routeLocation.href
}

const travelDeskRentalCarsEditCard = ref<InstanceType<typeof TravelDeskRentalCarsEditCard> | null>(
  null
)
const travelDeskHotelsEditCard = ref<InstanceType<typeof TravelDeskHotelsEditCard> | null>(null)
const travelDeskOtherTransportationEditCard = ref<InstanceType<
  typeof TravelDeskOtherTransportationEditCard
> | null>(null)

const scrollToTargetMap: Record<string, Ref<{ $el?: Element } | null>> = {
  ["#travel-desk-rental-cars-edit-card"]: travelDeskRentalCarsEditCard,
  ["#travel-desk-hotels-edit-card"]: travelDeskHotelsEditCard,
  ["#travel-desk-other-transportation-edit-card"]: travelDeskOtherTransportationEditCard,
}

const route = useRoute()

// NOTE: this will be much easier with vuetify 3
watchEffect(() => {
  const { hash } = route
  if (isNil(hash)) return

  const targetRef = scrollToTargetMap[hash]
  if (isNil(targetRef)) return

  const componentRef = targetRef.value
  if (isNil(componentRef)) return

  const { $el } = componentRef
  if (isNil($el)) return

  const targetElement = toHTMLElement($el)
  if (isNil(targetElement)) return

  scrollToTarget(targetElement)
})

function toHTMLElement(element: Element): HTMLElement | null {
  return element instanceof HTMLElement ? element : null
}

function scrollToTarget(targetElement: HTMLElement) {
  return goTo(targetElement, {
    easing: "easeInOutCubic",
    offset: 75,
    duration: 300,
  })
}

async function returnToTravelDesk() {
  return router.push({
    name: "TravelDeskPage",
  })
}

const snack = useSnack()

async function markTravelRequestAsSubmittedAndReturnToTravelDesk() {
  isLoading.value = true
  try {
    await travelDeskTravelRequestsApi.submit(travelDeskTravelRequestIdAsNumber.value)
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
  if (isNil(travelDeskTravelRequest.value)) return

  isLoading.value = true
  try {
    await travelDeskTravelRequestsApi.optionsProvided(
      travelDeskTravelRequestIdAsNumber.value,
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

const confirmBookingDialog = ref<InstanceType<
  typeof TravelDeskTravelRequestConfirmBookingDialog
> | null>(null)
const travelDeskTravelRequestPrintItineraryDialog = ref<InstanceType<
  typeof TravelDeskTravelRequestPrintItineraryDialog
> | null>(null)
const uploadPassengerNameRecordDocumentDialogRef = ref<InstanceType<
  typeof TravelDeskTravelRequestUploadPassengerNameRecordDocumentDialog
> | null>(null)

function openConfirmBookingDialog() {
  confirmBookingDialog.value?.open(props.travelDeskTravelRequestId)
}

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
      name: "travel-desk/TravelDeskRequestPage",
      params: {
        travelDeskTravelRequestId: props.travelDeskTravelRequestId,
      },
    },
  },
  {
    text: "Edit",
    to: {
      name: "travel-desk/TravelDeskRequestEditPage",
      params: {
        travelDeskTravelRequestId: props.travelDeskTravelRequestId,
      },
    },
  },
])
useBreadcrumbs(breadcrumbs)
</script>

<style scoped></style>
