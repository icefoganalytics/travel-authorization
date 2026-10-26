<template>
  <v-container>
    <v-btn
      :to="{ name: 'travel-requests/TravelDeskRequestsPage' }"
      prepend-icon="mdi-arrow-left"
      variant="text"
    >
      Travel Desk Requests
    </v-btn>
    <h1 class="text-h4 mb-4">Travel Desk Request</h1>
    <v-skeleton-loader
      v-if="isLoading || requestIsLoading"
      type="card"
    />
    <v-alert
      v-else-if="isErrored || requestIsErrored"
      type="error"
    >
      The Travel Desk Request could not be loaded.
    </v-alert>
    <v-alert
      v-else-if="!travelAuthorization?.travelDeskTravelRequest"
      type="info"
    >
      A Travel Desk Request has not been created for this authorization. Request creation and
      prefill are completed during approval.
    </v-alert>
    <template v-else-if="travelDeskTravelRequest">
      <v-alert
        v-if="saveError"
        type="error"
        class="mb-4"
        >{{ saveError }}</v-alert
      >
      <v-alert
        v-if="!canUpdate"
        type="info"
        class="mb-4"
      >
        This request is read-only because you do not have permission to update the Travel Desk
        Request.
      </v-alert>
      <TravelerDetailsFormCard
        v-if="canUpdate && isDraft"
        ref="travelerForm"
        v-model="travelDeskTravelRequest"
      />
      <TravelerDetailsCard
        v-else
        :travel-desk-travel-request-id="travelDeskTravelRequest.id"
      />
      <TravelDeskTravelRequestEditCard
        v-if="canUpdate && isDraft"
        :travel-desk-travel-request-id="travelDeskTravelRequest.id"
      />
      <v-card
        v-else-if="isDraft"
        class="mb-4"
      >
        <v-card-text>Travel information editing is not available to your account.</v-card-text>
      </v-card>
      <v-card
        v-if="isOptionsProvided"
        class="mb-4"
      >
        <v-card-title>Review Travel Options</v-card-title>
        <v-card-text>
          <TravelDeskFlightRequestsCard
            :travel-desk-travel-request-id="travelDeskTravelRequest.id"
          />
          <TravelDeskFlightRequestFlightOptionsOrderCard
            v-if="isRequestOwner"
            ref="flightOptionsOrderCard"
            :travel-desk-travel-request-id="travelDeskTravelRequest.id"
          />
          <p
            v-else
            class="mt-4"
          >
            Only the request owner can rank travel options.
          </p>
          <v-alert
            v-if="questionsAreLoading"
            type="info"
            class="mb-3"
          >
            Loading Travel Desk questions…
          </v-alert>
          <v-alert
            v-if="questionsErrored"
            type="error"
            class="mb-3"
          >
            Travel Desk questions could not be loaded completely. Rankings cannot be submitted.
          </v-alert>
          <v-alert
            v-if="flightRequestsErrored || !hasCompleteFlightRequests"
            type="error"
            class="mb-3"
          >
            All flight requests could not be loaded. Rankings cannot be submitted.
          </v-alert>
          <v-alert
            v-if="
              !flightRequestsAreLoading &&
              !flightRequestsErrored &&
              hasCompleteFlightRequests &&
              travelDeskFlightRequests.length === 0
            "
            type="info"
            class="mb-3"
          >
            No flight requests are available to rank.
          </v-alert>
          <div class="mt-4">
            <h3 class="text-h6 mb-2">Travel Desk Questions</h3>
            <v-list v-if="travelDeskQuestions.length">
              <v-list-item
                v-for="question in travelDeskQuestions"
                :key="question.id"
              >
                <v-list-item-title>{{ question.question }}</v-list-item-title>
                <v-textarea
                  v-model="question.response"
                  label="Response"
                  :disabled="!isRequestOwner"
                  rows="2"
                />
              </v-list-item>
            </v-list>
            <p v-else-if="!questionsAreLoading && !questionsErrored">
              No questions or responses are available.
            </p>
          </div>
        </v-card-text>
      </v-card>
      <div
        v-if="isDraft && canUpdate"
        class="d-flex ga-2 mt-4"
      >
        <v-btn
          :loading="isSaving"
          @click="saveDraft"
          >Save Draft</v-btn
        >
        <v-btn
          color="primary"
          :loading="isSaving"
          @click="submitDraft"
        >
          Submit Travel Desk Request
        </v-btn>
      </div>
      <div
        v-if="isOptionsProvided && isRequestOwner"
        class="mt-4"
      >
        <v-btn
          color="primary"
          :loading="isSaving"
          :disabled="
            questionsAreLoading ||
            questionsErrored ||
            flightRequestsAreLoading ||
            flightRequestsErrored ||
            !hasCompleteFlightRequests ||
            travelDeskFlightRequests.length === 0
          "
          @click="rankOptions"
        >
          Submit Rankings
        </v-btn>
      </div>
      <v-btn
        v-if="
          travelDeskTravelRequest.status === TravelDeskTravelRequestStatuses.BOOKED &&
          !isNil(travelDeskTravelRequest.invoiceNumber)
        "
        class="mt-4"
        @click="openBookedItinerary"
      >
        View Booked Itinerary
      </v-btn>
      <TravelDeskTravelRequestPrintItineraryDialog ref="itineraryDialog" />
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref, toRefs, useTemplateRef, watch } from "vue"
import { isNil } from "lodash"

import travelDeskQuestionsApi, { type TravelDeskQuestion } from "@/api/travel-desk-questions-api"
import {
  TravelDeskTravelRequestStatuses,
  travelDeskTravelRequestsApi,
} from "@/api/travel-desk-travel-requests-api"

import useCurrentUser from "@/use/use-current-user"
import useSnack from "@/use/use-snack"
import useTravelAuthorization from "@/use/use-travel-authorization"
import useTravelDeskFlightRequests from "@/use/use-travel-desk-flight-requests"
import useTravelDeskTravelRequest from "@/use/use-travel-desk-travel-request"

import TravelDeskFlightRequestFlightOptionsOrderCard from "@/components/travel-desk-flight-requests/TravelDeskFlightRequestFlightOptionsOrderCard.vue"
import TravelDeskFlightRequestsCard from "@/components/travel-desk-flight-requests/TravelDeskFlightRequestsCard.vue"
import TravelerDetailsCard from "@/components/travel-desk-travel-requests/TravelerDetailsCard.vue"
import TravelerDetailsFormCard from "@/components/travel-desk-travel-requests/TravelerDetailsFormCard.vue"
import TravelDeskTravelRequestEditCard from "@/components/travel-desk-travel-requests/TravelDeskTravelRequestEditCard.vue"
import TravelDeskTravelRequestPrintItineraryDialog from "@/components/travel-desk-travel-requests/TravelDeskTravelRequestPrintItineraryDialog.vue"

const props = defineProps<{ travelAuthorizationId: number }>()
const { travelAuthorizationId } = toRefs(props)
const { currentUser } = useCurrentUser()
const {
  travelAuthorization,
  isLoading,
  isErrored,
  fetch: fetchAuthorization,
} = useTravelAuthorization(travelAuthorizationId)
const requestId = computed(() => travelAuthorization.value?.travelDeskTravelRequest?.id)
const {
  travelDeskTravelRequest,
  policy: requestPolicy,
  isLoading: requestIsLoading,
  isErrored: requestIsErrored,
  save,
  refresh: refreshRequest,
} = useTravelDeskTravelRequest(requestId)

const travelDeskQuestions = ref<TravelDeskQuestion[]>([])
const questionsAreLoading = ref(false)
const questionsErrored = ref(false)

watch(
  requestId,
  async (id) => {
    if (isNil(id)) {
      travelDeskQuestions.value = []
      return
    }

    questionsAreLoading.value = true
    questionsErrored.value = false

    try {
      const result = await travelDeskQuestionsApi.list({
        where: { travelRequestId: id },
        perPage: -1,
      })
      if (result.totalCount > result.travelDeskQuestions.length) {
        questionsErrored.value = true
        travelDeskQuestions.value = []
      } else {
        travelDeskQuestions.value = result.travelDeskQuestions
      }
    } catch (error) {
      console.error(error)
      travelDeskQuestions.value = []
      questionsErrored.value = true
    } finally {
      questionsAreLoading.value = false
    }
  },
  { immediate: true }
)

const flightRequestOptions = computed(() => ({
  where: { travelRequestId: requestId.value },
  perPage: -1,
}))
const {
  travelDeskFlightRequests,
  totalCount: flightRequestTotalCount,
  isLoading: flightRequestsAreLoading,
  isErrored: flightRequestsErrored,
} = useTravelDeskFlightRequests(flightRequestOptions, {
  skipWatchIf: () => isNil(requestId.value),
})
const canUpdate = computed(() => requestPolicy.value?.update === true)
const isDraft = computed(
  () => travelDeskTravelRequest.value?.status === TravelDeskTravelRequestStatuses.DRAFT
)
const isOptionsProvided = computed(
  () => travelDeskTravelRequest.value?.status === TravelDeskTravelRequestStatuses.OPTIONS_PROVIDED
)
const isRequestOwner = computed(() => travelAuthorization.value?.userId === currentUser.value?.id)
const hasCompleteFlightRequests = computed(
  () => flightRequestTotalCount.value === travelDeskFlightRequests.value.length
)
const isSaving = ref(false)
const saveError = ref("")
const travelerForm = useTemplateRef("travelerForm")
const flightOptionsOrderCard = useTemplateRef("flightOptionsOrderCard")
const itineraryDialog = ref<InstanceType<
  typeof TravelDeskTravelRequestPrintItineraryDialog
> | null>(null)
const snack = useSnack()

async function saveDraft() {
  if (!canUpdate.value) return

  isSaving.value = true
  saveError.value = ""
  try {
    await save()
    snack.success("Draft saved.")
  } catch (error) {
    console.error(error)
    saveError.value = "The draft could not be saved."
  } finally {
    isSaving.value = false
  }
}

async function submitDraft() {
  if (!canUpdate.value || !isDraft.value || isNil(travelerForm.value)) return
  const validation = await travelerForm.value.validate()
  if (!validation.valid) {
    snack.error("Form validation failed. Please complete the required fields.")
    return
  }

  isSaving.value = true
  try {
    const request = travelDeskTravelRequest.value
    if (isNil(request)) return

    await travelDeskTravelRequestsApi.submit(request.id, request)
    await Promise.all([fetchAuthorization(), refreshRequest()])
    snack.success("Travel Desk Request submitted.")
  } catch (error) {
    console.error(error)
    snack.error(`Failed to submit Travel Desk Request: ${error}`)
  } finally {
    isSaving.value = false
  }
}

async function rankOptions() {
  if (!isRequestOwner.value || !isOptionsProvided.value) return
  if (questionsAreLoading.value || questionsErrored.value) return
  if (
    flightRequestsAreLoading.value ||
    flightRequestsErrored.value ||
    !hasCompleteFlightRequests.value
  ) {
    return
  }
  if (travelDeskQuestions.value.some((question) => !question.response?.trim())) {
    snack.error("Please provide a response to every Travel Desk question.")
    return
  }
  if (travelDeskFlightRequests.value.length === 0 || isNil(travelDeskTravelRequest.value)) {
    snack.error("No travel options are available to rank.")
    return
  }

  isSaving.value = true
  try {
    const rankingsSaved = await flightOptionsOrderCard.value?.save()
    if (!rankingsSaved) return

    for (const question of travelDeskQuestions.value) {
      await travelDeskQuestionsApi.update(question.id, { response: question.response })
    }
    await travelDeskTravelRequestsApi.optionsRanked(travelDeskTravelRequest.value.id)
    await Promise.all([fetchAuthorization(), refreshRequest()])
  } catch (error) {
    console.error(error)
    snack.error(`Failed to submit travel option rankings: ${error}`)
  } finally {
    isSaving.value = false
  }
}

function openBookedItinerary() {
  if (isNil(travelDeskTravelRequest.value?.invoiceNumber)) return

  itineraryDialog.value?.open(travelDeskTravelRequest.value.id)
}
</script>
