<template>
  <TravelDeskInvoicesWorkspaceContainer
    :travel-desk-travel-request-id="travelDeskTravelRequestId"
  />
</template>

<script setup lang="ts">
import { computed } from "vue"

import useBreadcrumbs from "@/use/use-breadcrumbs"

import TravelDeskInvoicesWorkspaceContainer from "@/components/travel-desk-invoices/TravelDeskInvoicesWorkspaceContainer.vue"

const props = defineProps<{
  travelDeskTravelRequestId: string
}>()

const breadcrumbs = computed(() => [
  {
    title: "Travel Desk",
    to: {
      name: "TravelDeskPage",
    },
  },
  {
    title: "Request",
    to: {
      name: "travel-desk/TravelDeskRequestPage",
      params: {
        travelDeskTravelRequestId: props.travelDeskTravelRequestId,
      },
    },
  },
  {
    title: "Edit",
    to: {
      name: "travel-desk/TravelDeskRequestEditRedirect",
      params: {
        travelDeskTravelRequestId: props.travelDeskTravelRequestId,
      },
    },
  },
  {
    title: "Invoicing",
    to: {
      name: "travel-desk/edit/TravelDeskRequestInvoicingPage",
      params: {
        travelDeskTravelRequestId: props.travelDeskTravelRequestId,
      },
    },
  },
])
useBreadcrumbs(breadcrumbs)
</script>
