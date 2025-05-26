<template>
  <div class="mt-4">
    <v-row>
      <v-col>
        <PurposeCard :travel-authorization-id="travelAuthorizationIdAsNumber">
          <template #header-actions>
            <v-btn
              class="my-0"
              color="primary"
              :to="{
                name: 'travel-requests/TravelRequestEditPurposeDetailsPage',
                params: {
                  travelAuthorizationId,
                },
              }"
            >
              Edit
            </v-btn>
          </template>
        </PurposeCard>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <DetailsCard :travel-authorization-id="travelAuthorizationIdAsNumber">
          <template #header-actions>
            <v-btn
              class="my-0"
              color="primary"
              :to="{
                name: 'travel-requests/TravelRequestEditTripDetailsRedirectByStatePage',
                params: {
                  travelAuthorizationId,
                },
              }"
            >
              Edit
            </v-btn>
          </template>
        </DetailsCard>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <ApprovalsCard
          ref="approvalsCard"
          :travel-authorization-id="travelAuthorizationIdAsNumber"
        >
          <template #header-actions>
            <v-btn
              class="my-0"
              color="primary"
              :to="{
                name: 'travel-requests/TravelRequestEditApprovalDetailsPage',
                params: {
                  travelAuthorizationId,
                },
              }"
            >
              Edit
            </v-btn>
          </template>
        </ApprovalsCard>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed } from "vue"

import useBreadcrumbs from "@/use/use-breadcrumbs"

import PurposeCard from "@/components/travel-authorizations/PurposeCard.vue"
import DetailsCard from "@/components/travel-authorizations/DetailsCard.vue"
import ApprovalsCard from "@/components/travel-authorizations/ApprovalsCard.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: [String, Number],
    required: true,
  },
})

const travelAuthorizationIdAsNumber = computed(() => parseInt(props.travelAuthorizationId))

useBreadcrumbs([
  {
    text: "Travel Requests",
    to: {
      name: "TravelRequests",
    },
  },
  {
    text: "Details",
    to: {
      name: "travel-requests/TravelRequestDetailsPage",
      params: {
        travelAuthorizationId: props.travelAuthorizationId,
      },
    },
  },
])
</script>
