<template>
  <div>
    <div class="d-flex justify-space-between align-baseline">
      <h2>Expense Processing</h2>
    </div>
    <v-row>
      <v-col>
        <ExpensesFinanceProcessingCard class="default" />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import useBreadcrumbs from "@/use/use-breadcrumbs"

import ExpensesFinanceProcessingCard from "@/components/expenses/ExpensesFinanceProcessingCard.vue"
useBreadcrumbs([
  {
    text: "Expense Processing",
    to: {
      name: "ExpenseProcessingPage",
    },
  },
])
</script>
