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

import { ExpenseTypes } from "@/api/expenses-api"

import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"
import useExpenses from "@/use/use-expenses"

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
