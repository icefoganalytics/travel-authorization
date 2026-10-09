<template>
  <v-skeleton-loader
    v-if="isLoading"
    type="card"
  />
  <v-alert
    v-else-if="isErrored"
    type="error"
    variant="outlined"
  >
    Failed to load flight options. Reload the page to try again.
  </v-alert>
  <v-data-iterator
    v-else
    :items="travelDeskFlightOptions"
    :items-length="totalCount"
    :items-per-page="-1"
  >
    <template #default="{ items }">
      <TravelDeskFlightOptionCard
        v-for="item in items"
        :key="item.raw.id"
        :flight-option="item.raw"
        :number-of-flight-options="totalCount"
      />
    </template>
    <template #no-data>
      <p>No flight options available.</p>
    </template>
  </v-data-iterator>
</template>

<script setup>
import { computed } from "vue"

import { MAX_PER_PAGE } from "@/api/base-api"
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
  perPage: MAX_PER_PAGE,
}))
const { travelDeskFlightOptions, totalCount, isLoading, isErrored } = useTravelDeskFlightOptions(
  travelDeskFlightOptionsQuery
)
</script>
