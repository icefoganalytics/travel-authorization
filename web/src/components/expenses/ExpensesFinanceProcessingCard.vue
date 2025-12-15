<template>
  <v-card class="mt-5">
    <v-card-title class="d-flex align-baseline">
      <h3>Expenses</h3>

      <v-spacer />
      <RefreshTableButton @click="refreshTable" />
    </v-card-title>
    <v-card-text>
      <ExpensesFinanceProcessingDataTable
        ref="expensesDataTable"
        route-query-suffix="ExpenseProcessing"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from "vue"

import RefreshTableButton from "@/components/common/table/RefreshTableButton.vue"
import ExpensesFinanceProcessingDataTable from "@/components/expenses/ExpensesFinanceProcessingDataTable.vue"

const expensesDataTable = ref<InstanceType<typeof ExpensesFinanceProcessingDataTable> | null>(null)

function refreshTable() {
  expensesDataTable.value?.refresh()
}
</script>
