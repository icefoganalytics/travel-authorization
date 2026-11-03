<template>
  <HeaderActionsCard
    title="Travel Requests"
    header-tag="h2"
    header-class="text-h4 mb-0"
  >
    <template #header-actions>
      <RefreshTableButton @click="refreshTable" />
    </template>
    <TravelDeskRequestsDataTableServer ref="travelDeskRequestsTable" />
  </HeaderActionsCard>
</template>

<script setup lang="ts">
import { useTemplateRef } from "vue"

import useBreadcrumbs from "@/use/use-breadcrumbs"

import HeaderActionsCard from "@/components/common/HeaderActionsCard.vue"
import RefreshTableButton from "@/components/common/table/RefreshTableButton.vue"
import TravelDeskRequestsDataTableServer from "@/components/travel-desk-travel-requests/TravelDeskRequestsDataTableServer.vue"

const travelDeskRequestsTable = useTemplateRef("travelDeskRequestsTable")

async function refreshTable() {
  await travelDeskRequestsTable.value?.refresh()
}

useBreadcrumbs([
  {
    title: "Travel Requests",
    to: {
      name: "travel-requests/TravelDeskRequestsPage",
    },
  },
])
</script>

<style scoped>
:deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
