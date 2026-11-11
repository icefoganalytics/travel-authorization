<script setup lang="ts">
import { computed } from "vue"

import useBreadcrumbs from "@/use/use-breadcrumbs"

import TravelDeskInvoicesWorkspaceContainer from "@/components/travel-desk-invoices/TravelDeskInvoicesWorkspaceContainer.vue"

const props = defineProps<{
  travelDeskTravelRequestId: string
}>()

const breadcrumbs = computed(() => [
  { title: "Travel Desk", to: { name: "TravelDeskPage" } },
  {
    title: "Invoices",
    to: {
      name: "travel-desk/TravelDeskInvoicesPage",
      params: { travelDeskTravelRequestId: props.travelDeskTravelRequestId },
    },
  },
])
useBreadcrumbs(breadcrumbs)
</script>

<template>
  <TravelDeskInvoicesWorkspaceContainer
    :travel-desk-travel-request-id="travelDeskTravelRequestId"
  />
</template>
