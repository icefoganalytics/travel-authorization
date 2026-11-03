<template>
  <div>
    <v-skeleton-loader
      v-if="isLoading && isNil(completeTravelDeskTravelRequest) && !isErrored"
      type="card"
    />
    <v-alert
      v-else-if="isErrored && isNil(completeTravelDeskTravelRequest)"
      type="error"
    >
      The Travel Desk Request could not be loaded.
    </v-alert>
    <v-alert
      v-else-if="isNil(completeTravelDeskTravelRequest)"
      type="info"
    >
      This Travel Desk Request is unavailable.
    </v-alert>
    <template v-else>
      <v-alert
        v-if="!canUpdate"
        type="info"
        class="mb-4"
      >
        This request is read-only because you do not have permission to update the Travel Desk
        Request.
      </v-alert>
      <TravelDeskTravelRequestDraftFormCard
        v-if="isDraft && canUpdate && travelDeskTravelRequest"
        v-model="travelDeskTravelRequest"
        :travel-desk-travel-request-id="travelDeskTravelRequestId"
        :return-to="returnTo"
        @submitted="refreshRequest"
      />
      <template v-else>
        <TravelerDetailsCard :travel-desk-travel-request-id="completeTravelDeskTravelRequest.id" />
        <TravelDeskTravelRequestResourcesCard
          :travel-desk-travel-request-id="completeTravelDeskTravelRequest.id"
          :status="completeTravelDeskTravelRequest.status"
          :invoice-number="completeTravelDeskTravelRequest.invoiceNumber"
        />
      </template>
      <TravelDeskQuestionsManageCard
        v-if="canUpdate"
        ref="questionsManageCard"
        class="mt-4"
        :travel-desk-travel-request-id="completeTravelDeskTravelRequest.id"
        @updated="optionsReviewCard?.refresh()"
      />
      <TravelDeskTravelRequestOptionsReviewCard
        v-if="isOptionsProvided"
        ref="optionsReviewCard"
        class="mt-4"
        :travel-desk-travel-request-id="completeTravelDeskTravelRequest.id"
        :status="completeTravelDeskTravelRequest.status"
        :is-request-owner="isRequestOwner"
        @ranked="travelDeskTravelRequest = $event"
        @responses-saved="questionsManageCard?.refresh()"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs, useTemplateRef } from "vue"
import { isNil } from "lodash"

import { type TravelAuthorizationAsShow } from "@/api/travel-authorizations-api"
import { TravelDeskTravelRequestStatuses } from "@/api/travel-desk-travel-requests-api"

import useCurrentUser from "@/use/use-current-user"
import useTravelDeskTravelRequest from "@/use/use-travel-desk-travel-request"

import TravelDeskQuestionsManageCard from "@/components/travel-desk-questions/TravelDeskQuestionsManageCard.vue"
import TravelerDetailsCard from "@/components/travel-desk-travel-requests/TravelerDetailsCard.vue"
import TravelDeskTravelRequestDraftFormCard from "@/components/travel-desk-travel-requests/TravelDeskTravelRequestDraftFormCard.vue"
import TravelDeskTravelRequestOptionsReviewCard from "@/components/travel-desk-travel-requests/TravelDeskTravelRequestOptionsReviewCard.vue"
import TravelDeskTravelRequestResourcesCard from "@/components/travel-desk-travel-requests/TravelDeskTravelRequestResourcesCard.vue"

const props = defineProps<{
  travelDeskTravelRequestId: number
  travelAuthorization: TravelAuthorizationAsShow
  returnTo: string
}>()
const { travelDeskTravelRequestId } = toRefs(props)
const { currentUser } = useCurrentUser()
const {
  travelDeskTravelRequest,
  policy: requestPolicy,
  isLoading,
  isErrored,
  refresh: refreshRequest,
} = useTravelDeskTravelRequest(travelDeskTravelRequestId)
const questionsManageCard = useTemplateRef("questionsManageCard")
const optionsReviewCard = useTemplateRef("optionsReviewCard")

const completeTravelDeskTravelRequest = computed(() => {
  const request = travelDeskTravelRequest.value
  if (isNil(request) || request.id !== props.travelDeskTravelRequestId) return null

  return request
})
const canUpdate = computed(() => requestPolicy.value?.update === true)
const isDraft = computed(
  () => completeTravelDeskTravelRequest.value?.status === TravelDeskTravelRequestStatuses.DRAFT
)
const isOptionsProvided = computed(
  () =>
    completeTravelDeskTravelRequest.value?.status ===
    TravelDeskTravelRequestStatuses.OPTIONS_PROVIDED
)
const isRequestOwner = computed(() => props.travelAuthorization.userId === currentUser.value?.id)
</script>
