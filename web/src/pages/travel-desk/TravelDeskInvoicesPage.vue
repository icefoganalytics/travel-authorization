<script lang="ts">
export type TravelDeskInvoicesPageProps = {
  travelDeskTravelRequestId: string
}
</script>

<script setup lang="ts">
import useBreadcrumbs from "@/use/use-breadcrumbs"
import TravelDeskInvoicesWorkspace from "@/components/travel-desk-invoices/TravelDeskInvoicesWorkspace.vue"

const props = defineProps<TravelDeskInvoicesPageProps>()
useBreadcrumbs([
  { title: "Travel Desk", to: { name: "TravelDeskPage" } },
  {
    title: "Invoices",
    to: {
      name: "travel-desk/TravelDeskInvoicesPage",
      params: { travelDeskTravelRequestId: props.travelDeskTravelRequestId },
    },
  },
])
</script>

<template>
  <TravelDeskInvoicesWorkspace :travel-desk-travel-request-id="travelDeskTravelRequestId" />
</template>
