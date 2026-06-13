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
      <ReceiptAttributesPreviewDialog ref="receiptAttributesPreviewDialogRef" />
    </template>
    <template #item.date="{ value }">
      {{ formatDate(value, "d-LLLL-yyyy") }}
    </template>
    <template #item.cost="{ value }">
      {{ formatCurrency(value) }}
    </template>
    <template #item.actions="{ item }">
      <v-btn
        v-if="!isNil(item.receipt)"
        variant="outlined"
        @click="showReceiptAttributesPreviewDialog(item.receipt)"
      >
        View Receipt
      </v-btn>
      <span
        v-else
        class="text-error"
        >Receipt is missing</span
      >
    </template>
    <template #tfoot>
      <tfoot>
        <tr>
          <td
            :class="totalRowClasses"
            colspan="2"
          >
            <slot name="footerNote"></slot>
          </td>
          <td :class="totalRowClasses">Total</td>
          <td :class="totalRowClasses">{{ formatCurrency(summaries.totalCost) }}</td>
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
import { isNil } from "lodash"
import { computed, ref, useTemplateRef } from "vue"

import { formatCurrency, formatDate } from "@/utils/formatters"
import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"

import { type AttachmentAsReference } from "@/api/attachments-api"
import useExpenses, {
  type ExpenseFiltersOptions,
  type ExpenseWhereOptions,
  ExpenseTypes,
} from "@/use/use-expenses"

import ReceiptAttributesPreviewDialog from "@/components/expenses/receipt/ReceiptAttributesPreviewDialog.vue"

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

const expenseOptions = computed(() => ({
  where: {
    ...props.where,
    type: ExpenseTypes.EXPENSE,
  },
  filters: props.filters,
  order: order.value,
  perPage: perPage.value,
  page: page.value,
}))
const { expenses, totalCount, summaries, isLoading, refresh } = useExpenses(expenseOptions)

const receiptAttributesPreviewDialogRef = useTemplateRef("receiptAttributesPreviewDialogRef")

function showReceiptAttributesPreviewDialog(receipt: AttachmentAsReference) {
  receiptAttributesPreviewDialogRef.value?.open(receipt)
}

defineExpose({
  refresh,
})
</script>
