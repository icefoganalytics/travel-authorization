<template>
  <v-data-table-server
    v-model:page="page"
    v-model:items-per-page="perPage"
    v-bind="$attrs"
    :headers="headers"
    :items="travelAuthorizations"
    :loading="isLoading"
    :items-length="totalCount"
    @click:row="goToFinanceReview"
  >
    <template #item.name="{ item }">
      <span>{{ item.firstName }} {{ item.lastName }}</span>
    </template>
    <template #item.purposeText="{ value }">
      <span>{{ value }}</span>
    </template>
    <template #item.finalDestination="{ value }">
      <span>{{ formatFinalDestination(value) }}</span>
    </template>
    <template #item.departingAt="{ value }">
      <span>{{ formatDate(value) }}</span>
    </template>
    <template #item.returningAt="{ value }">
      <span>{{ formatDate(value) }}</span>
    </template>
  </v-data-table-server>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { isNil } from "lodash"
import { useRouter } from "vue-router"

import formatDate from "@/utils/format-date"
import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"

import { type LocationAsReference } from "@/api/locations-api"
import useTravelAuthorizations, {
  type TravelAuthorizationAsIndex,
} from "@/use/use-travel-authorizations"

const props = withDefaults(
  defineProps<{
    where?: Record<string, unknown>
    filters?: Record<string, unknown>
    routeQuerySuffix?: string
  }>(),
  {
    where: () => ({}),
    filters: () => ({}),
    routeQuerySuffix: "",
  }
)

const headers = ref([
  {
    title: "TA #",
    key: "id",
    sortable: false,
  },
  {
    title: "Requestee",
    key: "name",
    sortable: false,
  },
  {
    title: "Department",
    key: "department",
  },
  {
    title: "Final Destination",
    key: "finalDestination",
    sortable: false,
  },
  {
    title: "Type",
    key: "purposeText",
    sortable: false,
  },
  {
    title: "Departure Date",
    key: "departingAt",
    sortable: false,
  },
  {
    title: "Return Date",
    key: "returningAt",
    sortable: false,
  },
])

const page = useRouteQuery<string, number>(`page${props.routeQuerySuffix}`, "1", {
  transform: integerTransformer,
})
const perPage = useRouteQuery<string, number>(`perPage${props.routeQuerySuffix}`, "10", {
  transform: integerTransformer,
})

const travelAuthorizationsQuery = computed(() => {
  return {
    where: props.where,
    filters: props.filters,
    page: page.value,
    perPage: perPage.value,
  }
})
const { travelAuthorizations, totalCount, isLoading, refresh } =
  useTravelAuthorizations(travelAuthorizationsQuery)

function formatFinalDestination(location: LocationAsReference | null) {
  if (isNil(location)) return ""

  const { city, province } = location
  return `${city} (${province})`
}

const router = useRouter()

type TravelAuthorizationTableRow = {
  item: TravelAuthorizationAsIndex
}

function goToFinanceReview(
  _event: unknown,
  { item: travelAuthorization }: TravelAuthorizationTableRow
) {
  const travelAuthorizationId = travelAuthorization.id.toString()
  router.push({
    name: "expense-processing/ExpenseProcessingDetailsPage",
    params: {
      travelAuthorizationId,
    },
  })
}

defineExpose({
  refresh,
})
</script>
