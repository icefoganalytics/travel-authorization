<template>
  <DownloadFileForm
    :download-url="downloadUrl"
    :loading="travelDeskTravelRequestIds.length === 0"
    text="Print Report"
    prepend-icon="mdi-printer"
  />
</template>

<script setup lang="ts">
import { computed } from "vue"

import { reportsApi } from "@/api/downloads/travel-desk-travel-requests"

import DownloadFileForm from "@/components/common/DownloadFileForm.vue"

const props = defineProps<{
  travelDeskTravelRequestIds: number[]
}>()

const downloadUrl = computed(() =>
  reportsApi.downloadPath("pdf", {
    where: { id: props.travelDeskTravelRequestIds },
  })
)
</script>
