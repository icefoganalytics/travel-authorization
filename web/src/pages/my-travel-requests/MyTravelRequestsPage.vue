<template>
  <div>
    <div class="d-flex align-center my-3 ga-2">
      <h2 class="mb-0">My Travel Requests</h2>
      <v-spacer />
      <RefreshTableButton @click="refreshTable" />
      <CreateTravelAuthorizationButton class="my-0" />
    </div>

    <v-card class="default">
      <v-card-text>
        <MyTravelAuthorizationsDataTableServer ref="myTravelAuthorizationsTable" />
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from "vue"

import { useBreadcrumbs } from "@/use/use-breadcrumbs"

import RefreshTableButton from "@/components/common/table/RefreshTableButton.vue"
import CreateTravelAuthorizationButton from "@/modules/travel-authorizations/components/my-travel-authorizations-page/CreateTravelAuthorizationBtn.vue"
import MyTravelAuthorizationsDataTableServer from "@/modules/travel-authorizations/components/MyTravelAuthorizationsDataTableServer.vue"

const myTravelAuthorizationsTable = ref(null)

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
