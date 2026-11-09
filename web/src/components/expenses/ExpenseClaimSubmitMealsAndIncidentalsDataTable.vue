<template>
  <v-data-table
    :headers="headers"
    :items="expenses"
    :items-per-page="10"
    :loading="isLoading"
  >
    <template #item.date="{ value }">
      {{ formatDate(value, "d-LLLL-yyyy", { zone: "utc" }) }}
    </template>
    <template #item.cost="{ value }">
      {{ formatCurrency(value, "CAD", currencyFormatOptions) }}
    </template>
    <template #tfoot>
      <tfoot>
        <tr>
          <td :class="totalRowClasses"></td>
          <td :class="totalRowClasses">Total</td>
          <td :class="totalRowClasses">
            {{ formatCurrency(totalAmount, "CAD", currencyFormatOptions) }}
          </td>
        </tr>
      </tfoot>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import { sumBy } from "lodash"
import { computed, ref } from "vue"

import { formatCurrency, formatDate } from "@/utils/formatters"

import useExpenses, {
  ExpenseTypes,
  ExpenseExpenseTypes,
  type ExpenseQueryOptions,
} from "@/use/use-expenses"

const props = defineProps<{
  travelAuthorizationId: number
}>()

const expenseOptions = computed<ExpenseQueryOptions>(() => ({
  where: {
    travelAuthorizationId: props.travelAuthorizationId,
    type: ExpenseTypes.EXPENSE,
    expenseType: [ExpenseExpenseTypes.MEALS_AND_INCIDENTALS, ExpenseExpenseTypes.NON_TRAVEL_STATUS],
  },
}))
const { expenses, isLoading, fetch: refresh } = useExpenses(expenseOptions)

const headers = ref([
  { title: "Date", key: "date" },
  { title: "Description", key: "description" },
  { title: "Amount", key: "cost" },
])

const totalRowClasses = ref("text-start font-weight-bold text-uppercase")
const currencyFormatOptions = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}

// Will need to be calculated in the back-end if data is multi-page.
const totalAmount = computed(() => sumBy(expenses.value, "cost"))

defineExpose({
  refresh,
})
</script>
