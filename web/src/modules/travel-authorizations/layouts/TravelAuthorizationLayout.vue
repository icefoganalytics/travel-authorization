<template>
  <PageLoader v-if="isLoadingTravelAuthorization" />
  <div v-else>
    <Breadcrumbs />

    <h1>
      Travel -
      <UserChip :user-id="travelAuthorizationUser.id" />
    </h1>

    <SummaryHeaderPanel :travel-authorization-id="travelAuthorizationId" />

    <v-tabs>
      <DetailsTab :travel-authorization-id="travelAuthorizationId" />
      <EstimateTab :travel-authorization-id="travelAuthorizationId" />
      <ExpenseTab :travel-authorization-id="travelAuthorizationId" />
      <!-- TODO: add in any tabs that you can normally see in manage mode -->
    </v-tabs>

    <router-view></router-view>
  </div>
</template>

<script setup>
import { computed } from "vue"

import useTravelAuthorization from "@/use/use-travel-authorization"

import Breadcrumbs from "@/components/Breadcrumbs.vue"
import PageLoader from "@/components/PageLoader.vue"
import SummaryHeaderPanel from "@/components/travel-authorizations/SummaryHeaderPanelLegacy.vue"
import UserChip from "@/components/users/UserChip.vue"

import DetailsTab from "@/modules/travel-authorizations/components/travel-authorization-layout/DetailsTab.vue"
import EstimateTab from "@/modules/travel-authorizations/components/travel-authorization-layout/EstimateTab.vue"
import ExpenseTab from "@/modules/travel-authorizations/components/travel-authorization-layout/ExpenseTab.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

const { travelAuthorization, isLoading: isLoadingTravelAuthorization } = useTravelAuthorization(
  props.travelAuthorizationId
)
const travelAuthorizationUser = computed(() => travelAuthorization.value?.user)
</script>
