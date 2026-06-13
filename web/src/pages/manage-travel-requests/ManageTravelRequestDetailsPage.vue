<template>
  <div>
    <v-row>
      <v-col>
        <PurposeCard :travel-authorization-id="travelAuthorizationIdAsNumber">
          <template #header-actions>
            <v-btn
              class="my-0"
              color="primary"
              :to="{
                name: 'manage-travel-requests/ManageTravelRequestEditPurposeDetailsPage',
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
                name: 'manage-travel-requests/ManageTravelRequestEditTripDetailsRedirectByStatePage',
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
        <ApprovalsCard :travel-authorization-id="travelAuthorizationIdAsNumber">
          <template #header-actions>
            <v-btn
              class="my-0"
              color="primary"
              :to="{
                name: 'manage-travel-requests/ManageTravelRequestEditApprovalDetailsPage',
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
    <v-row v-if="travelAuthorization?.isSubmitted">
      <v-col>
        <ManagementCard
          :travel-authorization-id="travelAuthorizationIdAsNumber"
          @approved="goToManageTravelRequests"
          @denied="goToManageTravelRequests"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useRouter } from "vue-router"

import useTravelAuthorization from "@/use/use-travel-authorization"
import useBreadcrumbs from "@/use/use-breadcrumbs"

import PurposeCard from "@/components/travel-authorizations/PurposeCard.vue"
import DetailsCard from "@/components/travel-authorizations/DetailsCard.vue"
import ApprovalsCard from "@/components/travel-authorizations/ApprovalsCard.vue"

import ManagementCard from "@/modules/travel-authorizations/components/manage-travel-authorization-details-page/ManagementCard.vue"

const props = defineProps<{
  travelAuthorizationId: string
}>()

const travelAuthorizationIdAsNumber = computed(() => parseInt(props.travelAuthorizationId))

const { travelAuthorization } = useTravelAuthorization(travelAuthorizationIdAsNumber)

const router = useRouter()

async function goToManageTravelRequests() {
  await router.push({
    name: "ManageTravelRequests",
  })
}

useBreadcrumbs([
  {
    title: "Manage Travel Requests",
    to: {
      name: "ManageTravelRequests",
    },
  },
  {
    title: "Details",
    to: {
      name: "manage-travel-requests/ManageTravelRequestDetailsPage",
      params: {
        travelAuthorizationId: props.travelAuthorizationId,
      },
    },
  },
])
</script>
