<template>
  <v-card
    class="mt-5"
    color="#fff2d5"
  >
    <v-card-title class="d-flex align-baseline">
      <h3>Awaiting Expense Approval</h3>

      <v-spacer />
      <RefreshTableButton @click="refreshTable" />
    </v-card-title>
    <v-card-text>
      <TravelAuthorizationsSupervisorDataTable
        ref="travelAuthorizationsSupervisorDataTable"
        :where="whereClause"
        route-query-suffix="AwaitingExpenseApproval"
      />
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from "vue"

import { STATUSES } from "@/api/travel-authorizations-api"

import RefreshTableButton from "@/components/common/table/RefreshTableButton.vue"
import TravelAuthorizationsSupervisorDataTable from "@/components/travel-authorizations/manage/TravelAuthorizationsSupervisorDataTable.vue"

const whereClause = {
  status: STATUSES.EXPENSE_CLAIM_SUBMITTED,
}

const travelAuthorizationsSupervisorDataTable = ref(null)

function refreshTable() {
  travelAuthorizationsSupervisorDataTable.value?.refresh()
}
</script>
