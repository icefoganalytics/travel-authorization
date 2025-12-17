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
      <ExpenseRejectDialog
        ref="expenseRejectDialogRef"
        @rejected="emitRejected"
      />
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
        class="ma-0"
        color="secondary"
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

    <!-- TODO: consider if table should only every show pending expenses? -->
    <template #item.approvedAt="{ item }">
      <v-chip
        v-if="!isNil(item.approvedAt)"
        color="success"
        text-color="white"
      >
        Approved
      </v-chip>
      <v-chip
        v-else
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
          class="ma-0 mr-2"
          color="success"
          :loading="isProcessingExpense(item.id)"
          @click.stop="approveExpense(item.id)"
        >
          <v-icon left> mdi-check </v-icon>
          Approve
        </v-btn>
        <v-btn
          v-if="!item.approvedAt"
          class="ma-0"
          color="error"
          :loading="isProcessingExpense(item.id)"
          @click.stop="openExpenseRejectDialog(item.id)"
        >
          <v-icon left> mdi-close </v-icon>
          Reject
        </v-btn>
      </div>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { isNil } from "lodash"

import blockedToTrueConfirm from "@/utils/blocked-to-true-confirm"
import { formatDate, formatCurrency } from "@/utils/formatters"
import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"

import api from "@/api"
import { type AttachmentAsReference } from "@/api/attachments-api"
import useExpenses, { ExpenseTypes } from "@/use/use-expenses"
import useSnack from "@/use/use-snack"

import ExpenseRejectDialog from "@/components/expenses/ExpenseRejectDialog.vue"
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
    width: "6.5rem",
  },
  {
    text: "Description",
    value: "description",
    sortable: false,
  },
  {
    text: "Expense Type",
    value: "expenseType",
  },
  {
    text: "Amount",
    value: "cost",
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
  },
  {
    text: "Actions",
    value: "actions",
    sortable: false,
    align: "center",
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
      type: ExpenseTypes.EXPENSE,
    },
    filters: props.filters,
    page: page.value,
    perPage: perPage.value,
  }
})

const { expenses, totalCount, isLoading, refresh } = useExpenses(expensesQuery)

const expenseRejectDialogRef = ref<InstanceType<typeof ExpenseRejectDialog> | null>(null)
const receiptAttributesPreviewDialogRef = ref<InstanceType<
  typeof ReceiptAttributesPreviewDialog
> | null>(null)

function showReceiptAttributesPreviewDialog(receipt: AttachmentAsReference) {
  receiptAttributesPreviewDialogRef.value?.open(receipt)
}

const isProcessingExpenseMap = ref(new Map<number, boolean>())
const snack = useSnack()

async function approveExpense(expenseId: number): Promise<void> {
  if (!blockedToTrueConfirm("Are you sure you want to approve this expense?")) return

  isProcessingExpenseMap.value.set(expenseId, true)
  try {
    await api.expenses.approveApi.create(expenseId)
    snack.success("Expense approved!")
    emit("approved", expenseId)
  } finally {
    isProcessingExpenseMap.value.set(expenseId, false)
  }
}

function openExpenseRejectDialog(expenseId: number): void {
  expenseRejectDialogRef.value?.open(expenseId)
}

function emitRejected(expenseId: number): void {
  emit("rejected", expenseId)
}

function isProcessingExpense(expenseId: number): boolean {
  return isProcessingExpenseMap.value.get(expenseId) ?? false
}

defineExpose({
  refresh,
})
</script>
