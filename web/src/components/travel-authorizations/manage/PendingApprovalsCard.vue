<template>
  <v-card
    class="mt-5"
    color="#fff2d5"
  >
    <v-card-title class="d-flex align-center">
      <h3 class="d-flex align-top">
        Pending Approvals

        <v-icon
          class="ml-1"
          size="x-small"
        >
          mdi-help-circle-outline
        </v-icon>
        <v-tooltip
          activator="parent"
          text="Travel requests submitted by travellers awaiting supervisor approval."
        />
      </h3>

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

<script setup lang="ts">
import { useTemplateRef } from "vue"

import { TravelAuthorizationStatuses } from "@/api/travel-authorizations-api"

import RefreshTableButton from "@/components/common/table/RefreshTableButton.vue"
import TravelAuthorizationsSupervisorDataTableServer from "@/components/travel-authorizations/manage/TravelAuthorizationsSupervisorDataTableServer.vue"

const whereClause = {
  status: TravelAuthorizationStatuses.SUBMITTED,
}

const travelAuthorizationsSupervisorDataTable = useTemplateRef(
  "travelAuthorizationsSupervisorDataTable"
)

function refreshTable() {
  travelAuthorizationsSupervisorDataTable.value?.refresh()
}
</script>
