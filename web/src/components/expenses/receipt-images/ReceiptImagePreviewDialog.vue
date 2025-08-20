<template>
  <v-dialog
    v-model="showDialog"
    width="600"
    persistent
    @keydown.esc="hideIfNotFullscreen"
    @input="hideIfFalse"
  >
    <v-card>
      <v-card-title>
        <h2 class="text-h5">Preview Receipt</h2>
      </v-card-title>

      <v-skeleton-loader
        v-if="isNil(expenseId) || isNil(receiptImageBlob)"
        type="image"
      />
      <v-card-text v-else>
        <ImageViewer
          :image-blob="receiptImageBlob"
          @update:fullscreen="updateFullScreen"
        />
      </v-card-text>

      <v-card-actions>
        <DownloadFileForm
          :download-url="downloadUrl"
          color="secondary"
          text="Download Receipt"
          @downloaded="hide"
        />
        <v-btn
          class="ml-2"
          color="warning"
          @click="hide"
        >
          Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { isNil } from "lodash"

import { API_BASE_URL } from "@/config"
import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import expensesApi from "@/api/expenses-api"

import DownloadFileForm from "@/components/common/DownloadFileForm.vue"
import ImageViewer from "@/components/common/ImageViewer.vue"

const showDialog = ref(false)

const expenseId = useRouteQuery("previewReceiptImage", undefined, {
  transform: integerTransformer,
})
const downloadUrl = computed(() => {
  if (isNil(expenseId.value)) return ""

  return `${API_BASE_URL}/api/downloads/expenses/${expenseId.value}/receipt-image`
})

const receiptImageBlob = ref<Blob | null>(null)

watch(
  expenseId,
  (newExpenseId) => {
    if (isNil(newExpenseId)) {
      showDialog.value = false
    } else {
      showDialog.value = true
      loadReceiptImage(newExpenseId)
    }
  },
  {
    immediate: true,
  }
)

async function loadReceiptImage(expenseId: number) {
  const { expense } = await expensesApi.download(expenseId)
  receiptImageBlob.value = expense.receiptImage
}

const isFullscreen = ref(false)

function updateFullScreen(value: boolean) {
  isFullscreen.value = value
}

function hideIfNotFullscreen() {
  if (isFullscreen.value) return

  hide()
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
})
</script>
