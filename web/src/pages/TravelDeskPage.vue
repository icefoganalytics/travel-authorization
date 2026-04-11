<template>
  <v-card>
    <v-card-title class="mb-n16">
      <h2>Travel Desk</h2>
    </v-card-title>

    <v-card-text>
      <TravelDeskTravelRequestsManageDataTableServer />
    </v-card-text>
  </v-card>
</template>

<script setup>
import useBreadcrumbs from "@/use/use-breadcrumbs"

import TravelDeskTravelRequestsManageDataTableServer from "@/components/travel-desk-travel-requests/TravelDeskTravelRequestsManageDataTableServer.vue"

useBreadcrumbs([
  {
    title: "Travel Desk",
    to: {
      name: "TravelDeskPage",
    },
  },
])
</script>
