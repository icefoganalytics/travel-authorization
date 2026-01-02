<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <h3 class="mb-0">Travel Authorizations</h3>

      <v-spacer />
      <RefreshTableButton @click="refreshTable" />
    </v-card-title>
    <v-card-text>
      <TravelAuthorizationsExpenseClaimApprovedDataTable
        ref="travelAuthorizationsDataTable"
        route-query-suffix="TravelAuthorization"
        @expensed="emit('updated')"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from "vue"

import RefreshTableButton from "@/components/common/table/RefreshTableButton.vue"
import TravelAuthorizationsExpenseClaimApprovedDataTable from "@/components/travel-authorizations/finance/TravelAuthorizationsExpenseClaimApprovedDataTable.vue"

const emit = defineEmits<{
  (event: "updated"): void
}>()

const travelAuthorizationsDataTable = ref<InstanceType<
  typeof TravelAuthorizationsExpenseClaimApprovedDataTable
> | null>(null)

function refreshTable() {
  travelAuthorizationsDataTable.value?.refresh()
}

defineExpose({
  refresh: refreshTable,
})
</script>
