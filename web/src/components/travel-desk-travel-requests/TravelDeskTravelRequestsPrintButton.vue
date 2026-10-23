<template>
  <DownloadFileForm
    :download-url="downloadUrl"
    :disabled="travelDeskTravelRequestIds.length === 0"
    text="Print Report"
    prepend-icon="mdi-printer"
  >
    <template #fields>
      <input
        type="hidden"
        name="travelDeskTravelRequestIds"
        :value="JSON.stringify(travelDeskTravelRequestIds)"
      />
    </template>
  </DownloadFileForm>
</template>

<script setup lang="ts">
import { reportsApi } from "@/api/downloads/travel-desk-travel-requests"

import DownloadFileForm from "@/components/common/DownloadFileForm.vue"

defineProps<{
  travelDeskTravelRequestIds: number[]
}>()

const downloadUrl = reportsApi.downloadPath("pdf")
</script>
