<template>
  <ReceiptImagePreviewDialog
    v-if="mimeType === 'image/jpeg' || mimeType === 'image/png' || mimeType === 'image/gif'"
    ref="receiptPreviewDialogRef"
  />
  <ReceiptPdfPreviewDialog
    v-else-if="mimeType === 'application/pdf'"
    ref="receiptPreviewDialogRef"
  />
  <ReceiptGenericPreviewDialog
    v-else
    ref="receiptPreviewDialogRef"
  />
</template>

<script setup lang="ts">
import { nextTick, ref } from "vue"

import { type AttachmentAsReference } from "@/api/attachments-api"

import ReceiptGenericPreviewDialog from "@/components/expenses/receipt/ReceiptGenericPreviewDialog.vue"
import ReceiptImagePreviewDialog from "@/components/expenses/receipt/ReceiptImagePreviewDialog.vue"
import ReceiptPdfPreviewDialog from "@/components/expenses/receipt/ReceiptPdfPreviewDialog.vue"

const mimeType = ref<string | undefined>(undefined)

const receiptPreviewDialogRef = ref<
  | InstanceType<typeof ReceiptGenericPreviewDialog>
  | InstanceType<typeof ReceiptImagePreviewDialog>
  | InstanceType<typeof ReceiptPdfPreviewDialog>
  | null
>(null)

async function open(receipt: AttachmentAsReference) {
  mimeType.value = receipt.mimeType

  await nextTick()

  receiptPreviewDialogRef.value?.show(receipt.targetId)
}

defineExpose({
  open,
})
</script>
