<template>
  <v-card
    class="mt-5"
    color="#fff2d5"
  >
    <v-card-title class="d-flex align-center">
      <h3 class="d-flex align-top">
        Approved Upcoming Travel

        <v-icon
          class="ml-1"
          size="x-small"
        >
          mdi-help-circle-outline
        </v-icon>
        <v-tooltip
          activator="parent"
          text="Supervisor-approved travel with upcoming or active trips. Highlighted rows indicate the traveller is currently in transit."
        />
      </h3>

      <v-spacer />
      <RefreshTableButton @click="refreshTable" />
    </v-card-title>
    <v-card-text>
      <TravelAuthorizationsSupervisorDataTableServer
        ref="travelAuthorizationsSupervisorDataTable"
        :where="whereClause"
        :filters="filtersClause"
        route-query-suffix="ApprovedUpcomingTravel"
        :item-class="getRowClass"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { useTemplateRef } from "vue"

import { TravelAuthorizationStatuses } from "@/api/travel-authorizations-api"

import RefreshTableButton from "@/components/common/table/RefreshTableButton.vue"
import TravelAuthorizationsSupervisorDataTableServer from "@/components/travel-authorizations/manage/TravelAuthorizationsSupervisorDataTableServer.vue"
import { type TravelAuthorizationAsIndex } from "@/use/use-travel-authorizations"

const whereClause = {
  status: TravelAuthorizationStatuses.APPROVED,
}

const filtersClause = {
  isBeforeTripEnd: true,
}

const travelAuthorizationsSupervisorDataTable = useTemplateRef(
  "travelAuthorizationsSupervisorDataTable"
)

function refreshTable() {
  travelAuthorizationsSupervisorDataTable.value?.refresh()
}

function getRowClass(item: TravelAuthorizationAsIndex) {
  return item.isTravelling ? "highlight-row" : ""
}
</script>

<style>
.highlight-row {
  background-color: #d0e6d4;
  font-weight: bold;
}
</style>
