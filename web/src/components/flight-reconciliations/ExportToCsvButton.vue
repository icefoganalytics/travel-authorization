<template>
  <DownloadFileForm :download-url="downloadUrl">
    <template #default>
      <slot>Export To CSV</slot>
    </template>
  </DownloadFileForm>
</template>

<script setup lang="ts">
import { computed } from "vue"

import { type ModelOrder } from "@/api/base-api"
import { reportsApi } from "@/api/downloads/flight-reconciliations/reports-api"
import {
  type FlightReconciliationFiltersOptions,
  type FlightReconciliationWhereOptions,
} from "@/api/flight-reconciliations-api"

import DownloadFileForm from "@/components/common/DownloadFileForm.vue"

const props = withDefaults(
  defineProps<{
    filters?: FlightReconciliationFiltersOptions
    where?: FlightReconciliationWhereOptions
    order?: ModelOrder[]
  }>(),
  {
    filters: () => ({}),
    where: () => ({}),
    order: () => [],
  }
)

const downloadUrl = computed(() => {
  return reportsApi.downloadPath({
    where: props.where,
    filters: props.filters,
    order: props.order,
  })
})
</script>
