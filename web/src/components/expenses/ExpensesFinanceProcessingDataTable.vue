<template>
  <v-data-table
    v-bind="$attrs"
    :headers="headers"
    :items="expenses"
    :loading="isLoading"
    :items-per-page.sync="perPage"
    :page.sync="page"
    :server-items-length="totalCount"
    v-on="$listeners"
  >
    <template #top>
      <ReceiptAttributesPreviewDialog ref="receiptAttributesPreviewDialogRef" />
    </template>

    <template #item.date="{ value }">
      <span>{{ formatDate(value) }}</span>
    </template>

    <template #item.cost="{ item }">
      <span>{{ formatCurrency(item.cost, item.currency) }}</span>
    </template>

    <template #item.receipt="{ item }">
      <v-btn
        v-if="!isNil(item.receipt)"
        color="secondary"
        small
        @click.stop="showReceiptAttributesPreviewDialog(item.receipt)"
      >
        View Receipt
      </v-btn>
      <span
        v-else
        class="text--disabled"
      >
        No receipt
      </span>
    </template>

    <template #item.approvedAt="{ item }">
      <v-chip
        v-if="!isNil(item.approvedAt)"
        small
        color="success"
        text-color="white"
      >
        Approved
      </v-chip>
      <v-chip
        v-else
        small
        color="warning"
        text-color="white"
      >
        Pending
      </v-chip>
    </template>

    <template #item.actions="{ item }">
      <div class="d-flex align-center">
        <v-btn
          v-if="isNil(item.approvedAt)"
          small
          color="success"
          class="mr-2"
          :loading="isProcessingExpense(item.id)"
          @click.stop="approveExpense(item.id)"
        >
          <v-icon
            small
            left
          >
            mdi-check
          </v-icon>
          Approve
        </v-btn>
        <v-btn
          v-if="!item.approvedAt"
          small
          color="error"
          :loading="isProcessingExpense(item.id)"
          @click.stop="rejectExpense(item.id)"
        >
          <v-icon
            small
            left
          >
            mdi-close
          </v-icon>
          Reject
        </v-btn>
      </div>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { isNil } from "lodash"

import { formatDate, formatCurrency } from "@/utils/formatters"
import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import { type AttachmentAsReference } from "@/api/attachments-api"
import useExpenses, { Types } from "@/use/use-expenses"
import useSnack from "@/use/use-snack"

import ReceiptAttributesPreviewDialog from "@/components/expenses/receipt/ReceiptAttributesPreviewDialog.vue"

const props = withDefaults(
  defineProps<{
    where?: Record<string, unknown>
    filters?: Record<string, unknown>
    routeQuerySuffix?: string
  }>(),
  {
    where: () => ({}),
    filters: () => ({}),
    routeQuerySuffix: "",
  }
)

const emit = defineEmits<{
  (event: "approved", expenseId: number): void
  (event: "rejected", expenseId: number): void
}>()

const headers = ref([
  {
    text: "Date",
    value: "date",
    sortable: true,
  },
  {
    text: "Description",
    value: "description",
    sortable: false,
  },
  {
    text: "Expense Type",
    value: "expenseType",
    sortable: true,
  },
  {
    text: "Amount",
    value: "cost",
    sortable: true,
  },
  {
    text: "Receipt",
    value: "receipt",
    sortable: false,
    align: "center",
  },
  {
    text: "Status",
    value: "approvedAt",
    sortable: true,
  },
  {
    text: "Actions",
    value: "actions",
    sortable: false,
    align: "center",
    width: "220px",
  },
])

const page = useRouteQuery<string, number>(`page${props.routeQuerySuffix}`, "1", {
  transform: integerTransformer,
})
const perPage = useRouteQuery<string, number>(`perPage${props.routeQuerySuffix}`, "10", {
  transform: integerTransformer,
})

const expensesQuery = computed(() => {
  return {
    where: {
      ...props.where,
      type: Types.EXPENSE,
    },
    filters: props.filters,
    page: page.value,
    perPage: perPage.value,
  }
})

const { expenses, totalCount, isLoading, refresh } = useExpenses(expensesQuery)

const receiptAttributesPreviewDialogRef = ref<InstanceType<
  typeof ReceiptAttributesPreviewDialog
> | null>(null)

function showReceiptAttributesPreviewDialog(receipt: AttachmentAsReference) {
  receiptAttributesPreviewDialogRef.value?.open(receipt)
}

const isProcessingExpenseMap = ref(new Map<number, boolean>())
const snack = useSnack()

function approveExpense(expenseId: number): void {
  isProcessingExpenseMap.value.set(expenseId, true)
  try {
    // TODO: Call API to approve expense
    snack.success("TODO: Expense approved!")
    emit("approved", expenseId)
  } finally {
    isProcessingExpenseMap.value.set(expenseId, false)
  }
}

function rejectExpense(expenseId: number): void {
  isProcessingExpenseMap.value.set(expenseId, true)
  try {
    // TODO: Call API to reject expense
    snack.success("TODO: Expense rejected.")
    emit("rejected", expenseId)
  } finally {
    isProcessingExpenseMap.value.set(expenseId, false)
  }
}

function isProcessingExpense(expenseId: number): boolean {
  return isProcessingExpenseMap.value.get(expenseId) ?? false
}

defineExpose({
  refresh,
})
</script>
