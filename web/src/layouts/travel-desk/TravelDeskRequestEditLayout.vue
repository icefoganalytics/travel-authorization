<template>
  <HeaderWithChildTabPagesLayout
    title="Travel Desk Request"
    :tabs="tabs"
  >
    <template #append>
      <span class="text-subtitle-1 font-weight-light">
        Travel Auth: <strong class="font-weight-bold">{{ travelAuthorizationId }}</strong>
      </span>
    </template>
  </HeaderWithChildTabPagesLayout>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"

import useTravelDeskTravelRequest from "@/use/use-travel-desk-travel-request"

import HeaderWithChildTabPagesLayout from "@/components/common/layouts/HeaderWithChildTabPagesLayout.vue"

const props = defineProps<{
  travelDeskTravelRequestId: string
}>()

const travelDeskTravelRequestIdAsNumber = computed(() => parseInt(props.travelDeskTravelRequestId))
const { travelDeskTravelRequest } = useTravelDeskTravelRequest(travelDeskTravelRequestIdAsNumber)
const travelAuthorizationId = computed(() =>
  travelDeskTravelRequest.value?.travelAuthorizationId?.toString().padStart(4, "0")
)

const tabs = ref([
  {
    value: 1,
    title: "1. Traveler Details",
    to: {
      name: "travel-desk/edit/TravelDeskRequestTravelerDetailsPage",
      params: {
        travelDeskTravelRequestId: props.travelDeskTravelRequestId,
      },
    },
  },
  {
    value: 2,
    title: "2. Travel Request (Booking)",
    to: {
      name: "travel-desk/edit/TravelDeskRequestTravelRequestPage",
      params: {
        travelDeskTravelRequestId: props.travelDeskTravelRequestId,
      },
    },
  },
  {
    value: 3,
    title: "3. Trip Information (PNR details)",
    to: {
      name: "travel-desk/edit/TravelDeskRequestTripInformationPage",
      params: {
        travelDeskTravelRequestId: props.travelDeskTravelRequestId,
      },
    },
  },
  {
    value: 4,
    title: "Invoicing",
    to: {
      name: "travel-desk/edit/TravelDeskRequestInvoicingPage",
      params: {
        travelDeskTravelRequestId: props.travelDeskTravelRequestId,
      },
    },
  },
])
</script>
