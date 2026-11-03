<template>
  <v-card>
    <v-card-title>Review Travel Options</v-card-title>
    <v-card-text>
      <TravelDeskFlightRequestsCard :travel-desk-travel-request-id="travelDeskTravelRequestId" />
      <TravelDeskFlightRequestFlightOptionsOrderCard
        v-if="isRequestOwner"
        ref="flightOptionsOrderCard"
        :travel-desk-travel-request-id="travelDeskTravelRequestId"
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
        v-if="questionsErrored || !hasCompleteQuestions"
        type="error"
        class="mb-3"
      >
        Travel Desk questions could not be loaded completely. Rankings cannot be submitted.
      </v-alert>
      <v-alert
        v-if="!flightRequestsAreLoading && (flightRequestsErrored || !hasCompleteFlightRequests)"
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
            <p class="mb-2">{{ question.question }}</p>
            <v-textarea
              v-model="question.response"
              label="Response"
              :readonly="!isRequestOwner"
              rows="2"
            />
            <p
              v-if="!isRequestOwner"
              class="text-caption"
            >
              Only the request owner can update responses.
            </p>
          </v-list-item>
        </v-list>
        <p v-else-if="!questionsAreLoading && !questionsErrored && hasCompleteQuestions">
          No questions or responses are available.
        </p>
      </div>
      <div
        v-if="isRequestOwner"
        class="d-flex ga-2 mt-4"
      >
        <ConditionalTooltipButton
          :loading="isSaving || questionsAreLoading"
          :disabled="questionsUnavailableReason.length > 0"
          :tooltip-text="questionsUnavailableReason"
          @click="saveReviewResponses"
        >
          Save Responses
        </ConditionalTooltipButton>
        <ConditionalTooltipButton
          color="primary"
          :loading="isSaving || questionsAreLoading || flightRequestsAreLoading"
          :disabled="rankingsUnavailableReason.length > 0"
          :tooltip-text="rankingsUnavailableReason"
          @click="rankOptions"
        >
          Submit Rankings
        </ConditionalTooltipButton>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref, toRefs, useTemplateRef } from "vue"
import { isNil } from "lodash"

import travelDeskQuestionsApi, { type TravelDeskQuestion } from "@/api/travel-desk-questions-api"
import travelDeskTravelRequestsApi, {
  TravelDeskTravelRequestStatuses,
  type TravelDeskTravelRequestAsShow,
} from "@/api/travel-desk-travel-requests-api"
import useSnack from "@/use/use-snack"
import useTravelDeskFlightRequests from "@/use/use-travel-desk-flight-requests"
import useTravelDeskQuestions from "@/use/use-travel-desk-questions"

import ConditionalTooltipButton from "@/components/common/ConditionalTooltipButton.vue"
import TravelDeskFlightRequestFlightOptionsOrderCard from "@/components/travel-desk-flight-requests/TravelDeskFlightRequestFlightOptionsOrderCard.vue"
import TravelDeskFlightRequestsCard from "@/components/travel-desk-flight-requests/TravelDeskFlightRequestsCard.vue"

const props = defineProps<{
  travelDeskTravelRequestId: number
  isRequestOwner: boolean
  status: TravelDeskTravelRequestStatuses
}>()

const emit = defineEmits<{
  ranked: [request: TravelDeskTravelRequestAsShow]
  responsesSaved: []
}>()

const { travelDeskTravelRequestId } = toRefs(props)

const questionsOptions = computed(() => ({
  where: {
    travelRequestId: travelDeskTravelRequestId.value,
  },
  perPage: -1,
}))

const {
  travelDeskQuestions,
  totalCount: questionTotalCount,
  isLoading: questionsAreLoading,
  isErrored: questionsErrored,
  refresh: refreshQuestions,
} = useTravelDeskQuestions(questionsOptions)

const hasCompleteQuestions = computed(
  () => questionTotalCount.value === travelDeskQuestions.value.length
)

const flightRequestsOptions = computed(() => ({
  where: {
    travelRequestId: travelDeskTravelRequestId.value,
  },
  perPage: -1,
}))

const {
  travelDeskFlightRequests,
  totalCount: flightRequestTotalCount,
  isLoading: flightRequestsAreLoading,
  isErrored: flightRequestsErrored,
} = useTravelDeskFlightRequests(flightRequestsOptions)

const hasCompleteFlightRequests = computed(
  () => flightRequestTotalCount.value === travelDeskFlightRequests.value.length
)

const isSaving = ref(false)
const snack = useSnack()
const flightOptionsOrderCard = useTemplateRef("flightOptionsOrderCard")

const questionsUnavailableReason = computed(() => {
  if (questionsAreLoading.value) return "Travel Desk questions are still loading."
  if (questionsErrored.value || !hasCompleteQuestions.value) {
    return "Reload the request to load all Travel Desk questions before saving responses."
  }

  return ""
})

const rankingsUnavailableReason = computed(() => {
  if (questionsUnavailableReason.value) {
    return "Reload the request to load all Travel Desk questions before submitting rankings."
  }
  if (flightRequestsAreLoading.value) return "Flight requests are still loading."
  if (flightRequestsErrored.value || !hasCompleteFlightRequests.value) {
    return "Reload the request to load all flight requests before submitting rankings."
  }
  if (travelDeskFlightRequests.value.length === 0)
    return "No flight requests are available to rank."

  return ""
})

async function saveQuestionResponses(questions: TravelDeskQuestion[]) {
  for (const question of questions) {
    await travelDeskQuestionsApi.update(question.id, {
      response: question.response,
    })
  }
}

async function saveReviewResponses() {
  if (
    isSaving.value ||
    !props.isRequestOwner ||
    props.status !== TravelDeskTravelRequestStatuses.OPTIONS_PROVIDED ||
    questionsUnavailableReason.value
  ) {
    return
  }

  isSaving.value = true
  try {
    await saveQuestionResponses(travelDeskQuestions.value)
    snack.success("Responses saved.")
    emit("responsesSaved")
  } catch (error) {
    console.error(error)
    snack.error(`Failed to save Travel Desk responses: ${error}`)
  } finally {
    isSaving.value = false
  }
}

async function rankOptions() {
  if (
    isSaving.value ||
    !props.isRequestOwner ||
    props.status !== TravelDeskTravelRequestStatuses.OPTIONS_PROVIDED ||
    rankingsUnavailableReason.value
  ) {
    return
  }
  if (travelDeskQuestions.value.some((question) => !question.response?.trim())) {
    snack.error("Please provide a response to every Travel Desk question.")
    return
  }
  if (isNil(flightOptionsOrderCard.value)) return

  isSaving.value = true
  try {
    const rankingsSaved = await flightOptionsOrderCard.value.save()
    if (!rankingsSaved) return

    await saveQuestionResponses(travelDeskQuestions.value)
    const { travelDeskTravelRequest } = await travelDeskTravelRequestsApi.optionsRanked(
      props.travelDeskTravelRequestId
    )
    snack.success("Travel option rankings submitted.")
    emit("ranked", travelDeskTravelRequest)
  } catch (error) {
    console.error(error)
    snack.error(`Failed to submit travel option rankings: ${error}`)
  } finally {
    isSaving.value = false
  }
}

defineExpose({
  refresh: refreshQuestions,
})
</script>
