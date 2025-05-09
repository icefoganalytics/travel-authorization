<template>
  <div class="mt-4">
    <v-row>
      <v-col>
        <PurposeCard :travel-authorization-id="travelAuthorizationIdAsNumber" />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <DetailsCard :travel-authorization-id="travelAuthorizationIdAsNumber" />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <ApprovalsCard
          ref="approvalsCard"
          :travel-authorization-id="travelAuthorizationIdAsNumber"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <ManagementCard
          :travel-authorization-id="travelAuthorizationIdAsNumber"
          @approved="refresh"
          @denied="refresh"
        />
      </v-col>
    </v-row>
    <div class="d-flex justify-end">
      <v-btn
        class="ml-3"
        color="secondary"
        :to="{ name: 'ManageTravelRequests' }"
        >Back</v-btn
      >
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue"

import PurposeCard from "@/components/travel-authorizations/PurposeCard.vue"
import DetailsCard from "@/components/travel-authorizations/DetailsCard.vue"
import ApprovalsCard from "@/modules/travel-authorizations/components/read-travel-authorization-details-page/ApprovalsCard.vue"

import ManagementCard from "@/modules/travel-authorizations/components/manage-travel-authorization-details-page/ManagementCard.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: String,
    required: true,
  },
})

const travelAuthorizationIdAsNumber = computed(() => parseInt(props.travelAuthorizationId))

/** @type {import('vue').Ref<InstanceType<typeof ApprovalsCard> | null>} */
const approvalsCard = ref(null)

function refresh() {
  approvalsCard.value.refresh()
}
</script>
