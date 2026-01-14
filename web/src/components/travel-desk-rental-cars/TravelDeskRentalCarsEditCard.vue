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
          query: {
            returnTo,
          },
        }"
      >
        New Rental Car
      </v-btn>
    </v-card-title>
    <v-card-text>
      <TravelDeskRentalCarsEditDataTable
        ref="travelDeskRentalCarsEditDataTable"
        :where="travelDeskRentalCarsWhere"
        :return-to="returnTo"
        route-query-suffix="TravelDeskRentalCar"
        @updated="emit('updated')"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"

import TravelDeskRentalCarsEditDataTable from "@/components/travel-desk-rental-cars/TravelDeskRentalCarsEditDataTable.vue"

const props = defineProps<{
  travelDeskTravelRequestId: number
  returnTo?: string
}>()

// TODO: switch to `updated: [void]` syntax in Vue 3
const emit = defineEmits<{
  (event: "updated"): void
}>()

const travelDeskRentalCarsWhere = computed(() => ({
  travelRequestId: props.travelDeskTravelRequestId,
}))

const travelDeskRentalCarsEditDataTable = ref<InstanceType<
  typeof TravelDeskRentalCarsEditDataTable
> | null>(null)

async function refresh() {
  await travelDeskRentalCarsEditDataTable.value?.refresh()
}

defineExpose({
  refresh,
})
</script>
