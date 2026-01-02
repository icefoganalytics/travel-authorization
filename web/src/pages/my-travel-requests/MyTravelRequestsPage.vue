<template>
  <div>
    <div class="d-flex align-baseline my-5">
      <h1 class="mb-0">My Travel Requests</h1>
      <v-spacer />
      <CreateTravelAuthorizationButton class="my-0" />
      <RefreshTableButton
        class="ml-2"
        @click="refreshTable"
      />
    </div>

    <v-card class="default">
      <v-card-text>
        <MyTravelAuthorizationsTable ref="myTravelAuthorizationsTable" />
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from "vue"

import { useBreadcrumbs } from "@/use/use-breadcrumbs"

import RefreshTableButton from "@/components/common/table/RefreshTableButton.vue"
import CreateTravelAuthorizationButton from "@/modules/travel-authorizations/components/my-travel-authorizations-page/CreateTravelAuthorizationBtn.vue"
import MyTravelAuthorizationsTable from "@/modules/travel-authorizations/components/MyTravelAuthorizationsTable.vue"

const myTravelAuthorizationsTable = ref(null)

async function refreshTable() {
  await myTravelAuthorizationsTable.value?.refresh()
}

useBreadcrumbs([
  {
    text: "My Travel Requests",
    to: {
      name: "my-travel-requests/MyTravelRequestsPage",
    },
  },
])
</script>
