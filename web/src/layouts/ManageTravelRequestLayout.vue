<template>
  <div>
    <SummaryHeaderPanel :travel-authorization-id="travelAuthorizationIdAsNumber" />

    <v-tabs>
      <DetailsTab :travel-authorization-id="travelAuthorizationIdAsNumber" />
      <EstimateTab :travel-authorization-id="travelAuthorizationIdAsNumber" />
      <ExpenseTab :travel-authorization-id="travelAuthorizationIdAsNumber" />
      <!-- TODO: add in any tabs that you can normally see in manage mode -->

      <v-spacer />
      <div class="d-flex align-end">
        <v-tooltip bottom>
          <template #activator="{ on, attrs }">
            <v-btn
              v-if="isAdmin"
              class="my-0"
              color="primary"
              v-bind="attrs"
              v-on="on"
              @click="goToAdminEditPage"
            >
              Edit
              <v-icon
                small
                right
              >
                mdi-help-circle-outline
              </v-icon>
            </v-btn>
          </template>
          <span>You can edit this because you are an admin.</span>
        </v-tooltip>
      </div>
    </v-tabs>

    <router-view></router-view>

    <v-row class="mt-md-10 mt-5">
      <v-col>
        <TravelAuthorizationActionLogsTable
          :travel-authorization-id="travelAuthorizationIdAsNumber"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { useRouter } from "vue2-helpers/vue-router"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useCurrentUser from "@/use/use-current-user"

import SummaryHeaderPanel from "@/components/travel-authorizations/SummaryHeaderPanel.vue"

import DetailsTab from "@/modules/travel-authorizations/components/manage-travel-authorization-layout/DetailsTab.vue"
import EstimateTab from "@/modules/travel-authorizations/components/manage-travel-authorization-layout/EstimateTab.vue"
import ExpenseTab from "@/modules/travel-authorizations/components/manage-travel-authorization-layout/ExpenseTab.vue"

import TravelAuthorizationActionLogsTable from "@/modules/travel-authorizations/components/TravelAuthorizationActionLogsTable.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: String,
    required: true,
  },
})

const travelAuthorizationIdAsNumber = computed(() => parseInt(props.travelAuthorizationId))
const { isAdmin } = useCurrentUser()

const router = useRouter()

function goToAdminEditPage() {
  return router.push({
    name: "EditTravelAuthorizationDetailsPage",
    params: {
      travelAuthorizationId: props.travelAuthorizationId,
    },
  })
}

useBreadcrumbs([
  {
    text: "Manage Travel Requests",
    to: {
      name: "ManageTravelRequests",
    },
  },
])
</script>
