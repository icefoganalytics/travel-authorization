<template>
  <v-data-table-server
    v-model:page="page"
    v-model:items-per-page="perPage"
    v-bind="$attrs"
    :headers="headers"
    :items="travelAuthorizations"
    :loading="isLoading"
    :items-length="totalCount"
    class="elevation-2"
    @click:row="goToManageTravelAuthorization"
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
import useCurrentUser from "@/use/use-current-user"
import useTravelAuthorizations, {
  type TravelAuthorizationAsIndex,
} from "@/use/use-travel-authorizations"

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
    default: "",
  },
})

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
    where: {
      ...props.where,
      supervisorEmail: currentUser.value.email,
    },
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

function goToManageTravelAuthorization(travelAuthorization: TravelAuthorizationAsIndex) {
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
