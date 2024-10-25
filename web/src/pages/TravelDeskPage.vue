<template>
  <v-card>
    <v-card-title>
      <h2>Travel Desk</h2>
    </v-card-title>

    <v-card-text>
      <TravelDeskTravelRequestsManageDataTable />
    </v-card-text>
  </v-card>
</template>

<script setup>
import useBreadcrumbs from "@/use/use-breadcrumbs"

import TravelDeskTravelRequestsManageDataTable from "@/components/travel-desk-travel-requests/TravelDeskTravelRequestsManageDataTable.vue"

useBreadcrumbs([
  {
    text: "Travel Desk",
    to: {
      name: "TravelDeskPage",
    },
  },
])
</script>
