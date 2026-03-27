<template>
  <v-card>
    <v-card-title>
      <h4>Hotel Requests</h4>
    </v-card-title>
    <v-card-text class="px-0 px-md-4">
      <TravelDeskHotelsDataTable
        :where="travelDeskHotelsWhere"
        hide-default-footer
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue"

import TravelDeskHotelsDataTable from "@/components/travel-desk-hotels/TravelDeskHotelsDataTable.vue"

const props = defineProps<{
  travelDeskTravelRequestId: number
}>()

const travelDeskHotelsWhere = computed(() => ({
  travelRequestId: props.travelDeskTravelRequestId,
}))
</script>

<style scoped></style>
