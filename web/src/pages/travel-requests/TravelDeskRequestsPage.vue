<template>
  <v-container>
    <v-card-title class="d-flex align-center pt-0 mb-3 ga-2">
      <h1 class="text-h4 mb-0">Travel Desk Requests</h1>
      <v-spacer />
      <RefreshTableButton @click="refreshTable" />
    </v-card-title>
    <v-card>
      <v-card-text>
        <TravelDeskRequestsDataTableServer ref="travelDeskRequestsTable" />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { useTemplateRef } from "vue"

import useBreadcrumbs from "@/use/use-breadcrumbs"

import RefreshTableButton from "@/components/common/table/RefreshTableButton.vue"
import TravelDeskRequestsDataTableServer from "@/components/travel-desk-travel-requests/TravelDeskRequestsDataTableServer.vue"

const travelDeskRequestsTable = useTemplateRef("travelDeskRequestsTable")

async function refreshTable() {
  await travelDeskRequestsTable.value?.refresh()
}

useBreadcrumbs([
  {
    title: "Travel Desk Requests",
    to: {
      name: "travel-requests/TravelDeskRequestsPage",
    },
  },
])
</script>
