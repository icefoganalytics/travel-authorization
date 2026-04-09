<template>
  <v-data-iterator
    :items="travelDeskFlightOptions"
    :server-items-length="totalCount"
    :loading="isLoading"
    hide-default-footer
  >
    <template #default="{ items }">
      <TravelDeskFlightOptionCard
        v-for="item in items"
        :key="item.raw.id"
        :flight-option="item.raw"
        :number-of-flight-options="totalCount"
        travel-desk-user
      />
    </template>
  </v-data-iterator>
</template>

<script setup>
import { computed } from "vue"

import useTravelDeskFlightOptions from "@/use/use-travel-desk-flight-options"

import TravelDeskFlightOptionCard from "@/components/travel-desk-flight-options/TravelDeskFlightOptionCard.vue"

const props = defineProps({
  where: {
    type: Object,
    default: () => ({}),
  },
  filters: {
    type: Object,
    default: () => ({}),
  },
})

const travelDeskFlightOptionsQuery = computed(() => ({
  where: props.where,
  filters: props.filters,
}))
const { travelDeskFlightOptions, totalCount, isLoading } = useTravelDeskFlightOptions(
  travelDeskFlightOptionsQuery
)
</script>
