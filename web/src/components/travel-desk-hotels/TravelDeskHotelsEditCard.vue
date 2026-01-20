<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <SectionHeader
        title="3. Hotel Requests"
        icon="mdi-bed"
        tag="h3"
        class="mb-0"
      />
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
      <TravelDeskHotelsEditDataTable
        ref="travelDeskHotelsEditDataTable"
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

import SectionHeader from "@/components/common/SectionHeader.vue"

import TravelDeskHotelsEditDataTable from "@/components/travel-desk-hotels/TravelDeskHotelsEditDataTable.vue"

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

const travelDeskHotelsEditDataTable = ref<InstanceType<
  typeof TravelDeskHotelsEditDataTable
> | null>(null)

async function refresh() {
  await travelDeskHotelsEditDataTable.value?.refresh()
}

defineExpose({
  refresh,
})
</script>

<style scoped></style>
