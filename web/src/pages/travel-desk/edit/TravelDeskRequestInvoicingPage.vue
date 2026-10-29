<script lang="ts">
export type TravelDeskRequestInvoicingPageProps = {
  travelDeskTravelRequestId: string
}
</script>

<script setup lang="ts">
import { computed } from "vue"
import useBreadcrumbs from "@/use/use-breadcrumbs"
import TravelDeskInvoicesWorkspace from "@/components/travel-desk-invoices/TravelDeskInvoicesWorkspace.vue"

const props = defineProps<TravelDeskRequestInvoicingPageProps>()
const breadcrumbs = computed(() => [
  { title: "Travel Desk", to: { name: "TravelDeskPage" } },
  {
    title: "Request",
    to: {
      name: "travel-desk/TravelDeskRequestPage",
      params: { travelDeskTravelRequestId: props.travelDeskTravelRequestId },
    },
  },
  {
    title: "Edit",
    to: {
      name: "travel-desk/TravelDeskRequestEditRedirect",
      params: { travelDeskTravelRequestId: props.travelDeskTravelRequestId },
    },
  },
  {
    title: "Invoicing",
    to: {
      name: "travel-desk/edit/TravelDeskRequestInvoicingPage",
      params: { travelDeskTravelRequestId: props.travelDeskTravelRequestId },
    },
  },
])
useBreadcrumbs(breadcrumbs)
</script>

<template>
  <TravelDeskInvoicesWorkspace :travel-desk-travel-request-id="travelDeskTravelRequestId" />
</template>
