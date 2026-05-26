<template>
  <v-data-table-server
    v-model:page="page"
    v-model:items-per-page="perPage"
    v-model:sort-by="sortBy"
    :headers="headers"
    :items="expenses"
    :loading="isLoading"
    :items-length="totalCount"
  >
    <template #top>
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
    <template #item.actions="{ item }">
      <div class="d-flex">
        <AddReceiptButtonForm
          v-if="isNil(item.receipt)"
          :expense-id="item.id"
          :button-props="{
            class: 'min-w-[9rem]',
          }"
          @uploaded="emitChangedAndRefresh"
        />
        <v-btn
          v-else
          variant="outlined"
          class="min-w-[9rem]"
          @click="showReceiptPreviewDialog(item.receipt.mimeType, item.id)"
        >
          View Receipt
        </v-btn>
      </div>
    </template>
    <template #tfoot>
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
  </v-data-table-server>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { isNil, sumBy } from "lodash"
import { DateTime } from "luxon"

import { formatCurrency } from "@/utils/formatters"
import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"

import useExpenses, {
  type ExpenseFiltersOptions,
  type ExpenseWhereOptions,
  ExpenseTypes,
} from "@/use/use-expenses"

import AddReceiptButtonForm from "@/components/expenses/edit-data-table/AddReceiptButtonForm.vue"
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

const emit = defineEmits<{
  changed: [void]
}>()

const headers = ref([
  {
    title: "Expense Type",
    key: "expenseType",
  },
  {
    title: "Description",
    key: "description",
  },
  {
    title: "Date",
    key: "date",
  },
  {
    title: "Amount",
    key: "cost",
  },
  {
    title: "Actions",
    key: "actions",
    sortable: false,
    align: "center" as const,
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

<style scoped>
:deep(.min-w-\[9rem\]) {
  min-width: 9rem;
}
</style>
