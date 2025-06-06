<template>
  <v-data-table
    :headers="headers"
    :items="generalLedgerCodings"
    :items-per-page="10"
    :loading="isLoading"
    class="elevation-2"
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
    <template #header.code="{ header }">
      <!-- See https://github.com/icefoganalytics/travel-authorization/issues/156#issuecomment-1890047168 -->
      <v-tooltip bottom>
        <template #activator="{ on }">
          <span v-on="on">
            {{ header.text }}
            <v-icon small> mdi-help-circle-outline </v-icon>
          </span>
        </template>
        <span>
          e.g. 552-123456-2015-1234-12345
          <br />
          The format is vote (3 characters) - Program (6 characters) - object code (4 digits) -
          subledger-1 (0-4 characters) - subleger-2 (0-5 characters).</span
        >
      </v-tooltip>
    </template>
    <template #item.amount="{ value }">
      {{ formatCurrency(value) }}
    </template>
    <template #item.actions="{ item }">
      <div class="d-flex justify-end">
        <v-btn
          color="secondary"
          @click="showEditDialog(item)"
          >Edit</v-btn
        >
        <v-btn
          icon
          class="ml-2"
          color="error"
          title="Delete"
          @click="showDeleteDialog(item)"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
    </template>
    <template #foot>
      <tfoot>
        <tr>
          <td :class="totalRowClasses">Total</td>
          <td :class="totalRowClasses">{{ formatCurrency(totalAmount) }}</td>
          <td :class="totalRowClasses"></td>
        </tr>
      </tfoot>
    </template>
  </v-data-table>
</template>

<script setup>
import { sumBy } from "lodash"
import { computed, onMounted, ref } from "vue"
import { useRoute } from "vue2-helpers/vue-router"

import useGeneralLedgerCodings from "@/use/use-general-ledger-codings"

import GeneralLedgerCodingDeleteDialog from "@/modules/travel-authorizations/components/edit-my-travel-authorization-expense-page/GeneralLedgerCodingDeleteDialog.vue"
import GeneralLedgerCodingEditDialog from "@/modules/travel-authorizations/components/edit-my-travel-authorization-expense-page/GeneralLedgerCodingEditDialog.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(["changed"])

const editDialog = ref(null)
const deleteDialog = ref(null)

const route = useRoute()

const generalLedgerCodingOptions = computed(() => ({
  where: {
    travelAuthorizationId: props.travelAuthorizationId,
  },
}))
const {
  generalLedgerCodings,
  isLoading,
  fetch: refresh,
} = useGeneralLedgerCodings(generalLedgerCodingOptions)
const totalAmount = computed(() => sumBy(generalLedgerCodings.value, "amount"))

const headers = ref([
  { text: "G/L code", value: "code" },
  { text: "Amount", value: "amount" },
  { text: "", value: "actions" },
])
const totalRowClasses = ref("text-start font-weight-bold text-uppercase")

onMounted(async () => {
  await refresh()
  showEditDialogForRouteQuery()
  showDeleteDialogForRouteQuery()
})

function formatCurrency(amount) {
  const formatter = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  })
  return formatter.format(amount)
}

async function emitChangedAndRefresh() {
  emit("changed")
  await refresh()
}

function showDeleteDialog(item) {
  deleteDialog.value.show(item)
}

function showEditDialog(item) {
  editDialog.value.show(item)
}

function showEditDialogForRouteQuery() {
  const generalLedgerCodingId = parseInt(route.query.showEdit)
  if (isNaN(generalLedgerCodingId)) return

  const generalLedgerCoding = generalLedgerCodings.value.find(
    (generalLedgerCoding) => generalLedgerCoding.id === generalLedgerCodingId
  )
  if (!generalLedgerCoding) return

  showEditDialog(generalLedgerCoding)
}

function showDeleteDialogForRouteQuery() {
  const generalLedgerCodingId = parseInt(route.query.showDelete)
  if (isNaN(generalLedgerCodingId)) return

  const generalLedgerCoding = generalLedgerCodings.value.find(
    (generalLedgerCoding) => generalLedgerCoding.id === generalLedgerCodingId
  )
  if (!generalLedgerCoding) return

  showDeleteDialog(generalLedgerCoding)
}

defineExpose({
  refresh,
})
</script>
