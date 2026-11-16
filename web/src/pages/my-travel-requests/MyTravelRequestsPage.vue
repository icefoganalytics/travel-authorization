<template>
  <div>
    <v-card-title class="d-flex align-center pt-0 mb-3 ga-2">
      <h2 class="mb-0">My Travel Requests</h2>
      <v-spacer />
      <RefreshTableButton @click="refreshTable" />
      <TravelAuthorizationCreateButton class="my-0" />
    </v-card-title>

    <v-card color="surface-variant">
      <v-card-text>
        <MyTravelAuthorizationsDataTableServer ref="myTravelAuthorizationsTable" />
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef } from "vue"

import { useBreadcrumbs } from "@/use/use-breadcrumbs"

import RefreshTableButton from "@/components/common/table/RefreshTableButton.vue"
import MyTravelAuthorizationsDataTableServer from "@/components/travel-authorizations/my/MyTravelAuthorizationsDataTableServer.vue"
import TravelAuthorizationCreateButton from "@/components/travel-authorizations/my/TravelAuthorizationCreateButton.vue"

const myTravelAuthorizationsTable = useTemplateRef("myTravelAuthorizationsTable")

async function refreshTable() {
  await myTravelAuthorizationsTable.value?.refresh()
}

useBreadcrumbs([
  {
    title: "My Travel Requests",
    to: {
      name: "my-travel-requests/MyTravelRequestsPage",
    },
  },
])
</script>
