<template>
  <v-card
    class="mt-5"
    color="#fff2d5"
  >
    <v-card-title class="d-flex align-baseline">
      <h3>Approved Upcoming Travel</h3>

      <v-tooltip top>
        <template #activator="{ on, attrs }">
          <v-icon
            class="ml-2"
            color="black"
            v-bind="attrs"
            v-on="on"
          >
            mdi-help-circle-outline
          </v-icon>
        </template>
        <span>Highlighted rows indicate where the traveller is currently in transit.</span>
      </v-tooltip>

      <v-spacer />
      <RefreshTableButton @click="refreshTable" />
    </v-card-title>
    <v-card-text>
      <TravelAuthorizationsSupervisorDataTable
        ref="travelAuthorizationsSupervisorDataTable"
        :where="whereClause"
        :filters="filtersClause"
        route-query-suffix="ApprovedUpcomingTravel"
        :item-class="getRowClass"
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
  status: STATUSES.APPROVED,
}

const filtersClause = {
  isBeforeTripEnd: true,
}

const travelAuthorizationsSupervisorDataTable = ref(null)

function refreshTable() {
  travelAuthorizationsSupervisorDataTable.value?.refresh()
}

function getRowClass(item) {
  return item.isTravelling ? "highlight-row" : ""
}
</script>

<style>
.highlight-row {
  background-color: #d0e6d4;
  font-weight: bold;
}
</style>
