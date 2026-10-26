<template>
  <DownloadFileForm
    :download-url="downloadUrl"
    :loading="travelDeskTravelRequestIds.length === 0"
  >
    <template #default>
      <slot>Export To CSV</slot>
    </template>
  </DownloadFileForm>
</template>

<script setup lang="ts">
import { computed } from "vue"

import { reportsApi } from "@/api/downloads/travel-desk-travel-requests"

import DownloadFileForm from "@/components/common/DownloadFileForm.vue"

const props = defineProps<{
  travelDeskTravelRequestIds: number[]
}>()

const downloadUrl = computed(() =>
  reportsApi.downloadPath("csv", {
    where: { id: props.travelDeskTravelRequestIds },
  })
)
</script>
