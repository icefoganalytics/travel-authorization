<template>
  <div>
    <div class="d-flex justify-space-between align-baseline">
      <h2>Expense Processing</h2>
    </div>
    <v-row class="mt-2">
      <v-col>
        <ExpensesProcessingCard
          ref="expensesProcessingCardRef"
          class="default"
          @updated="refreshTravelAuthorizationsExpenseClaimApprovedCard"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <TravelAuthorizationsExpenseClaimApprovedCard
          ref="travelAuthorizationsExpenseClaimApprovedCardRef"
          class="default mt-5"
          @updated="refreshExpenseProcessingCard"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"

import useBreadcrumbs from "@/use/use-breadcrumbs"

import ExpensesProcessingCard from "@/components/expenses/ExpensesProcessingCard.vue"
import TravelAuthorizationsExpenseClaimApprovedCard from "@/components/travel-authorizations/finance/TravelAuthorizationsExpenseClaimApprovedCard.vue"

const expensesProcessingCardRef = ref<InstanceType<typeof ExpensesProcessingCard> | null>(null)

function refreshExpenseProcessingCard() {
  expensesProcessingCardRef.value?.refresh()
}

const travelAuthorizationsExpenseClaimApprovedCardRef = ref<InstanceType<
  typeof TravelAuthorizationsExpenseClaimApprovedCard
> | null>(null)

function refreshTravelAuthorizationsExpenseClaimApprovedCard() {
  travelAuthorizationsExpenseClaimApprovedCardRef.value?.refresh()
}

const breadcrumbs = computed(() => [
  {
    text: "Expense Processing",
    to: {
      name: "ExpenseProcessingPage",
    },
  },
])
useBreadcrumbs(breadcrumbs)
</script>
