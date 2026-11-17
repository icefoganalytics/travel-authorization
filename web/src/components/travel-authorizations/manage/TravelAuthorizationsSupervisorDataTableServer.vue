<template>
  <v-data-table-server
    v-model:page="page"
    v-model:items-per-page="perPage"
    :headers="headers"
    :items="travelAuthorizations"
    :loading="isLoading"
    :items-length="totalCount"
    v-bind="attrsWithRowClickFallback"
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

<script lang="ts">
import { type TravelAuthorizationAsIndex } from "@/use/use-travel-authorizations"

export type TravelAuthorizationTableRow = {
  item: TravelAuthorizationAsIndex
}
</script>

<script setup lang="ts">
import { computed, ref, useAttrs } from "vue"
import { isNil } from "lodash"
import { useRouter } from "vue-router"

import formatDate from "@/utils/format-date"
import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"

import { type LocationAsReference } from "@/api/locations-api"
import useCurrentUser from "@/use/use-current-user"
import useTravelAuthorizations, {
  type TravelAuthorizationFiltersOptions,
  type TravelAuthorizationWhereOptions,
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

const attrs = useAttrs()

const attrsWithRowClickFallback = computed(() => ({
  "onClick:row": goToManageTravelAuthorization,
  ...attrs,
}))

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

const { currentUser } = useCurrentUser<true>()

const travelAuthorizationsQuery = computed(() => {
  return {
    where: props.where,
    filters: {
      ...props.filters,
      notOwnedByUserId: currentUser.value.id,
    },
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

function goToManageTravelAuthorization(
  _event: unknown,
  { item: travelAuthorization }: TravelAuthorizationTableRow
) {
  const travelAuthorizationId = travelAuthorization.id.toString()
  router.push({
    name: "manage-travel-requests/ManageTravelRequestDetailsPage",
    params: {
      travelAuthorizationId,
    },
  })
}

defineExpose({
  refresh,
})
</script>
