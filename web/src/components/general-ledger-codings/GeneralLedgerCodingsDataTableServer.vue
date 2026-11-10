<template>
  <v-data-table-server
    v-model:page="page"
    v-model:items-per-page="perPage"
    v-model:sort-by="sortBy"
    :headers="headers"
    :items="generalLedgerCodings"
    :items-length="totalCount"
    :loading="isLoading"
  >
    <template #item.amount="{ value }">
      {{ formatCurrency(value) }}
    </template>
    <template #tfoot>
      <tfoot>
        <tr>
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

import { formatCurrency } from "@/utils/formatters"
import useRouteQueryPagination from "@/use/utils/use-route-query-pagination"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"

import useGeneralLedgerCodings from "@/use/use-general-ledger-codings"

const props = defineProps<{
  travelAuthorizationId: number
}>()

const { page, perPage } = useRouteQueryPagination({
  routeQuerySuffix: "Codings",
})
const sortBy = useVuetifySortByToSafeRouteQuery("sortByCodings", [
  {
    key: "code",
    order: "asc",
  },
])
const order = useVuetifySortByToSequelizeSafeOrder(sortBy)

const generalLedgerCodingOptions = computed(() => ({
  where: {
    travelAuthorizationId: props.travelAuthorizationId,
  },
  order: order.value,
  page: page.value,
  perPage: perPage.value,
}))
const { generalLedgerCodings, totalCount, summaries, isLoading } = useGeneralLedgerCodings(
  generalLedgerCodingOptions
)
const totalAmount = computed(() => summaries.value.totalAmount)

const headers = ref([
  { title: "Vote/Program/Object/Sub1/Sub2", key: "code" },
  { title: "Amount", key: "amount" },
])
const totalRowClasses = ref("text-start font-weight-bold text-uppercase")
</script>
