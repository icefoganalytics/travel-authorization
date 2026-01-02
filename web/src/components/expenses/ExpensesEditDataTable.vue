<template>
  <v-data-table
    :page.sync="page"
    :items-per-page.sync="perPage"
    :sort-by.sync="vuetify2SortBy"
    :sort-desc.sync="vuetify2SortDesc"
    :headers="headers"
    :items="expenses"
    :loading="isLoading"
    :server-items-length="totalCount"
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
      <ReceiptGenericPreviewDialog
        ref="receiptGenericPreviewDialogRef"
        @deleted="emitChangedAndRefresh"
      />
      <ReceiptImagePreviewDialog
        ref="receiptImagePreviewDialogRef"
        @deleted="emitChangedAndRefresh"
      />
      <ReceiptPdfPreviewDialog
        ref="receiptPdfPreviewDialogRef"
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
            @click="showEditDialog(item.id)"
            >Edit</v-btn
          >
        </v-col>
        <v-col class="d-flex justify-end">
          <AddReceiptButtonForm
            v-if="isNil(item.receipt)"
            class="ml-2"
            :expense-id="item.id"
            @uploaded="emitChangedAndRefresh"
          />
          <v-btn
            v-else
            color="secondary"
            @click="showReceiptPreviewDialog(item.receipt.mimeType, item.id)"
          >
            View Receipt
          </v-btn>

          <v-btn
            v-if="actions.includes('delete')"
            icon
            class="ml-2"
            color="error"
            title="Delete"
            @click="showDeleteDialog(item.id)"
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
import { computed, ref } from "vue"
import { isNil, sumBy } from "lodash"
import { DateTime } from "luxon"

import { formatCurrency } from "@/utils/formatters"
import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import useVuetify2SortByShim from "@/use/utils/use-vuetify2-sort-by-shim"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"

import useExpenses, {
  type ExpenseFiltersOptions,
  type ExpenseWhereOptions,
  ExpenseTypes,
} from "@/use/use-expenses"

import AddReceiptButtonForm from "@/components/expenses/edit-data-table/AddReceiptButtonForm.vue"
import ExpenseDeleteDialog from "@/components/expenses/ExpenseDeleteDialog.vue"
import ExpenseEditDialog from "@/components/expenses/ExpenseEditDialog.vue"
import ReceiptGenericPreviewDialog from "@/components/expenses/receipt/ReceiptGenericPreviewDialog.vue"
import ReceiptImagePreviewDialog from "@/components/expenses/receipt/ReceiptImagePreviewDialog.vue"
import ReceiptPdfPreviewDialog from "@/components/expenses/receipt/ReceiptPdfPreviewDialog.vue"

const props = withDefaults(
  defineProps<{
    where?: ExpenseWhereOptions
    filters?: ExpenseFiltersOptions
    routeQuerySuffix?: string
  }>(),
  {
    where: () => ({}),
    filters: () => ({}),
    routeQuerySuffix: "",
  }
)

// TODO: switch to `changed: [void]` syntax in vue 3
const emit = defineEmits<{
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
    text: "Actions",
    value: "actions",
    sortable: false,
    align: "center",
  },
])

const totalRowClasses = ref("text-start font-weight-bold text-uppercase")

const page = useRouteQuery<string | undefined, number | undefined>(
  `page${props.routeQuerySuffix}`,
  "1",
  {
    transform: integerTransformer,
  }
)
const perPage = useRouteQuery<string | undefined, number | undefined>(
  `perPage${props.routeQuerySuffix}`,
  "10",
  {
    transform: integerTransformer,
  }
)
const sortBy = useVuetifySortByToSafeRouteQuery(`sortBy${props.routeQuerySuffix}`, [
  {
    key: "date",
    order: "asc",
  },
  {
    key: "expenseType",
    order: "asc",
  },
])
const { vuetify2SortBy, vuetify2SortDesc } = useVuetify2SortByShim(sortBy)
const order = useVuetifySortByToSequelizeSafeOrder(sortBy)

const expensesQuery = computed(() => ({
  where: {
    ...props.where,
    type: ExpenseTypes.EXPENSE,
  },
  filters: props.filters,
  order: order.value,
  perPage: perPage.value,
  page: page.value,
}))

const { expenses, totalCount, isLoading, refresh } = useExpenses(expensesQuery)

// Will need to be calculated in the back-end if data is multi-page.
const totalAmount = computed(() => sumBy(expenses.value, "cost"))

function emitChangedAndRefresh() {
  emit("changed")
  return refresh()
}

const deleteDialogRef = ref<InstanceType<typeof ExpenseDeleteDialog> | null>(null)

function showDeleteDialog(expenseId: number) {
  deleteDialogRef.value?.show(expenseId)
}

const editDialogRef = ref<InstanceType<typeof ExpenseEditDialog> | null>(null)

function showEditDialog(expenseId: number) {
  editDialogRef.value?.show(expenseId)
}

const receiptGenericPreviewDialogRef = ref<InstanceType<typeof ReceiptGenericPreviewDialog> | null>(
  null
)
const receiptImagePreviewDialogRef = ref<InstanceType<typeof ReceiptImagePreviewDialog> | null>(
  null
)
const receiptPdfPreviewDialogRef = ref<InstanceType<typeof ReceiptPdfPreviewDialog> | null>(null)

function showReceiptPreviewDialog(mimeType: string | undefined, expenseId: number) {
  switch (mimeType) {
    case "image/jpeg":
    case "image/png":
    case "image/gif":
      receiptImagePreviewDialogRef.value?.show(expenseId)
      break
    case "application/pdf":
      receiptPdfPreviewDialogRef.value?.show(expenseId)
      break
    default:
      receiptGenericPreviewDialogRef.value?.show(expenseId)
      break
  }
}

function formatDate(date: string) {
  return DateTime.fromISO(date, { zone: "utc" }).toFormat("d-LLLL-yyyy")
}

defineExpose({
  refresh,
})
</script>
