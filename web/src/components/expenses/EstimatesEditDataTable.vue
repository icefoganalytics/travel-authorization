<template>
  <v-data-table
    :page.sync="page"
    :items-per-page.sync="perPage"
    :sort-by.sync="vuetify2SortBy"
    :sort-desc.sync="vuetify2SortDesc"
    :items="estimates"
    :headers="headers"
    :server-items-length="totalCount"
    :loading="isLoading"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template #top="slotProps">
      <slot
        name="top"
        v-bind="slotProps"
      >
        <EstimateEditDialog
          ref="editDialog"
          @saved="refreshAndEmitUpdated"
        />
        <EstimateDeleteDialog
          ref="deleteDialog"
          @deleted="refreshAndEmitUpdated"
        />
      </slot>
    </template>
    <template #item.date="{ value }">
      {{ formatDate(value) }}
    </template>
    <template #item.cost="{ value }">
      {{ formatCurrency(value) }}
    </template>
    <template #item.actions="{ value: actions, item }">
      <div class="d-flex justify-end">
        <v-btn
          v-if="actions.includes('edit')"
          color="secondary"
          @click="showEditDialog(item)"
          >Edit</v-btn
        >
        <v-btn
          v-if="actions.includes('delete')"
          class="ml-2"
          color="error"
          @click="showDeleteDialog(item)"
          >Delete</v-btn
        >
      </div>
    </template>
    <template #foot>
      <tfoot>
        <tr>
          <td></td>
          <td></td>
          <td class="text-start font-weight-bold text-uppercase">Total</td>
          <td class="text-start font-weight-bold text-uppercase">
            {{ formatCurrency(totalAmount) }}
          </td>
          <td></td>
        </tr>
      </tfoot>
    </template>
  </v-data-table>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { useRoute } from "vue2-helpers/vue-router"
import { sumBy } from "lodash"

import { formatDate, formatCurrency } from "@/utils/formatters"

import { MAX_PER_PAGE } from "@/api/base-api"

import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import useVuetify2SortByShim from "@/use/utils/use-vuetify2-sort-by-shim"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"
import useExpenses, { TYPES } from "@/use/use-expenses"

import EstimateDeleteDialog from "@/components/expenses/EstimateDeleteDialog.vue"
import EstimateEditDialog from "@/components/expenses/EstimateEditDialog.vue"

const props = defineProps({
  where: {
    type: Object,
    default: () => ({}),
  },
  filters: {
    type: Object,
    default: () => ({}),
  },
  routeQuerySuffix: {
    type: String,
    default: "",
  },
})

const emit = defineEmits(["updated"])

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
  },
])

const page = useRouteQuery(`page${props.routeQuerySuffix}`, "1", {
  transform: integerTransformer,
})
const perPage = useRouteQuery(`perPage${props.routeQuerySuffix}`, "10", {
  transform: integerTransformer,
})
const sortBy = useVuetifySortByToSafeRouteQuery(`sortBy${props.routeQuerySuffix}`, [
  {
    key: "date",
    order: "desc",
  },
])
const { vuetify2SortBy, vuetify2SortDesc } = useVuetify2SortByShim(sortBy)
const order = useVuetifySortByToSequelizeSafeOrder(sortBy)

const expensesQuery = computed(() => ({
  where: {
    ...props.where,
    type: TYPES.ESTIMATE,
  },
  filters: props.filters,
  order: order.value,
  page: page.value,
  perPage: perPage.value,
}))
const { expenses: estimates, totalCount, isLoading, refresh } = useExpenses(expensesQuery)

// TODO: add dedicated endpoint to obtain total amount
// We can't use this for the normal table display as it breaks pagination
const expensesTotalAmountQuery = computed(() => ({
  where: {
    ...props.where,
    type: TYPES.ESTIMATE,
  },
  filters: props.filters,
  perPage: MAX_PER_PAGE, // Need to load all estimates to calculate total amount, without dedicated endpoint
}))
const { expenses: totalAmountEstimates, refresh: refreshTotalAmountEstimates } =
  useExpenses(expensesTotalAmountQuery)
const totalAmount = computed(() => sumBy(totalAmountEstimates.value, "cost"))

async function refreshAndEmitUpdated() {
  await Promise.all([refresh(), refreshTotalAmountEstimates()])
  emit("updated")
}

onMounted(() => {
  showEditDialogForRouteQuery()
  showDeleteDialogForRouteQuery()
})

/** @type {import("vue").Ref<InstanceType<typeof EstimateEditDialog> | null>} */
const editDialog = ref(null)

// TODO: update dialog so it accepts an id instead of an item
function showEditDialog(item) {
  editDialog.value?.show(item)
}

const route = useRoute()

// TODO: move logic inside of dialog, and load based on id
function showEditDialogForRouteQuery() {
  const estimateId = parseInt(route.query.showEdit)
  if (isNaN(estimateId)) return

  const estimate = estimates.value.find((estimate) => estimate.id === estimateId)
  if (!estimate) return

  showEditDialog(estimate)
}

/** @type {import("vue").Ref<InstanceType<typeof EstimateDeleteDialog> | null>} */
const deleteDialog = ref(null)

// TODO: update dialog so it accepts an id instead of an item
function showDeleteDialog(item) {
  deleteDialog.value?.show(item)
}

// TODO: move logic inside of dialog, and load based on id
function showDeleteDialogForRouteQuery() {
  const estimateId = parseInt(route.query.showDelete)
  if (isNaN(estimateId)) return

  const estimate = estimates.value.find((estimate) => estimate.id === estimateId)
  if (!estimate) return

  showDeleteDialog(estimate)
}

defineExpose({
  refresh,
})
</script>
