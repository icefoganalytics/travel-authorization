<template>
  <HeaderActionsCard
    title="Travel Requests"
    header-tag="h2"
    header-class="text-h4 mb-0"
  >
    <template #header-actions>
      <RefreshTableButton @click="refreshTable" />
    </template>
    <TravelRequestsDataTableServer ref="travelRequestsDataTable" />
  </HeaderActionsCard>
</template>

<script setup lang="ts">
import { useTemplateRef } from "vue"

import useBreadcrumbs from "@/use/use-breadcrumbs"

import HeaderActionsCard from "@/components/common/HeaderActionsCard.vue"
import RefreshTableButton from "@/components/common/table/RefreshTableButton.vue"
import TravelRequestsDataTableServer from "@/components/travel-requests/TravelRequestsDataTableServer.vue"

const travelRequestsDataTable = useTemplateRef("travelRequestsDataTable")

async function refreshTable() {
  await travelRequestsDataTable.value?.refresh()
}

useBreadcrumbs([
  {
    title: "Travel Requests",
    to: {
      name: "travel-requests/TravelRequestsPage",
    },
  },
])
</script>

<style scoped>
:deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
