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
                name: 'manage-travel-requests/ManageTravelRequestDetailsEditPurposePage',
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
                name: 'manage-travel-requests/ManageTravelRequestDetailsEditTripDetailsEstimatesPage',
                params: {
                  travelAuthorizationId: travelAuthorizationIdAsNumber,
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
                name: 'EditTravelAuthorizationDetailsPage',
                params: {
                  travelAuthorizationId: travelAuthorizationIdAsNumber,
                },
              }"
            >
              Edit
            </v-btn>
          </template>
        </ApprovalsCard>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <ManagementCard
          :travel-authorization-id="travelAuthorizationIdAsNumber"
          @approved="refresh"
          @denied="refresh"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed, ref } from "vue"

import useBreadcrumbs from "@/use/use-breadcrumbs"

import PurposeCard from "@/components/travel-authorizations/PurposeCard.vue"
import DetailsCard from "@/components/travel-authorizations/DetailsCard.vue"
import ApprovalsCard from "@/components/travel-authorizations/ApprovalsCard.vue"

import ManagementCard from "@/modules/travel-authorizations/components/manage-travel-authorization-details-page/ManagementCard.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: [String, Number],
    required: true,
  },
})

const travelAuthorizationIdAsNumber = computed(() => parseInt(props.travelAuthorizationId))

/** @type {import('vue').Ref<InstanceType<typeof ApprovalsCard> | null>} */
const approvalsCard = ref(null)

function refresh() {
  approvalsCard.value.refresh()
}

useBreadcrumbs([
  {
    text: "Manage Travel Requests",
    to: {
      name: "ManageTravelRequests",
    },
  },
  {
    text: "Details",
    to: {
      name: "manage-travel-requests/ManageTravelRequestDetailsPage",
      params: {
        travelAuthorizationId: travelAuthorizationIdAsNumber,
      },
    },
  },
])
</script>
