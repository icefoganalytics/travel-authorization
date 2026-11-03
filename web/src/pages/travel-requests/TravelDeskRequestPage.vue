<template>
  <v-container>
    <v-btn
      :to="{ name: 'travel-requests/TravelDeskRequestsPage' }"
      prepend-icon="mdi-arrow-left"
      variant="text"
    >
      Travel Requests
    </v-btn>
    <h1 class="text-h4 mb-4">Travel Desk Request</h1>
    <TravelDeskTravelAuthorizationRequestGuard
      :key="travelAuthorizationId"
      :travel-authorization-id="travelAuthorizationId"
      :return-to="returnTo"
    />
  </v-container>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useRoute } from "vue-router"

import TravelDeskTravelAuthorizationRequestGuard from "@/components/travel-desk-travel-requests/TravelDeskTravelAuthorizationRequestGuard.vue"

const props = defineProps<{
  travelAuthorizationId: number | string
}>()

const route = useRoute()

const returnTo = computed(() => route.fullPath)

const travelAuthorizationId = computed(() => Number(props.travelAuthorizationId))
</script>
