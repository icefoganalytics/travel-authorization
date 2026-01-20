<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <SectionHeader
        title="4. Other Transportation Requests"
        icon="mdi-bus"
        tag="h3"
        class="mb-0"
      />
      <v-spacer />
      <v-btn
        class="my-0"
        color="primary"
        :to="{
          name: 'travel-desk/other-transportations/TravelDeskOtherTransportationNewPage',
          params: {
            travelDeskTravelRequestId: travelDeskTravelRequestId.toString(),
          },
          query: {
            returnTo,
          },
        }"
      >
        New Transportation
      </v-btn>
    </v-card-title>
    <v-card-text>
      <TravelDeskOtherTransportationEditDataTable
        ref="travelDeskOtherTransportationEditDataTable"
        :where="travelDeskOtherTransportationsWhere"
        :return-to="returnTo"
        route-query-suffix="TravelDeskOtherTransportation"
        @updated="emit('updated')"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"

import SectionHeader from "@/components/common/SectionHeader.vue"

import TravelDeskOtherTransportationEditDataTable from "@/components/travel-desk-other-transportations/TravelDeskOtherTransportationEditDataTable.vue"

const props = defineProps<{
  travelDeskTravelRequestId: number
  returnTo?: string
}>()

const emit = defineEmits<{
  (event: "updated"): void
}>()

const travelDeskOtherTransportationsWhere = computed(() => ({
  travelRequestId: props.travelDeskTravelRequestId,
}))

const travelDeskOtherTransportationEditDataTable = ref<InstanceType<
  typeof TravelDeskOtherTransportationEditDataTable
> | null>(null)

async function refresh() {
  await travelDeskOtherTransportationEditDataTable.value?.refresh()
}

defineExpose({
  refresh,
})
</script>
