<template>
  <div>
    <SummaryHeaderPanel
      ref="summaryHeaderPanel"
      :travel-authorization-id="travelAuthorizationIdAsNumber"
    />

    <v-tabs>
      <v-tab
        :to="{
          name: 'travel-requests/TravelRequestDetailsPage',
          params: {
            travelAuthorizationId,
          },
        }"
      >
        Details
      </v-tab>
      <v-tab
        :to="{
          name: 'EditTravelAuthorizationEstimatePage',
          params: {
            travelAuthorizationId,
          },
        }"
        >Estimate</v-tab
      >
      <v-tab
        :to="{
          name: 'EditTravelAuthorizationExpensePage',
          params: { travelAuthorizationId },
        }"
      >
        Expense
      </v-tab>
      <!-- TODO: add in any tabs that you can normally see in manage mode -->
    </v-tabs>

    <router-view @updated="refresh"></router-view>

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
import { computed, ref } from "vue"

import useBreadcrumbs from "@/use/use-breadcrumbs"

import SummaryHeaderPanel from "@/components/travel-authorizations/SummaryHeaderPanel.vue"
import TravelAuthorizationActionLogsTable from "@/components/travel-authorization-action-logs/TravelAuthorizationActionLogsTable.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: String,
    required: true,
  },
})

const travelAuthorizationIdAsNumber = computed(() => parseInt(props.travelAuthorizationId))

/** @type {import('vue').Ref<InstanceType<typeof SummaryHeaderPanel> | null>} */
const summaryHeaderPanel = ref(null)

async function refresh() {
  await summaryHeaderPanel.value?.refresh()
}

useBreadcrumbs([
  {
    text: "Travel Requests",
    to: {
      name: "TravelRequests",
    },
  },
])
</script>
