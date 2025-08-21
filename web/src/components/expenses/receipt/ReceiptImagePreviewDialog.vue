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
          ref="imageViewerRef"
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
        <v-spacer />
        <v-btn
          class="ml-2"
          color="secondary"
          @click="showFullscreenImage"
        >
          Fullscreen
          <v-icon>mdi-fullscreen</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { isNil } from "lodash"

import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import { receiptApi } from "@/api/downloads/expenses"

import DownloadFileForm from "@/components/common/DownloadFileForm.vue"
import ImageViewer from "@/components/common/ImageViewer.vue"

const showDialog = ref(false)

const expenseId = useRouteQuery("previewReceiptImage", undefined, {
  transform: integerTransformer,
})
const downloadUrl = computed(() => {
  if (isNil(expenseId.value)) return ""

  return receiptApi.downloadPath(expenseId.value)
})

const receiptImageObjectUrl = ref<string | null>(null)
const imageViewerRef = ref<InstanceType<typeof ImageViewer> | null>(null)

function showFullscreenImage() {
  imageViewerRef.value?.show()
}

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
