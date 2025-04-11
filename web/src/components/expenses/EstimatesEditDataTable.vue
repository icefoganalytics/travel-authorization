<template>
  <!-- TODO: update to newest table pattern -->
  <v-data-table
    :headers="headers"
    :items="estimates"
    :loading="isLoading"
    :server-items-length="totalCount"
    :items-per-page="10"
  >
    <template #top>
      <EstimateEditDialog
        ref="editDialog"
        @saved="refreshAndEmitUpdated"
      />
      <EstimateDeleteDialog
        ref="deleteDialog"
        @deleted="refreshAndEmitUpdated"
      />
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
          <td :class="totalRowClasses"></td>
          <td :class="totalRowClasses"></td>
          <td :class="totalRowClasses">Total</td>
          <td :class="totalRowClasses">{{ formatCurrency(totalAmount) }}</td>
          <td :class="totalRowClasses"></td>
        </tr>
      </tfoot>
    </template>
  </v-data-table>
</template>

<script setup>
import { computed, onMounted, ref } from "vue"
import { useRoute } from "vue2-helpers/vue-router"
import { sumBy } from "lodash"

import { MAX_PER_PAGE } from "@/api/base-api"
import { formatDate, formatCurrency } from "@/utils/formatters"
import useExpenses, { TYPES } from "@/use/use-expenses"

import EstimateDeleteDialog from "@/modules/travel-authorizations/components/edit-my-travel-authorization-estimate-page/EstimateDeleteDialog.vue"
import EstimateEditDialog from "@/modules/travel-authorizations/components/edit-my-travel-authorization-estimate-page/EstimateEditDialog.vue"

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

const expensesQuery = computed(() => ({
  where: {
    ...props.where,
    type: TYPES.ESTIMATE,
  },
  filters: props.filters,
  perPage: MAX_PER_PAGE, // Need to load all estimates to calculate total amount, without dedicated endpoint
}))
const { expenses: estimates, totalCount, isLoading, refresh } = useExpenses(expensesQuery)

const totalRowClasses = ref("text-start font-weight-bold text-uppercase")

// TODO: add dedicated endpoint to obtain total amount
const totalAmount = computed(() => sumBy(estimates.value, "cost"))

async function refreshAndEmitUpdated() {
  await refresh()
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
