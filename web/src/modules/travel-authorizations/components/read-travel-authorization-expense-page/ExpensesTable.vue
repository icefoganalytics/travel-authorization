<template>
  <v-data-table
    :headers="headers"
    :items="expenses"
    :items-per-page="10"
    :loading="isLoading"
    class="elevation-2"
  >
    <template #item.date="{ value }">
      {{ formatDate(value) }}
    </template>
    <template #item.cost="{ value }">
      {{ formatCurrency(value) }}
    </template>
    <template #item.actions="{ item }">
      <DownloadReceiptButton
        v-if="item.fileSize"
        :expense-id="item.id"
      />
      <span
        v-else
        class="text-error"
        >Receipt is missing</span
      >
    </template>
    <template #foot>
      <tfoot>
        <tr>
          <td
            :class="totalRowClasses"
            colspan="2"
          ></td>
          <td :class="totalRowClasses">Total</td>
          <td :class="totalRowClasses">{{ formatCurrency(totalAmount) }}</td>
          <td
            :class="totalRowClasses"
            colspan="1"
          ></td>
        </tr>
      </tfoot>
    </template>
  </v-data-table>
</template>

<script setup>
import { sumBy } from "lodash"
import { DateTime } from "luxon"
import { computed, ref } from "vue"

import useExpenses, { TYPES, EXPENSE_TYPES } from "@/use/use-expenses"

import DownloadReceiptButton from "@/components/expenses/DownloadReceiptButton.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

const headers = ref([
  { text: "Expense Type", value: "expenseType" },
  { text: "Description", value: "description" },
  { text: "Date", value: "date" },
  { text: "Amount", value: "cost" },
  { text: "", value: "actions" },
])
const totalRowClasses = ref("text-start font-weight-bold text-uppercase")

const expenseOptions = computed(() => ({
  where: {
    travelAuthorizationId: props.travelAuthorizationId,
    type: TYPES.EXPENSE,
    expenseType: [EXPENSE_TYPES.ACCOMMODATIONS, EXPENSE_TYPES.TRANSPORTATION],
  },
}))
const { expenses, isLoading } = useExpenses(expenseOptions)

const totalAmount = computed(() => sumBy(expenses.value, "cost"))

function formatDate(date) {
  return DateTime.fromISO(date, { zone: "utc" }).toFormat("d-LLLL-yyyy")
}

function formatCurrency(amount) {
  const formatter = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  })
  return formatter.format(amount)
}
</script>
