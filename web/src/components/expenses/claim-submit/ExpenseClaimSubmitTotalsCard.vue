<template>
  <v-skeleton-loader
    v-if="isLoading"
    type="table-heading@3"
  />
  <v-card v-else>
    <v-row>
      <v-col
        cols="6"
        class="text-right"
        >Subtotal Claim:</v-col
      >
      <v-col cols="6">{{ formatCurrency(subTotalClaim) }}</v-col>
    </v-row>
    <v-row>
      <v-col
        cols="6"
        class="text-right"
        >Travel Advance:</v-col
      >
      <v-col cols="6">{{ formatCurrency(travelAdvance) }}</v-col>
    </v-row>
    <v-row class="mt-0">
      <v-col cols="6"></v-col>
      <v-col cols="6">
        <div class="border-solid border-t border-black w-16"></div>
      </v-col>
    </v-row>
    <v-row class="mt-0">
      <v-col
        cols="6"
        class="text-right"
      >
        <strong>Total Claim:</strong>
      </v-col>
      <v-col cols="6">
        <strong>
          {{ formatCurrency(totalClaim) }}
        </strong>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import { computed, onMounted, toRefs } from "vue"

import { formatCurrency } from "@/utils/formatters"

import useExpenses, { ExpenseTypes } from "@/use/use-expenses"
import useTravelAuthorization from "@/use/use-travel-authorization"

const props = defineProps<{
  travelAuthorizationId: number
}>()

const { travelAuthorizationId } = toRefs(props)
const {
  travelAuthorization,
  isLoading: isLoadingTravelAuthorization,
  fetch: fetchTravelAuthorization,
} = useTravelAuthorization(travelAuthorizationId)

const expenseOptions = computed(() => ({
  where: {
    travelAuthorizationId: travelAuthorizationId.value,
    type: ExpenseTypes.EXPENSE,
  },
  perPage: 1, // Only summaries are needed; totals include all matching expenses.
}))
const {
  summaries,
  isLoading: isLoadingExpenses,
  fetch: fetchExpenses,
} = useExpenses(expenseOptions)

const isLoading = computed(() => isLoadingExpenses.value || isLoadingTravelAuthorization.value)
const subTotalClaim = computed(() => summaries.value.totalCost)
const travelAdvance = computed(() => {
  const travelAdvanceInCents = travelAuthorization.value?.travelAdvanceInCents ?? 0
  return Number(travelAdvanceInCents) / 100.0
})
const totalClaim = computed(() => subTotalClaim.value - travelAdvance.value)

onMounted(async () => {
  await refresh()
})

async function refresh() {
  await Promise.all([await fetchExpenses(), await fetchTravelAuthorization()])
}

defineExpose({
  refresh,
})
</script>

<style scoped>
/* See https://tailwindcss.com/docs/border-width */
.border-solid {
  border-style: solid;
}
.border-t {
  border-width: 0px;
  border-top-width: 1px;
}

.border-black {
  border-color: rgb(0 0 0);
}

.w-16 {
  width: 4rem; /* 64px */
}
</style>
