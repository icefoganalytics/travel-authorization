<template>
  <v-data-table-server
    v-model:page="page"
    v-model:items-per-page="perPage"
    v-model:sort-by="sortBy"
    :headers="headers"
    :items="estimates"
    :items-length="totalCount"
    :loading="isLoading"
    multi-sort
  >
    <template #item.date="{ value }">
      {{ formatDate(value) }}
    </template>
    <template #item.cost="{ value }">
      {{ formatCurrency(value) }}
    </template>
    <template #tfoot>
      <tfoot>
        <tr>
          <td></td>
          <td></td>
          <td class="text-start font-weight-bold text-uppercase">Total</td>
          <td class="text-start font-weight-bold text-uppercase">
            {{ formatCurrency(totalAmount) }}
          </td>
        </tr>
      </tfoot>
    </template>
  </v-data-table-server>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"

import { formatCurrency, formatDate } from "@/utils/formatters"
import useRouteQueriableTableOptions from "@/use/utils/use-route-queriable-table-options"

import {
  ExpenseTypes,
  type ExpenseWhereOptions,
  type ExpenseFiltersOptions,
} from "@/api/expenses-api"

import useExpenses from "@/use/use-expenses"

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
])

const { page, perPage, sortBy, order } = useRouteQueriableTableOptions({
  routeQuerySuffix: props.routeQuerySuffix,
  sortBy: [
    {
      key: "date",
      order: "asc",
    },
    {
      key: "expenseType",
      order: "asc",
    },
  ],
})

const estimatesQuery = computed(() => ({
  where: {
    ...props.where,
    type: ExpenseTypes.ESTIMATE,
  },
  filters: props.filters,
  order: order.value,
  page: page.value,
  perPage: perPage.value,
}))
const {
  expenses: estimates,
  totalCount,
  summaries,
  isLoading,
  refresh,
} = useExpenses(estimatesQuery)

const totalAmount = computed(() => summaries.value.totalCost)

defineExpose({
  refresh,
})
</script>
