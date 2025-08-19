<template>
  <v-dialog
    v-model="showDialog"
    max-width="500px"
    @keydown.esc="hide"
    @input="hideIfFalse"
  >
    <v-card>
      <v-card-title>
        <h2 class="text-h5">Preview Receipt</h2>
      </v-card-title>

      <v-card-text>
        <img
          :src="receiptImageSrc"
          alt="Receipt Image"
        />
      </v-card-text>

      <v-card-actions>
        <DownloadFileForm
          :download-url="downloadUrl"
          color="secondary"
          text="Download Receipt"
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

import DownloadFileForm from "@/components/common/DownloadFileForm.vue"

const showDialog = ref(false)

const expenseId = useRouteQuery("previewReceiptImage", undefined, {
  transform: integerTransformer,
})
const downloadUrl = computed(() => {
  if (isNil(expenseId.value)) return ""

  return `${API_BASE_URL}/api/downloads/expenses/${expenseId.value}/receipt-image`
})

const receiptImageSrc = ref<string>("")

watch(
  expenseId,
  (newExpenseId) => {
    if (isNil(newExpenseId)) {
      showDialog.value = false
    } else {
      showDialog.value = true
    }
  },
  {
    immediate: true,
  }
)

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
