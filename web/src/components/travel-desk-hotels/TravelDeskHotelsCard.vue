<template>
  <v-card>
    <v-card-title>
      <h4>Hotel Requests</h4>
    </v-card-title>
    <v-card-text class="px-0 px-md-4">
      <TravelDeskHotelsDataTableServer
        :where="travelDeskHotelsWhere"
        hide-default-footer
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue"

import TravelDeskHotelsDataTableServer from "@/components/travel-desk-hotels/TravelDeskHotelsDataTableServer.vue"

const props = defineProps<{
  travelDeskTravelRequestId: number
}>()

const travelDeskHotelsWhere = computed(() => ({
  travelRequestId: props.travelDeskTravelRequestId,
}))
</script>

<style scoped></style>
