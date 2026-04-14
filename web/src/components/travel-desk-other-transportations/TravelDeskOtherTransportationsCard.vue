<template>
  <v-card>
    <v-card-title>
      <h4>Other Transportation Requests</h4>
    </v-card-title>
    <v-card-text class="px-0 px-md-4">
      <TravelDeskOtherTransportationsDataTableServer
        :where="travelDeskOtherTransportationsWhere"
        hide-default-footer
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue"

import TravelDeskOtherTransportationsDataTableServer from "@/components/travel-desk-other-transportations/TravelDeskOtherTransportationsDataTableServer.vue"

const props = defineProps<{
  travelDeskTravelRequestId: number
}>()

const travelDeskOtherTransportationsWhere = computed(() => ({
  travelRequestId: props.travelDeskTravelRequestId,
}))
</script>

<style scoped></style>
