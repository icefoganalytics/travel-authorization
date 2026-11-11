<template>
  <v-data-table-server
    v-model:page="page"
    v-model:items-per-page="perPage"
    v-model:sort-by="sortBy"
    :headers="headers"
    :items="expenses"
    :items-length="totalCount"
    :loading="isLoading"
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
          <td :class="totalRowClasses"></td>
          <td :class="totalRowClasses">Total</td>
          <td :class="totalRowClasses">
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
import useRouteQueryPagination from "@/use/utils/use-route-query-pagination"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"

import useExpenses, {
  ExpenseTypes,
  ExpenseExpenseTypes,
  type ExpenseQueryOptions,
} from "@/use/use-expenses"

const props = defineProps<{
  travelAuthorizationId: number
}>()

const { page, perPage } = useRouteQueryPagination({
  routeQuerySuffix: "MealsAndIncidentals",
})
const sortBy = useVuetifySortByToSafeRouteQuery("sortByMealsAndIncidentals", [
  {
    key: "date",
    order: "asc",
  },
])
const order = useVuetifySortByToSequelizeSafeOrder(sortBy)

const expenseOptions = computed<ExpenseQueryOptions>(() => ({
  where: {
    travelAuthorizationId: props.travelAuthorizationId,
    type: ExpenseTypes.EXPENSE,
    expenseType: ExpenseExpenseTypes.MEALS_AND_INCIDENTALS,
  },
  order: order.value,
  page: page.value,
  perPage: perPage.value,
}))
const { expenses, totalCount, summaries, isLoading } = useExpenses(expenseOptions)

const headers = ref([
  { title: "Date", key: "date" },
  { title: "Description", key: "description" },
  { title: "Amount", key: "cost" },
])

const totalRowClasses = ref("text-start font-weight-bold text-uppercase")

const totalAmount = computed(() => summaries.value.totalCost)
</script>
