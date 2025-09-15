<template>
  <DownloadFileForm
    :download-url="downloadUrl"
    color="secondary"
    text="View Receipt"
  />
</template>

<script setup lang="ts">
import { computed } from "vue"

import { receiptApi } from "@/api/downloads/expenses"

import DownloadFileForm from "@/components/common/DownloadFileForm.vue"

const props = defineProps<{
  expenseId: number
}>()

const downloadUrl = computed(() => receiptApi.downloadPath(props.expenseId))
</script>
