<template>
  <DownloadFileForm
    :download-url="downloadUrl"
    color="secondary"
    text="View Receipt"
  />
</template>

<script setup lang="ts">
import { computed } from "vue"

import { API_BASE_URL } from "@/config"

import DownloadFileForm from "@/components/common/DownloadFileForm.vue"

const props = defineProps<{
  expenseId: number
}>()

const downloadUrl = computed(() => {
  return `${API_BASE_URL}/api/downloads/expenses/${props.expenseId}/receipt-image`
})
</script>
