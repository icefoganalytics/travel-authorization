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
      </v-card-title>

      <v-skeleton-loader
        v-if="isNil(expenseId) || isNil(receiptObjectUrl)"
        type="image"
      />
      <v-card-text v-else>
        <PdfViewer
          ref="pdfViewerRef"
          :source="receiptObjectUrl"
        />
      </v-card-text>

      <v-card-actions class="d-flex flex-column flex-md-row">
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
        <v-spacer />
        <ConditionalTooltipButton
          class="ml-2"
          :disabled="!isFullscreenSupported"
          tooltip-text="Fullscreen is not supported on this browser"
          :button-props="{
            color: 'secondary',
          }"
          @click="showFullscreen"
        >
          Fullscreen
          <v-icon>mdi-fullscreen</v-icon>
        </ConditionalTooltipButton>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { isNil } from "lodash"
import { ref, computed, watch } from "vue"

import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import { receiptApi } from "@/api/downloads/expenses"

import DownloadFileForm from "@/components/common/DownloadFileForm.vue"
import ConditionalTooltipButton from "@/components/common/ConditionalTooltipButton.vue"
import PdfViewer from "@/components/common/PdfViewer.vue"

const showDialog = ref(false)

const expenseId = useRouteQuery("previewReceiptPdf", undefined, {
  transform: integerTransformer,
})
const downloadUrl = computed(() => {
  if (isNil(expenseId.value)) return ""

  return receiptApi.downloadPath(expenseId.value)
})

const receiptObjectUrl = ref<string | null>(null)

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
  const receiptImage = await receiptApi.get(expenseId)
  receiptObjectUrl.value = URL.createObjectURL(receiptImage)
}

function revokeImageObjectUrl() {
  if (isNil(receiptObjectUrl.value)) return

  URL.revokeObjectURL(receiptObjectUrl.value)
  receiptObjectUrl.value = null
}

const pdfViewerRef = ref<InstanceType<typeof PdfViewer> | null>(null)

const isFullscreenSupported = computed(() => {
  if (isNil(pdfViewerRef.value)) return false

  return pdfViewerRef.value.isFullscreenSupported
})

async function showFullscreen() {
  if (isNil(pdfViewerRef.value)) return

  await pdfViewerRef.value.showFullscreen()
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
