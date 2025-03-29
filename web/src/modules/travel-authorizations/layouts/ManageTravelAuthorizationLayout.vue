<template>
  <PageLoader v-if="isLoadingTravelAuthorization" />
  <div v-else>
    <Breadcrumbs />

    <h1 class="d-flex justify-space-between">
      <span>
        Travel -
        <UserChip :user-id="travelAuthorizationUser.id" />
      </span>
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn
            v-if="isAdmin"
            color="primary"
            v-bind="attrs"
            v-on="on"
            @click="goToAdminEditPage"
          >
            Edit
            <v-icon
              small
              right
            >
              mdi-help-circle-outline
            </v-icon>
          </v-btn>
        </template>
        <span>You can edit this because you are an admin.</span>
      </v-tooltip>
    </h1>

    <SummaryHeaderPanelLegacy :travel-authorization-id="travelAuthorizationId" />

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
import { useRouter } from "vue2-helpers/vue-router"

import useCurrentUser from "@/use/use-current-user"
import useTravelAuthorization from "@/use/use-travel-authorization"

import Breadcrumbs from "@/components/Breadcrumbs.vue"
import PageLoader from "@/components/PageLoader.vue"
import SummaryHeaderPanelLegacy from "@/components/travel-authorizations/SummaryHeaderPanelLegacy.vue"
import UserChip from "@/components/users/UserChip.vue"

import DetailsTab from "@/modules/travel-authorizations/components/manage-travel-authorization-layout/DetailsTab.vue"
import EstimateTab from "@/modules/travel-authorizations/components/manage-travel-authorization-layout/EstimateTab.vue"
import ExpenseTab from "@/modules/travel-authorizations/components/manage-travel-authorization-layout/ExpenseTab.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

const router = useRouter()
const { isAdmin } = useCurrentUser()
const { travelAuthorization, isLoading: isLoadingTravelAuthorization } = useTravelAuthorization(
  props.travelAuthorizationId
)
const travelAuthorizationUser = computed(() => travelAuthorization.value?.user)

function goToAdminEditPage() {
  router.push({
    name: "EditTravelAuthorizationDetailsPage",
    params: { travelAuthorizationId: props.travelAuthorizationId },
  })
}
</script>
