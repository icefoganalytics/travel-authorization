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
    v-model:items-per-page="perPage"
    :items="travelDeskFlightOptions"
    :items-length="totalCount"
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
    <template #footer>
      <EnhancedPagination
        v-if="totalCount > perPage"
        v-model="page"
        v-model:per-page="perPage"
        :total-count="totalCount"
        class="mt-4"
      />
    </template>
  </v-data-iterator>
</template>

<script setup lang="ts">
import { computed, watch } from "vue"

import type {
  TravelDeskFlightOptionFiltersOptions,
  TravelDeskFlightOptionWhereOptions,
} from "@/api/travel-desk-flight-options-api"
import useRouteQueryPagination from "@/use/utils/use-route-query-pagination"
import useTravelDeskFlightOptions from "@/use/use-travel-desk-flight-options"

import EnhancedPagination from "@/components/common/EnhancedPagination.vue"
import TravelDeskFlightOptionCard from "@/components/travel-desk-flight-options/TravelDeskFlightOptionCard.vue"

const props = withDefaults(
  defineProps<{
    where?: TravelDeskFlightOptionWhereOptions
    filters?: TravelDeskFlightOptionFiltersOptions
    routeQuerySuffix: string
    defaultPerPage?: number
  }>(),
  {
    where: () => ({}),
    filters: () => ({}),
    defaultPerPage: 5,
  }
)

const { page, perPage } = useRouteQueryPagination({
  perPage: props.defaultPerPage,
  routeQuerySuffix: props.routeQuerySuffix,
})

watch(
  [() => props.where, () => props.filters, perPage],
  () => {
    page.value = 1
  },
  { deep: true }
)

const travelDeskFlightOptionsQuery = computed(() => ({
  where: props.where,
  filters: props.filters,
  page: page.value,
  perPage: perPage.value,
}))
const { travelDeskFlightOptions, totalCount, isLoading, isErrored } = useTravelDeskFlightOptions(
  travelDeskFlightOptionsQuery
)
</script>
