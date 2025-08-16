<template>
  <v-data-table
    :headers="headers"
    :items="expenses"
    :items-per-page="10"
    :loading="isLoading"
    class="elevation-2"
  >
    <template #top>
      <ExpenseEditDialog
        ref="editDialogRef"
        @saved="emitChangedAndRefresh"
      />
      <ExpenseDeleteDialog
        ref="deleteDialogRef"
        @deleted="emitChangedAndRefresh"
      />
    </template>
    <template #item.date="{ value }">
      {{ formatDate(value) }}
    </template>
    <template #item.cost="{ value }">
      {{ formatCurrency(value) }}
    </template>
    <template #item.actions="{ value: actions, item }">
      <div class="d-flex">
        <v-col class="d-flex justify-end">
          <v-btn
            v-if="actions.includes('edit')"
            color="secondary"
            @click="showEditDialog(item)"
            >Edit</v-btn
          >
        </v-col>
        <v-col class="d-flex justify-end">
          <AddReceiptButton
            v-if="item.fileSize === null"
            :expense-id="item.id"
            @uploaded="emitChangedAndRefresh"
          />
          <DownloadReceiptButton
            v-else
            :expense-id="item.id"
          />

          <v-btn
            v-if="actions.includes('delete')"
            icon
            class="ml-2"
            color="error"
            title="Delete"
            @click="showDeleteDialog(item)"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-col>
      </div>
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

<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { sumBy } from "lodash"
import { DateTime } from "luxon"
import { useRoute } from "vue2-helpers/vue-router"

import { MAX_PER_PAGE } from "@/api/base-api"
import useExpenses, { type Expense, Types, ExpenseTypes } from "@/use/use-expenses"

import AddReceiptButton from "@/components/expenses/edit-data-table/AddReceiptButton.vue"
import ExpenseDeleteDialog from "@/components/expenses/ExpenseDeleteDialog.vue"
import ExpenseEditDialog from "@/components/expenses/ExpenseEditDialog.vue"
import DownloadReceiptButton from "@/components/expenses/DownloadReceiptButton.vue"

const props = defineProps<{
  travelAuthorizationId: number
}>()

const emit = defineEmits<{
  // TODO: switch to `changed: [void]` syntax in vue 3
  (event: "changed"): void
}>()

const headers = ref([
  {
    text: "Expense Type",
    value: "expenseType",
  },
  {
    text: "Description",
    value: "description",
  },
  {
    text: "Date",
    value: "date",
  },
  {
    text: "Amount",
    value: "cost",
  },
  {
    text: "",
    value: "actions",
  },
])

const totalRowClasses = ref("text-start font-weight-bold text-uppercase")

const expensesQuery = computed(() => ({
  where: {
    travelAuthorizationId: props.travelAuthorizationId,
    type: Types.EXPENSE,
    expenseType: [ExpenseTypes.ACCOMMODATIONS, ExpenseTypes.TRANSPORTATION],
  },
  // TODO: add pagination
  perPage: MAX_PER_PAGE,
}))

const { expenses, isLoading, refresh } = useExpenses(expensesQuery)

// Will need to be calculated in the back-end if data is multi-page.
const totalAmount = computed(() => sumBy(expenses.value, "cost"))

onMounted(() => {
  showEditDialogForRouteQuery()
  showDeleteDialogForRouteQuery()
})

function emitChangedAndRefresh() {
  emit("changed")
  return refresh()
}

const deleteDialogRef = ref<InstanceType<typeof ExpenseDeleteDialog> | null>(null)
const editDialogRef = ref<InstanceType<typeof ExpenseEditDialog> | null>(null)

function showDeleteDialog(item: Expense) {
  deleteDialogRef.value?.show(item)
}

function showEditDialog(item: Expense) {
  editDialogRef.value?.show(item)
}

const route = useRoute()

function showEditDialogForRouteQuery() {
  const expenseId = parseInt(route.query.showEdit as string)
  if (isNaN(expenseId)) return

  const expense = expenses.value.find((expense) => expense.id === expenseId)
  if (!expense) return

  showEditDialog(expense)
}

function showDeleteDialogForRouteQuery() {
  const expenseId = parseInt(route.query.showDelete as string)
  if (isNaN(expenseId)) return

  const expense = expenses.value.find((expense) => expense.id === expenseId)
  if (!expense) return

  showDeleteDialog(expense)
}

function formatDate(date: string) {
  return DateTime.fromISO(date, { zone: "utc" }).toFormat("d-LLLL-yyyy")
}

function formatCurrency(amount: number) {
  const formatter = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  })
  return formatter.format(amount)
}
</script>
