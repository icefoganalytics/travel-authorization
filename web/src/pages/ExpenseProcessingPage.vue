<template>
  <div>
    <div class="d-flex justify-space-between align-baseline">
      <h2>Expense Processing</h2>
    </div>
    <v-row class="mt-2">
      <v-col>
        <ExpensesProcessingCard class="default" />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <TravelAuthorizationsExpenseClaimApprovedCard class="default mt-5" />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import useBreadcrumbs from "@/use/use-breadcrumbs"

import ExpensesProcessingCard from "@/components/expenses/ExpensesProcessingCard.vue"
import TravelAuthorizationsExpenseClaimApprovedCard from "@/components/travel-authorizations/finance/TravelAuthorizationsExpenseClaimApprovedCard.vue"

useBreadcrumbs([
  {
    text: "Expense Processing",
    to: {
      name: "ExpenseProcessingPage",
    },
  },
])
</script>
