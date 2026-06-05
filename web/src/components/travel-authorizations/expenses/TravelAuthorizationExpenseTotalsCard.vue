<template>
  <v-skeleton-loader
    v-if="isLoading"
    type="table-heading@3"
  />
  <v-card
    v-else
    class="pa-6"
  >
    <table class="accounting-totals">
      <tbody>
        <tr>
          <th scope="row">Subtotal Claim:</th>
          <td>{{ formatCurrency(subTotalClaim) }}</td>
        </tr>
        <tr>
          <th scope="row">Travel Advance:</th>
          <td>
            <span class="single-underline">
              {{ formatCurrency(travelAdvance, "CAD", { style: "decimal" }) }}
            </span>
          </td>
        </tr>
        <tr class="accounting-total">
          <th scope="row">Total Claim:</th>
          <td>
            <span class="double-underline">
              {{ formatCurrency(totalClaim) }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
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
.accounting-totals {
  border-collapse: separate;
  border-spacing: 0 1rem;
  margin: 0 auto;
}

.accounting-totals th {
  font-weight: normal;
  padding-right: 0.75rem;
  text-align: right;
}

.accounting-totals td {
  font-variant-numeric: tabular-nums;
  text-align: right;
  white-space: nowrap;
}

.accounting-total th,
.accounting-total td {
  font-weight: bold;
}

.single-underline,
.double-underline {
  display: inline-block;
}

.single-underline {
  border-bottom: 1px solid;
}

.double-underline {
  border-bottom: 3px double;
}
</style>
