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
        <h2 class="text-h5 mb-0">Preview Receipt</h2>
        <v-spacer />
        <v-btn
          class="my-0"
          color="secondary"
          @click="showFullscreenImage"
        >
          Fullscreen
          <v-icon>mdi-fullscreen</v-icon>
        </v-btn>
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

      <v-card-actions class="d-flex flex-column flex-md-row">
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
        >
          Close
        </v-btn>
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
import { computed, nextTick, ref, watch } from "vue"
import { isNil } from "lodash"

import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import { downloads, expenses } from "@/api"
import useExpense from "@/use/use-expense"

import DownloadFileForm from "@/components/common/DownloadFileForm.vue"
import ImageViewer from "@/components/common/ImageViewer.vue"

// TODO: switch to `deleted: [void]` syntax in vue 3
const emit = defineEmits<{
  (event: "deleted"): void
}>()

const showDialog = ref(false)

const expenseId = useRouteQuery("previewReceiptImage", undefined, {
  transform: integerTransformer,
})

const { isLoading, policy } = useExpense(expenseId)

const downloadUrl = computed(() => {
  if (isNil(expenseId.value)) return ""

  return downloads.expenses.receiptApi.downloadPath(expenseId.value)
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
  const receiptImage = await downloads.expenses.receiptApi.get(expenseId)
  receiptImageObjectUrl.value = URL.createObjectURL(receiptImage)
}

function revokeImageObjectUrl() {
  if (isNil(receiptImageObjectUrl.value)) return

  URL.revokeObjectURL(receiptImageObjectUrl.value)
  receiptImageObjectUrl.value = null
}

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
  hide,
})
</script>
