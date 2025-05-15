<template>
  <div>
    <Breadcrumbs />

    <SummaryHeaderPanel :travel-authorization-id="travelAuthorizationIdAsNumber" />

    <v-tabs>
      <v-tab
        :to="{
          name: 'EditTravelAuthorizationDetailsPage',
          params: {
            travelAuthorizationId,
          },
        }"
      >
        Details
      </v-tab>
      <v-tab
        :to="{
          name: 'EditTravelAuthorizationEstimatePage',
          params: {
            travelAuthorizationId,
          },
        }"
        >Estimate</v-tab
      >
      <v-tab
        :to="{
          name: 'EditTravelAuthorizationExpensePage',
          params: { travelAuthorizationId },
        }"
      >
        Expense
      </v-tab>
      <!-- TODO: add in any tabs that you can normally see in manage mode -->
    </v-tabs>

    <router-view></router-view>
  </div>
</template>

<script setup>
import { computed } from "vue"

import Breadcrumbs from "@/components/Breadcrumbs.vue"
import SummaryHeaderPanel from "@/components/travel-authorizations/SummaryHeaderPanel.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: String,
    required: true,
  },
})

const travelAuthorizationIdAsNumber = computed(() => parseInt(props.travelAuthorizationId))
</script>
