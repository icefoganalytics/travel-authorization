<template>
  <v-card
    class="mt-5"
    color="#fff2d5"
  >
    <v-card-title class="d-flex align-center">
      <h3 class="d-flex align-top">
        Approved for Travel

        <v-icon
          class="ml-1"
          size="x-small"
        >
          mdi-help-circle-outline
        </v-icon>
        <v-tooltip
          activator="parent"
          text="Travel requests approved for travel by a supervisor."
        />
      </h3>

      <v-spacer />
      <RefreshTableButton @click="refreshTable" />
    </v-card-title>

    <v-card-text>
      <TravelAuthorizationsFinanceDataTableServer
        ref="travelAuthorizationsFinanceDataTable"
        :where="whereClause"
        route-query-suffix="ApprovedForTravel"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, useTemplateRef } from "vue"

import { TravelAuthorizationStatuses } from "@/api/travel-authorizations-api"

import RefreshTableButton from "@/components/common/table/RefreshTableButton.vue"
import TravelAuthorizationsFinanceDataTableServer from "@/components/travel-authorizations/finance/TravelAuthorizationsFinanceDataTableServer.vue"

const whereClause = computed(() => ({
  status: TravelAuthorizationStatuses.APPROVED,
}))

const travelAuthorizationsFinanceDataTable = useTemplateRef("travelAuthorizationsFinanceDataTable")

function refreshTable() {
  travelAuthorizationsFinanceDataTable.value?.refresh()
}
</script>
