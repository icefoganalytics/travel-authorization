<template>
  <v-card
    class="mt-5"
    color="#fff2d5"
  >
    <v-card-title class="d-flex align-baseline">
      <h3>Pending Approvals</h3>
      <v-spacer />
      <RefreshTableButton @click="refreshTable" />
    </v-card-title>
    <v-card-text>
      <TravelAuthorizationsSupervisorDataTableServer
        ref="travelAuthorizationsSupervisorDataTable"
        :where="whereClause"
        route-query-suffix="PendingApprovals"
      />
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from "vue"

import { STATUSES } from "@/api/travel-authorizations-api"

import RefreshTableButton from "@/components/common/table/RefreshTableButton.vue"
import TravelAuthorizationsSupervisorDataTableServer from "@/components/travel-authorizations/manage/TravelAuthorizationsSupervisorDataTableServer.vue"

const whereClause = {
  status: STATUSES.SUBMITTED,
}

const travelAuthorizationsSupervisorDataTable = ref(null)

function refreshTable() {
  travelAuthorizationsSupervisorDataTable.value?.refresh()
}
</script>
