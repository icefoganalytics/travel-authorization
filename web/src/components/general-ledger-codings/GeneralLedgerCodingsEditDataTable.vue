<template>
  <v-data-table
    :headers="headers"
    :items="generalLedgerCodings"
    :items-per-page="10"
    :loading="isLoading"
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
      <!-- See https://github.com/icefoganalytics/travel-authorization/issues/156#issuecomment-1890047168 -->
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
  </v-data-table>
</template>

<script setup lang="ts">
import { sumBy } from "lodash"
import { computed, onMounted, ref, useTemplateRef } from "vue"

import { formatCurrency } from "@/utils/formatters"

import useGeneralLedgerCodings from "@/use/use-general-ledger-codings"

import GeneralLedgerCodingDeleteDialog from "@/components/general-ledger-codings/GeneralLedgerCodingDeleteDialog.vue"
import GeneralLedgerCodingEditDialog from "@/components/general-ledger-codings/GeneralLedgerCodingEditDialog.vue"

const props = defineProps<{
  travelAuthorizationId: number
}>()

const emit = defineEmits<{
  changed: []
}>()

const editDialog = useTemplateRef<InstanceType<typeof GeneralLedgerCodingEditDialog>>("editDialog")
const deleteDialog =
  useTemplateRef<InstanceType<typeof GeneralLedgerCodingDeleteDialog>>("deleteDialog")

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
  { title: "G/L code", key: "code" },
  { title: "Amount", key: "amount" },
  { title: "", key: "actions" },
])
const totalRowClasses = ref("text-start font-weight-bold text-uppercase")

onMounted(async () => {
  await refresh()
})

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
