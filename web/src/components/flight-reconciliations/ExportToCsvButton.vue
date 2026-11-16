<template>
  <DownloadFileForm
    :download-url="downloadUrl"
    :disabled="flightReconciliationIds.length === 0"
  >
    <template #default>
      <slot>Export To CSV</slot>
    </template>
  </DownloadFileForm>
</template>

<script setup lang="ts">
import { computed } from "vue"

import { type ModelOrder } from "@/api/base-api"
import { reportsApi } from "@/api/downloads/flight-reconciliations/reports-api"

import DownloadFileForm from "@/components/common/DownloadFileForm.vue"

const props = withDefaults(
  defineProps<{
    flightReconciliationIds?: number[]
    order?: ModelOrder[]
  }>(),
  {
    flightReconciliationIds: () => [],
    order: () => [],
  }
)

const downloadUrl = computed(() =>
  reportsApi.downloadPath({
    where: {
      id: props.flightReconciliationIds,
    },
    order: props.order,
  })
)
</script>
