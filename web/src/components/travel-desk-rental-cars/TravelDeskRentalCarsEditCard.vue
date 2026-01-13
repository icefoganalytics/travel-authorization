<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <h3 class="mb-0">Rental Car Requests</h3>
      <v-spacer />
      <v-btn
        class="my-0"
        color="primary"
        :to="{
          name: 'travel-desk/rental-cars/TravelDeskRentalCarNewPage',
          params: {
            travelDeskTravelRequestId: travelDeskTravelRequestId.toString(),
          },
        }"
      >
        New Rental Car
      </v-btn>
    </v-card-title>
    <v-card-text>
      <TravelDeskRentalCarsEditTable
        ref="travelDeskRentalCarsEditTable"
        :where="travelDeskRentalCarsWhere"
        route-query-suffix="TravelDeskRentalCar"
        @updated="emit('updated')"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"

import TravelDeskRentalCarsEditTable from "@/components/travel-desk-rental-cars/TravelDeskRentalCarsEditTable.vue"

const props = defineProps<{
  travelDeskTravelRequestId: number
}>()

// TODO: switch to `updated: [void]` syntax in Vue 3
const emit = defineEmits<{
  (event: "updated"): void
}>()

const travelDeskRentalCarsWhere = computed(() => ({
  travelRequestId: props.travelDeskTravelRequestId,
}))

const travelDeskRentalCarsEditTable = ref<InstanceType<
  typeof TravelDeskRentalCarsEditTable
> | null>(null)

async function refresh() {
  await travelDeskRentalCarsEditTable.value?.refresh()
}

defineExpose({
  refresh,
})
</script>
