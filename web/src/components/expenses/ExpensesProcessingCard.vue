<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <h3 class="mb-0">Expenses</h3>

      <v-spacer />
      <RefreshTableButton @click="refreshTable" />
    </v-card-title>
    <v-card-text>
      <!-- TODO: add ability to filter by travel authorization -->
      <ExpensesProcessingDataTable
        ref="expensesProcessingDataTable"
        route-query-suffix="Expenses"
        @approved="emit('updated')"
        @rejected="emit('updated')"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from "vue"

import RefreshTableButton from "@/components/common/table/RefreshTableButton.vue"
import ExpensesProcessingDataTable from "@/components/expenses/ExpensesProcessingDataTable.vue"

const emit = defineEmits<{
  (event: "updated"): void
}>()

const expensesProcessingDataTable = ref<InstanceType<typeof ExpensesProcessingDataTable> | null>(
  null
)

function refreshTable() {
  expensesProcessingDataTable.value?.refresh()
}

defineExpose({
  refresh: refreshTable,
})
</script>
