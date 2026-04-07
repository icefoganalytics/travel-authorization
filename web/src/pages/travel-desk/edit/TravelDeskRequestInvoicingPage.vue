<template>
  <v-sheet>
    <v-card>
      <v-card-text> TODO: Invoicing tab content will be added here. </v-card-text>
    </v-card>
  </v-sheet>
</template>

<script setup lang="ts">
import { computed } from "vue"

import useBreadcrumbs from "@/use/use-breadcrumbs"

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

<style scoped></style>
