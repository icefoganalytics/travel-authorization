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
        v-if="isNil(expenseId) || isNil(receiptImageObjectUrl)"
        type="image"
      />
      <v-card-text v-else>
        <ImageViewer
          :src="receiptImageObjectUrl"
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

const receiptImageObjectUrl = ref<string | null>(null)

watch(
  expenseId,
  (newExpenseId) => {
    if (isNil(newExpenseId)) {
      showDialog.value = false
      revokeImageObjectUrl()
    } else {
      showDialog.value = true
      loadReceiptImageObjectUrl(newExpenseId)
    }
  },
  {
    immediate: true,
  }
)

async function loadReceiptImageObjectUrl(expenseId: number) {
  const { expense } = await expensesApi.download(expenseId)
  const { receiptImage } = expense
  receiptImageObjectUrl.value = URL.createObjectURL(receiptImage)
}

function revokeImageObjectUrl() {
  if (isNil(receiptImageObjectUrl.value)) return

  URL.revokeObjectURL(receiptImageObjectUrl.value)
  receiptImageObjectUrl.value = null
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
