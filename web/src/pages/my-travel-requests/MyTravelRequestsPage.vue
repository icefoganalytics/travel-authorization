<template>
  <div>
    <div class="d-flex justify-space-between align-baseline my-5">
      <h1>
        My Travel Requests
        <v-btn
          class="ma-0 ml-1"
          icon
          color="green"
          title="Refresh Table"
          @click="refresh"
        >
          <v-icon>mdi-cached</v-icon>
        </v-btn>
      </h1>
      <CreateTravelAuthorizationButton class="my-0" />
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

import CreateTravelAuthorizationButton from "@/modules/travel-authorizations/components/my-travel-authorizations-page/CreateTravelAuthorizationBtn.vue"
import MyTravelAuthorizationsTable from "@/modules/travel-authorizations/components/MyTravelAuthorizationsTable.vue"

const myTravelAuthorizationsTable = ref(null)

async function refresh() {
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
