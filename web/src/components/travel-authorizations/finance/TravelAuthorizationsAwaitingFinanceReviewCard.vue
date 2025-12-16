<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <h3 class="mb-0">Travel Authorizations</h3>

      <v-spacer />
      <RefreshTableButton @click="refreshTable" />
    </v-card-title>
    <v-card-text>
      <TravelAuthorizationsAwaitingFinanceReviewDataTable
        ref="travelAuthorizationsDataTable"
        route-query-suffix="AwaitingFinanceReview"
      />
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref } from "vue"

import RefreshTableButton from "@/components/common/table/RefreshTableButton.vue"
import TravelAuthorizationsAwaitingFinanceReviewDataTable from "@/components/travel-authorizations/finance/TravelAuthorizationsAwaitingFinanceReviewDataTable.vue"

const travelAuthorizationsDataTable = ref(null)

function refreshTable() {
  travelAuthorizationsDataTable.value?.refresh()
}
</script>
