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
import { reportsApi } from "@/api/downloads/travel-authorization-pre-approvals/reports-api"
import {
  type TravelAuthorizationPreApprovalFiltersOptions,
  type TravelAuthorizationPreApprovalWhereOptions,
} from "@/api/travel-authorization-pre-approvals-api"

import DownloadFileForm from "@/components/common/DownloadFileForm.vue"

const props = defineProps<{
  filters?: TravelAuthorizationPreApprovalFiltersOptions
  where?: TravelAuthorizationPreApprovalWhereOptions
  order?: ModelOrder[]
}>()

const downloadUrl = computed(() =>
  reportsApi.downloadPath({
    filters: props.filters,
    where: props.where,
    order: props.order,
  })
)
</script>
