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
      <v-col cols="6">
        <div class="single-underline d-inline-block">
          {{ formatCurrency(travelAdvance) }}
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="6"
        class="text-right"
      >
        <strong>Total Claim:</strong>
      </v-col>
      <v-col cols="6">
        <div class="double-underline d-inline-block">
          <strong>
            {{ formatCurrency(totalClaim) }}
          </strong>
        </div>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup lang="ts">
import { computed, toRefs } from "vue"

import { formatCurrency } from "@/utils/formatters"

import useExpenses, { ExpenseTypes } from "@/use/use-expenses"
import useTravelAuthorization from "@/use/use-travel-authorization"

const props = defineProps<{
  travelAuthorizationId: number
}>()

const { travelAuthorizationId } = toRefs(props)
const { travelAuthorization, isLoading: isLoadingTravelAuthorization } =
  useTravelAuthorization(travelAuthorizationId)

const expenseOptions = computed(() => ({
  where: {
    travelAuthorizationId: props.travelAuthorizationId,
    type: ExpenseTypes.EXPENSE,
  },
}))
const { summaries, isLoading: isLoadingExpenses } = useExpenses(expenseOptions)

const isLoading = computed(() => isLoadingExpenses.value || isLoadingTravelAuthorization.value)
const subTotalClaim = computed(() => summaries.value.totalCost)
const travelAdvance = computed(() => {
  const travelAdvanceInCents = travelAuthorization.value?.travelAdvanceInCents ?? 0
  return Number(travelAdvanceInCents) / 100.0
})
const totalClaim = computed(() => subTotalClaim.value - travelAdvance.value)
</script>

<style scoped>
.single-underline {
  border-bottom: 1px solid;
}

.double-underline {
  border-bottom: 3px double;
}
</style>
