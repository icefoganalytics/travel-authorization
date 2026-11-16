<template>
  <DownloadFileForm :download-url="downloadUrl">
    <template #default>
      <slot>Export To CSV</slot>
    </template>
  </DownloadFileForm>
</template>

<script setup lang="ts">
import { reportsApi } from "@/api/downloads/travel-authorization-pre-approvals/reports-api"

import DownloadFileForm from "@/components/common/DownloadFileForm.vue"

const downloadUrl = reportsApi.downloadPath()
</script>
