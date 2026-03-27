<template>
  <v-data-table
    :headers="headers"
    :items="estimates"
    :items-per-page="10"
    :loading="isLoading"
  >
    <template #item.date="{ value }">
      {{ formatDate(value) }}
    </template>
    <template #item.cost="{ value }">
      {{ formatCurrency(value) }}
    </template>
    <template #foot>
      <tfoot>
        <tr>
          <td :class="totalRowClasses"></td>
          <td :class="totalRowClasses"></td>
          <td :class="totalRowClasses">Total</td>
          <td :class="totalRowClasses">{{ formatCurrency(totalAmount) }}</td>
          <td :class="totalRowClasses"></td>
        </tr>
      </tfoot>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { sumBy } from "lodash"

import { formatCurrency, formatDate } from "@/utils/formatters"

import useExpenses, { ExpenseTypes } from "@/use/use-expenses"

const props = defineProps<{
  travelAuthorizationId: number
}>()

const headers = ref([
  { text: "Expense Type", value: "expenseType" },
  { text: "Description", value: "description" },
  { text: "Date", value: "date" },
  { text: "Amount", value: "cost" },
])
const totalRowClasses = ref("text-start font-weight-bold text-uppercase")

const expenseOptions = computed(() => ({
  where: {
    travelAuthorizationId: props.travelAuthorizationId,
    type: ExpenseTypes.ESTIMATE,
  },
}))
const { expenses: estimates, isLoading } = useExpenses(expenseOptions)

// Will need to be calculated in the back-end if data is multi-page.
const totalAmount = computed(() => sumBy(estimates.value, "cost"))
</script>
