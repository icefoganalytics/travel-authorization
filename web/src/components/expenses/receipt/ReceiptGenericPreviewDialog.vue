<template>
  <v-dialog
    v-model="showDialog"
    width="600"
    persistent
    @keydown.esc="hide"
    @input="hideIfFalse"
  >
    <v-card>
      <v-card-title>
        <h2 class="text-h5">Preview Receipt</h2>
        <v-spacer />
        <v-chip
          v-if="receipt"
          small
          >{{ friendlyType }}</v-chip
        >
      </v-card-title>

      <v-card-text>
        <v-sheet
          class="pa-8 text-center d-flex flex-column align-center justify-center grey lighten-4 rounded-lg"
        >
          <v-avatar
            size="64"
            class="mb-3 white elevation-1"
          >
            <v-icon large>{{ iconName }}</v-icon>
          </v-avatar>

          <div class="text-h6 mb-1">Can't preview {{ friendlyType }}</div>

          <div class="text-body-2 mb-4">Download to view this receipt.</div>

          <div
            v-if="receipt"
            class="text-caption grey--text text--darken-1"
          >
            <div><strong>File:</strong> {{ receipt.name }}</div>
            <div><strong>Size:</strong> {{ formatBytes(receipt.size) }}</div>
          </div>
        </v-sheet>
      </v-card-text>

      <v-card-actions>
        <DownloadFileForm
          :download-url="downloadUrl"
          :loading="isLoading"
          color="secondary"
          text="Download Receipt"
          @downloaded="hide"
        />
        <v-btn
          class="ml-2"
          :loading="isLoading"
          color="warning"
          @click="hide"
          >Close</v-btn
        >
        <v-spacer />
        <v-btn
          v-if="policy?.destroy"
          :loading="isLoading"
          color="error"
          @click="deleteReceipt"
        >
          <v-icon>mdi-delete</v-icon>
          Delete
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from "vue"
import { isNil } from "lodash"

import { formatBytes } from "@/utils/formatters"

import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import { downloads, expenses } from "@/api"
import useExpense from "@/use/use-expense"

import DownloadFileForm from "@/components/common/DownloadFileForm.vue"

// TODO: switch to `deleted: [void]` syntax in vue 3
const emit = defineEmits<{
  (event: "deleted"): void
}>()

const showDialog = ref(false)

const expenseId = useRouteQuery("previewReceiptGeneric", undefined, {
  transform: integerTransformer,
})
const { expense, isLoading, policy } = useExpense(expenseId)

const receipt = computed(() => expense.value?.receipt ?? null)

const mimeType = computed(() => receipt.value?.mimeType ?? "")

const friendlyType = computed(() => {
  const type = mimeType.value
  if (
    type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    type === "application/msword"
  ) {
    return "Word document"
  } else if (
    type === "application/vnd.ms-excel" ||
    type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    return "Excel spreadsheet"
  } else if (type.startsWith("text/")) {
    return "text file"
  } else {
    return "unknown file"
  }
})

const iconName = computed(() => {
  if (mimeType.value.includes("word")) return "mdi-file-word-outline"
  if (mimeType.value.includes("excel")) return "mdi-file-excel-outline"
  if (mimeType.value.startsWith("text/")) return "mdi-file-document-outline"

  return "mdi-file-outline"
})

const downloadUrl = computed(() => {
  if (isNil(expenseId.value)) return ""

  return downloads.expenses.receiptApi.downloadPath(expenseId.value)
})

watch(
  expenseId,
  (newExpenseId) => {
    if (isNil(newExpenseId)) {
      showDialog.value = false
      expense.value = null
    } else {
      showDialog.value = true
    }
  },
  {
    immediate: true,
  }
)

async function deleteReceipt() {
  const staticExpenseId = expenseId.value
  if (isNil(staticExpenseId)) return

  isLoading.value = true
  try {
    await expenses.receiptApi.delete(staticExpenseId)

    await nextTick()
    hide()
    emit("deleted")
  } finally {
    isLoading.value = false
  }
}

function show(newExpenseId: number) {
  expenseId.value = newExpenseId
}

function hide() {
  expenseId.value = undefined
}

function hideIfFalse(value: boolean | null) {
  if (value !== false) return

  hide()
}

defineExpose({
  show,
  hide,
})
</script>
