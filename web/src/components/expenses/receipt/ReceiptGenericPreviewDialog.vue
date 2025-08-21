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
        v-if="isNil(expenseId)"
        type="image"
      />
      <v-card-text v-else> Can't preview this receipt type. </v-card-text>

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

const showDialog = ref(false)

const expenseId = useRouteQuery("previewReceiptGeneric", undefined, {
  transform: integerTransformer,
})
const downloadUrl = computed(() => {
  if (isNil(expenseId.value)) return ""

  return receiptApi.downloadPath(expenseId.value)
})

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
