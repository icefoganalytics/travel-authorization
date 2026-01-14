<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <h3 class="mb-0">Hotel Requests</h3>
      <v-spacer />
      <v-btn
        class="my-0"
        color="primary"
        :to="{
          name: 'travel-desk/hotels/TravelDeskHotelNewPage',
          params: {
            travelDeskTravelRequestId: travelDeskTravelRequestId.toString(),
          },
          query: {
            returnTo,
          },
        }"
      >
        New Hotel
      </v-btn>
    </v-card-title>
    <v-card-text>
      <TravelDeskHotelsEditTable
        ref="travelDeskHotelsEditTable"
        :where="travelDeskHotelsWhere"
        :return-to="returnTo"
        route-query-suffix="TravelDeskHotel"
        @updated="emit('updated')"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"

import TravelDeskHotelsEditTable from "@/components/travel-desk-hotels/TravelDeskHotelsEditTable.vue"

const props = defineProps<{
  travelDeskTravelRequestId: number
  returnTo?: string
}>()

const emit = defineEmits<{
  (event: "updated"): void
}>()

const travelDeskHotelsWhere = computed(() => ({
  travelRequestId: props.travelDeskTravelRequestId,
}))

const travelDeskHotelsEditTable = ref<InstanceType<typeof TravelDeskHotelsEditTable> | null>(null)

async function refresh() {
  await travelDeskHotelsEditTable.value?.refresh()
}

defineExpose({
  refresh,
})
</script>

<style scoped></style>
