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
        <iframe
          ref="iframeRef"
          title="Receipt PDF"
          :src="receiptObjectUrl"
          style="width: 100%; height: 100%; min-height: 480px; border: 0"
        ></iframe>
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
        <v-spacer />
        <ConditionalTooltipButton
          class="ml-2"
          :disabled="!isFullscreenSupported"
          tooltip-text="Fullscreen is not supported on this browser"
          :button-props="{
            color: 'secondary',
          }"
          @click="showFullscreenPdf"
        >
          Fullscreen
          <v-icon>mdi-fullscreen</v-icon>
        </ConditionalTooltipButton>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { isNil, isUndefined } from "lodash"

import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import { receiptApi } from "@/api/downloads/expenses"

import DownloadFileForm from "@/components/common/DownloadFileForm.vue"
import ConditionalTooltipButton from "@/components/common/ConditionalTooltipButton.vue"

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

const iframeRef = ref<HTMLIFrameElement | null>(null)

const isFullscreenSupported = computed(() => {
  if (isNil(iframeRef.value)) return false

  return !isUndefined(iframeRef.value.requestFullscreen)
})

async function showFullscreenPdf() {
  if (isNil(iframeRef.value)) return

  if (iframeRef.value.requestFullscreen) {
    await iframeRef.value.requestFullscreen()
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
})
</script>
