<template>
  <div>
    <v-tabs>
      <v-tab
        :to="{
          name: 'expense-processing/ExpenseProcessingDetailsPage',
          params: {
            travelAuthorizationId,
          },
        }"
      >
        Details
      </v-tab>
      <v-tab
        :to="{
          name: 'expense-processing/ExpenseProcessingEstimatesPage',
          params: {
            travelAuthorizationId,
          },
        }"
      >
        Estimates
      </v-tab>
      <v-tab
        :to="{
          name: 'expense-processing/ExpenseProcessingExpensesPage',
          params: {
            travelAuthorizationId,
          },
        }"
      >
        Expenses
      </v-tab>
    </v-tabs>

    <SummaryHeaderPanel
      ref="summaryHeaderPanel"
      :travel-authorization-id="travelAuthorizationIdAsNumber"
      class="mt-6"
    />

    <router-view v-slot="{ Component }">
      <div class="mt-6">
        <component
          :is="Component"
          @updated="refresh"
        />
      </div>
    </router-view>

    <HeaderActionsCard
      title="Logs"
      class="mt-6"
    >
      <TravelAuthorizationActionLogsTable
        ref="travelAuthorizationActionLogsTable"
        :travel-authorization-id="travelAuthorizationIdAsNumber"
      />
    </HeaderActionsCard>
  </div>
</template>

<script setup lang="ts">
import { computed, useTemplateRef } from "vue"

import useBreadcrumbs from "@/use/use-breadcrumbs"

import HeaderActionsCard from "@/components/common/HeaderActionsCard.vue"
import SummaryHeaderPanel from "@/components/travel-authorizations/SummaryHeaderPanel.vue"
import TravelAuthorizationActionLogsTable from "@/components/travel-authorization-action-logs/TravelAuthorizationActionLogsTable.vue"

const props = defineProps<{
  travelAuthorizationId: string
}>()

const travelAuthorizationIdAsNumber = computed(() => parseInt(props.travelAuthorizationId))

const summaryHeaderPanel = useTemplateRef("summaryHeaderPanel")
const travelAuthorizationActionLogsTable = useTemplateRef("travelAuthorizationActionLogsTable")

async function refresh() {
  await summaryHeaderPanel.value?.refresh()
  await travelAuthorizationActionLogsTable.value?.refresh()
}

const breadcrumbs = computed(() => [
  {
    title: "Expense Processing",
    to: {
      name: "ExpenseProcessingPage",
    },
  },
])
useBreadcrumbs(breadcrumbs)
</script>
