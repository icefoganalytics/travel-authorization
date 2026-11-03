<template>
  <DownloadFileForm :download-url="downloadUrl">
    <template #default>
      <slot>Export To CSV</slot>
    </template>
  </DownloadFileForm>
</template>

<script setup lang="ts">
import { computed } from "vue"

import { reportsApi } from "@/api/downloads/travel-desk-travel-requests"
import { type TravelDeskTravelRequestsQueryOptions } from "@/api/travel-desk-travel-requests-api"

import DownloadFileForm from "@/components/common/DownloadFileForm.vue"

const props = defineProps<{
  queryOptions?: TravelDeskTravelRequestsQueryOptions
}>()

const downloadUrl = computed(() => reportsApi.downloadPath("csv", props.queryOptions))
</script>
