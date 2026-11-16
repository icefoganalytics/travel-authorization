<template>
  <DownloadFileForm :download-url="downloadUrl">
    <template #default>
      <slot>Export to CSV</slot>
    </template>
  </DownloadFileForm>
</template>

<script setup lang="ts">
import { computed } from "vue"

import { reportsApi } from "@/api/downloads/flight-statistics/reports-api"
import {
  type FlightStatisticFiltersOptions,
  type FlightStatisticWhereOptions,
} from "@/api/flight-statistics-api"

import DownloadFileForm from "@/components/common/DownloadFileForm.vue"

const props = defineProps<{
  filters?: FlightStatisticFiltersOptions
  where?: FlightStatisticWhereOptions
}>()

const downloadUrl = computed(() =>
  reportsApi.downloadPath({
    filters: props.filters,
    where: props.where,
  })
)
</script>
