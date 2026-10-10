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
    v-model:page="page"
    :items="travelDeskFlightOptions"
    :items-length="totalCount"
    :items-per-page="PER_PAGE"
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
    <template #footer="{ pageCount }">
      <v-pagination
        v-if="pageCount > 1"
        v-model="page"
        :length="pageCount"
        class="mt-4"
      />
    </template>
  </v-data-iterator>
</template>

<script setup>
import { computed, watch } from "vue"

import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
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
  routeQuerySuffix: {
    type: String,
    required: true,
  },
})

const PER_PAGE = 5
const page = useRouteQuery(`page${props.routeQuerySuffix}`, "1", {
  transform: integerTransformer,
})

watch(
  [() => props.where, () => props.filters],
  () => {
    page.value = 1
  },
  { deep: true }
)

const travelDeskFlightOptionsQuery = computed(() => ({
  where: props.where,
  filters: props.filters,
  page: page.value,
  perPage: PER_PAGE,
}))
const { travelDeskFlightOptions, totalCount, isLoading, isErrored } = useTravelDeskFlightOptions(
  travelDeskFlightOptionsQuery
)
</script>
