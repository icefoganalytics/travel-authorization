<template>
  <v-card>
    <v-card-title>
      <h4>Rental Car Requests</h4>
    </v-card-title>
    <v-card-text class="px-0 px-md-4">
      <TravelDeskRentalCarsDataTable
        :where="travelDeskRentalCarsWhere"
        hide-default-footer
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue"

import TravelDeskRentalCarsDataTable from "@/components/travel-desk-rental-cars/TravelDeskRentalCarsDataTable.vue"

const props = defineProps<{
  travelDeskTravelRequestId: number
}>()

const travelDeskRentalCarsWhere = computed(() => ({
  travelRequestId: props.travelDeskTravelRequestId,
}))
</script>

<style scoped></style>
