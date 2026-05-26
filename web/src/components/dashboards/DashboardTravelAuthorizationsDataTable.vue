<template>
  <v-data-table-server
    v-model:page="page"
    v-model:items-per-page="perPage"
    v-model:sort-by="sortBy"
    :headers="headers"
    :items="travelAuthorizations"
    :loading="isLoading"
    :items-length="totalCount"
    @click:row="openTravelAuthorization"
  >
    <template #item.eventName="{ value }">
      {{ value || "Not specified" }}
    </template>
    <template #item.departingAt="{ value }">
      {{ formatDate(value) }}
    </template>
    <template #item.returningAt="{ value }">
      {{ formatDate(value) }}
    </template>
    <template #item.status="{ value }">
      {{ formatStatus(value) }}
    </template>
  </v-data-table-server>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { useRouter } from "vue-router"
import { DateTime } from "luxon"

import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"

import useTravelAuthorizations, {
  type TravelAuthorizationQueryOptions,
  type TravelAuthorizationWhereOptions,
  type TravelAuthorizationFiltersOptions,
} from "@/use/use-travel-authorizations"

const props = withDefaults(
  defineProps<{
    where?: TravelAuthorizationWhereOptions
    filters?: TravelAuthorizationFiltersOptions
    routeQuerySuffix?: string
  }>(),
  {
    where: () => ({}),
    filters: () => ({}),
    routeQuerySuffix: "",
  }
)

const router = useRouter()

const headers = ref([
  {
    title: "Purpose",
    key: "eventName",
  },
  {
    title: "Departure Date",
    key: "departingAt",
  },
  {
    title: "Return Date",
    key: "returningAt",
  },
  {
    title: "Status",
    key: "status",
  },
])

const page = useRouteQuery<string | undefined, number | undefined>(
  `page${props.routeQuerySuffix}`,
  "1",
  {
    transform: integerTransformer,
  }
)
const perPage = useRouteQuery<string | undefined, number | undefined>(
  `perPage${props.routeQuerySuffix}`,
  "10",
  {
    transform: integerTransformer,
  }
)
const sortBy = useVuetifySortByToSafeRouteQuery(`sortBy${props.routeQuerySuffix}`, [
  {
    key: "createdAt",
    order: "desc",
  },
])
const order = useVuetifySortByToSequelizeSafeOrder(sortBy)

const travelAuthorizationsQuery = computed<TravelAuthorizationQueryOptions>(() => ({
  where: props.where,
  filters: props.filters,
  order: order.value,
  perPage: perPage.value,
  page: page.value,
}))

const { travelAuthorizations, totalCount, isLoading } =
  useTravelAuthorizations(travelAuthorizationsQuery)

function openTravelAuthorization(
  _event: unknown,
  { item }: { item: { id: number; wizardStepName: string | null } }
) {
  router.push({
    name: "my-travel-requests/MyTravelRequestWizardPage",
    params: {
      travelAuthorizationId: item.id.toString(),
      stepName: item.wizardStepName || "awaiting-supervisor-approval",
    },
  })
}

function formatDate(date: string | null) {
  if (!date) return "Not specified"
  return DateTime.fromISO(date, { zone: "utc" }).toFormat("d-LLLL-yyyy")
}

function formatStatus(value: string) {
  return value
}
</script>
