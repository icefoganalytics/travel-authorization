<template>
  <v-card class="mt-5">
    <v-card-title class="d-flex align-baseline">
      <h3>Expenses</h3>

      <v-spacer />
      <RefreshTableButton @click="refreshTable" />
    </v-card-title>
    <v-card-text>
      <ExpensesProcessingDataTable
        ref="expensesProcessingDataTable"
        route-query-suffix="ExpenseProcessing"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from "vue"

import RefreshTableButton from "@/components/common/table/RefreshTableButton.vue"
import ExpensesProcessingDataTable from "@/components/expenses/ExpensesProcessingDataTable.vue"

const expensesProcessingDataTable = ref<InstanceType<typeof ExpensesProcessingDataTable> | null>(
  null
)

function refreshTable() {
  expensesProcessingDataTable.value?.refresh()
}
</script>
