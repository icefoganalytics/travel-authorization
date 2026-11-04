<template>
  <v-container>
    <h1 class="text-h4 mb-4">Travel Desk Request</h1>
    <v-skeleton-loader
      v-if="isNil(travelDeskTravelRequest)"
      type="card"
    />
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
        v-if="isDraft && canUpdate"
        v-model="travelDeskTravelRequest"
        :travel-desk-travel-request-id="travelDeskTravelRequest.id"
        :return-to="returnTo"
        @submitted="refreshRequest"
      />
      <template v-else>
        <TravelerDetailsCard :travel-desk-travel-request-id="travelDeskTravelRequest.id" />
        <TravelDeskTravelRequestResourcesCard
          :travel-desk-travel-request-id="travelDeskTravelRequest.id"
          :status="travelDeskTravelRequest.status"
          :invoice-number="travelDeskTravelRequest.invoiceNumber"
        />
      </template>
      <TravelDeskQuestionsManageCard
        v-if="canUpdate"
        ref="questionsManageCard"
        class="mt-4"
        :travel-desk-travel-request-id="travelDeskTravelRequest.id"
        @updated="optionsReviewCard?.refresh()"
      />
      <TravelDeskTravelRequestOptionsReviewCard
        v-if="isOptionsProvided"
        ref="optionsReviewCard"
        class="mt-4"
        :travel-desk-travel-request-id="travelDeskTravelRequest.id"
        :status="travelDeskTravelRequest.status"
        :is-request-owner="isRequestOwner"
        @ranked="travelDeskTravelRequest = $event"
        @responses-saved="questionsManageCard?.refresh()"
      />
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { computed, useTemplateRef } from "vue"
import { useRoute } from "vue-router"
import { isNil } from "lodash"

import { TravelDeskTravelRequestStatuses } from "@/api/travel-desk-travel-requests-api"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useCurrentUser from "@/use/use-current-user"
import useTravelAuthorization from "@/use/use-travel-authorization"
import useTravelDeskTravelRequest from "@/use/use-travel-desk-travel-request"

import TravelDeskQuestionsManageCard from "@/components/travel-desk-questions/TravelDeskQuestionsManageCard.vue"
import TravelerDetailsCard from "@/components/travel-desk-travel-requests/TravelerDetailsCard.vue"
import TravelDeskTravelRequestDraftFormCard from "@/components/travel-desk-travel-requests/TravelDeskTravelRequestDraftFormCard.vue"
import TravelDeskTravelRequestOptionsReviewCard from "@/components/travel-desk-travel-requests/TravelDeskTravelRequestOptionsReviewCard.vue"
import TravelDeskTravelRequestResourcesCard from "@/components/travel-desk-travel-requests/TravelDeskTravelRequestResourcesCard.vue"

const props = defineProps<{
  travelAuthorizationId: number | string
}>()

const route = useRoute()
const returnTo = computed(() => route.fullPath)
const travelAuthorizationId = computed(() => Number(props.travelAuthorizationId))

const { currentUser } = useCurrentUser()
const { travelAuthorization } = useTravelAuthorization(travelAuthorizationId)

const travelDeskTravelRequestId = computed(
  () => travelAuthorization.value?.travelDeskTravelRequest?.id
)

const {
  travelDeskTravelRequest,
  policy: requestPolicy,
  refresh: refreshRequest,
} = useTravelDeskTravelRequest(travelDeskTravelRequestId)

const questionsManageCard = useTemplateRef("questionsManageCard")
const optionsReviewCard = useTemplateRef("optionsReviewCard")

const canUpdate = computed(() => requestPolicy.value?.update === true)

const isDraft = computed(
  () => travelDeskTravelRequest.value?.status === TravelDeskTravelRequestStatuses.DRAFT
)

const isOptionsProvided = computed(
  () => travelDeskTravelRequest.value?.status === TravelDeskTravelRequestStatuses.OPTIONS_PROVIDED
)

const isRequestOwner = computed(() => travelAuthorization.value?.userId === currentUser.value?.id)

const breadcrumbs = computed(() => [
  {
    title: "Travel Requests",
    to: {
      name: "travel-requests/TravelRequestsPage",
    },
  },
  {
    title: "Travel Desk Request",
    to: {
      name: "travel-requests/TravelRequestTravelDeskPage",
      params: {
        travelAuthorizationId: props.travelAuthorizationId,
      },
    },
  },
])
useBreadcrumbs(breadcrumbs)
</script>
