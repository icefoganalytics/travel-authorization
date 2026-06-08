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
          name: 'expense-processing/ExpenseProcessingExpensesPage',
          params: {
            travelAuthorizationId,
          },
        }"
      >
        Expense
      </v-tab>
    </v-tabs>

    <SummaryHeaderPanel
      ref="summaryHeaderPanel"
      :travel-authorization-id="travelAuthorizationIdAsNumber"
      class="mt-4"
    />

    <router-view v-slot="{ Component }">
      <div class="mt-6">
        <component
          :is="Component"
          @updated="refresh"
        />
      </div>
    </router-view>

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
import { computed, useTemplateRef } from "vue"

import useBreadcrumbs from "@/use/use-breadcrumbs"

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
