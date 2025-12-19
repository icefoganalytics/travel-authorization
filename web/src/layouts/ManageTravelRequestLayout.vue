<template>
  <div>
    <SummaryHeaderPanel
      ref="summaryHeaderPanel"
      :travel-authorization-id="travelAuthorizationIdAsNumber"
    />

    <v-tabs>
      <v-tab
        :to="{
          name: 'manage-travel-requests/ManageTravelRequestDetailsPage',
          params: {
            travelAuthorizationId,
          },
        }"
      >
        Details
      </v-tab>
      <v-tab
        :to="{
          name: 'manage-travel-requests/ManageTravelRequestEstimatesPage',
          params: {
            travelAuthorizationId,
          },
        }"
        >Estimate</v-tab
      >
      <v-tab
        :to="{
          name: 'manage-travel-requests/ManageTravelRequestExpensesPage',
          params: {
            travelAuthorizationId,
          },
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
          ref="travelAuthorizationActionLogsTable"
          :travel-authorization-id="travelAuthorizationIdAsNumber"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"

import useBreadcrumbs from "@/use/use-breadcrumbs"

import SummaryHeaderPanel from "@/components/travel-authorizations/SummaryHeaderPanel.vue"
import TravelAuthorizationActionLogsTable from "@/components/travel-authorization-action-logs/TravelAuthorizationActionLogsTable.vue"

const props = defineProps<{
  travelAuthorizationId: string
}>()

const travelAuthorizationIdAsNumber = computed(() => parseInt(props.travelAuthorizationId))

const summaryHeaderPanel = ref<InstanceType<typeof SummaryHeaderPanel> | null>(null)
const travelAuthorizationActionLogsTable = ref<InstanceType<
  typeof TravelAuthorizationActionLogsTable
> | null>(null)

async function refresh() {
  await summaryHeaderPanel.value?.refresh()
  await travelAuthorizationActionLogsTable.value?.refresh()
}

const breadcrumbs = ref([
  {
    text: "Manage Travel Requests",
    to: {
      name: "ManageTravelRequests",
    },
  },
])
useBreadcrumbs(breadcrumbs)
</script>
