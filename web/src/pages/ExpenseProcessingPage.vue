<template>
  <div>
    <v-card-title class="d-flex justify-space-between align-center py-0">
      <h2 class="mb-0">Expense Processing</h2>
    </v-card-title>
    <v-row>
      <v-col>
        <AwaitingFinanceReviewCard />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <ApprovedForTravelCard />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"

import useBreadcrumbs from "@/use/use-breadcrumbs"

import AwaitingFinanceReviewCard from "@/components/travel-authorizations/finance/AwaitingFinanceReviewCard.vue"
import ApprovedForTravelCard from "@/components/travel-authorizations/finance/ApprovedForTravelCard.vue"

const breadcrumbs = computed(() => [
  {
    title: "Expense Processing",
    to: {
      name: "ExpenseProcessingPage",
    },
  },
])
useBreadcrumbs(breadcrumbs)
</script>
