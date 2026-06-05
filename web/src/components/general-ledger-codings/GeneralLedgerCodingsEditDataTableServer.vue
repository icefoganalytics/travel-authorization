<template>
  <v-data-table-server
    v-model:page="page"
    v-model:items-per-page="perPage"
    v-model:sort-by="sortBy"
    :headers="headers"
    :items="generalLedgerCodings"
    :loading="isLoading"
    :items-length="totalCount"
  >
    <template #top>
      <GeneralLedgerCodingEditDialog
        ref="editDialog"
        @saved="emitChangedAndRefresh"
      />
      <GeneralLedgerCodingDeleteDialog
        ref="deleteDialog"
        @deleted="emitChangedAndRefresh"
      />
    </template>
    <template #header.code="{ column }">
      <v-tooltip location="bottom">
        <template #activator="{ props: activatorProps }">
          <span v-bind="activatorProps">
            {{ column.title }}
            <v-icon size="small">mdi-help-circle-outline</v-icon>
          </span>
        </template>
        <span>
          e.g. 552-123456-2015-1234-12345
          <br />
          The format is Vote (3 characters) - Program (6 characters) - Object (4 digits) - Subledger
          1 (0-4 characters) - Subledger 2 (0-5 characters).</span
        >
      </v-tooltip>
    </template>
    <template #item.amount="{ value }">
      {{ formatCurrency(value) }}
    </template>
    <template #item.actions="{ item }">
      <div class="d-flex justify-end">
        <v-btn
          variant="outlined"
          @click="showEditDialog(item)"
          >Edit</v-btn
        >
        <v-btn
          icon="mdi-close"
          size="small"
          variant="text"
          class="ml-2"
          color="error"
          title="Delete"
          @click="showDeleteDialog(item)"
        />
      </div>
    </template>
    <template #tfoot>
      <tfoot>
        <tr>
          <td :class="totalRowClasses">Total</td>
          <td :class="totalRowClasses">{{ formatCurrency(totalAmount) }}</td>
          <td :class="totalRowClasses"></td>
        </tr>
      </tfoot>
    </template>
  </v-data-table-server>
</template>

<script setup lang="ts">
import { sumBy } from "lodash"
import { computed, ref } from "vue"

import { formatCurrency } from "@/utils/formatters"
import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"
import useGeneralLedgerCodings, {
  type GeneralLedgerCodingFiltersOptions,
  type GeneralLedgerCodingWhereOptions,
} from "@/use/use-general-ledger-codings"

import GeneralLedgerCodingDeleteDialog from "@/modules/travel-authorizations/components/edit-my-travel-authorization-expense-page/GeneralLedgerCodingDeleteDialog.vue"
import GeneralLedgerCodingEditDialog from "@/modules/travel-authorizations/components/edit-my-travel-authorization-expense-page/GeneralLedgerCodingEditDialog.vue"

const props = withDefaults(
  defineProps<{
    where?: GeneralLedgerCodingWhereOptions
    filters?: GeneralLedgerCodingFiltersOptions
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
    key: "code",
    order: "asc",
  },
])
const order = useVuetifySortByToSequelizeSafeOrder(sortBy)

const generalLedgerCodingOptions = computed(() => ({
  where: props.where,
  filters: props.filters,
  order: order.value,
  page: page.value,
  perPage: perPage.value,
}))
const { generalLedgerCodings, totalCount, isLoading, refresh } = useGeneralLedgerCodings(
  generalLedgerCodingOptions
)
const totalAmount = computed(() => sumBy(generalLedgerCodings.value, "amount"))

const headers = ref([
  {
    title: "G/L code",
    key: "code",
  },
  {
    title: "Amount",
    key: "amount",
  },
  {
    title: "Actions",
    key: "actions",
    sortable: false,
    align: "center" as const,
  },
])
const totalRowClasses = ref("text-start font-weight-bold text-uppercase")

const editDialog = ref<InstanceType<typeof GeneralLedgerCodingEditDialog> | null>(null)
const deleteDialog = ref<InstanceType<typeof GeneralLedgerCodingDeleteDialog> | null>(null)

async function emitChangedAndRefresh() {
  emit("changed")
  await refresh()
}

function showDeleteDialog(item: { id: number }) {
  deleteDialog.value?.show(item.id)
}

function showEditDialog(item: { id: number }) {
  editDialog.value?.show(item.id)
}

defineExpose({
  refresh,
})
</script>
