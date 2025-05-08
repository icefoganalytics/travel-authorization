<template>
  <div>
    <Breadcrumbs />

    <SummaryHeaderPanel :travel-authorization-id="travelAuthorizationIdAsNumber" />

    <v-tabs>
      <DetailsTab :travel-authorization-id="travelAuthorizationIdAsNumber" />
      <EstimateTab :travel-authorization-id="travelAuthorizationIdAsNumber" />
      <ExpenseTab :travel-authorization-id="travelAuthorizationIdAsNumber" />
      <!-- TODO: add in any tabs that you can normally see in manage mode -->
    </v-tabs>

    <router-view></router-view>
  </div>
</template>

<script setup>
import { computed } from "vue"

import Breadcrumbs from "@/components/Breadcrumbs.vue"
import SummaryHeaderPanel from "@/components/travel-authorizations/SummaryHeaderPanel.vue"

import DetailsTab from "@/modules/travel-authorizations/components/travel-authorization-layout/DetailsTab.vue"
import EstimateTab from "@/modules/travel-authorizations/components/travel-authorization-layout/EstimateTab.vue"
import ExpenseTab from "@/modules/travel-authorizations/components/travel-authorization-layout/ExpenseTab.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: String,
    required: true,
  },
})

const travelAuthorizationIdAsNumber = computed(() => parseInt(props.travelAuthorizationId))
</script>
