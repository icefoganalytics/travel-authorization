<template>
  <v-data-table-server
    v-model:page="page"
    v-model:items-per-page="perPage"
    v-model:sort-by="sortBy"
    :headers="headers"
    :items="travelAuthorizations"
    :items-length="totalCount"
    :loading="isLoading || !isReady"
    :hide-default-footer="!isReady || (isLoading && totalCount === 0)"
    item-value="id"
    must-sort
  >
    <template #top>
      <v-alert
        v-if="isErrored"
        type="error"
      >
        Travel Desk Requests could not be loaded.
      </v-alert>
    </template>
    <template #item.name="{ item }">
      {{ item.firstName ?? "" }} {{ item.lastName ?? "" }}
    </template>
    <template #item.departingAt="{ item }">
      {{ formatTravelDate(item.departingAt) }}
    </template>
    <template #item.returningAt="{ item }">
      {{ formatTravelDate(item.returningAt) }}
    </template>
    <template #item.locations="{ item }">
      <div class="d-flex flex-wrap ga-1">
        <v-chip
          v-for="location in item.locations"
          :key="location.id"
          variant="outlined"
        >
          {{ location.city }} ({{ location.province }})
        </v-chip>
      </div>
    </template>
    <template #item.status="{ item }">
      {{ formatAuthorizationStatus(item.status) }}
    </template>
    <template #item.travelDeskTravelRequest="{ item }">
      <span v-if="item.travelDeskTravelRequest">
        {{
          t(
            `travel_desk_travel_request.status.${item.travelDeskTravelRequest.status}`,
            item.travelDeskTravelRequest.status
          )
        }}
      </span>
      <span v-else>Not created</span>
    </template>
    <template #item.actions="{ item }">
      <v-btn
        :to="{
          name: 'travel-requests/TravelDeskRequestPage',
          params: {
            travelAuthorizationId: item.id,
          },
        }"
        variant="text"
      >
        {{ requestActionLabel(item.travelDeskTravelRequest?.status) }}
      </v-btn>
    </template>
  </v-data-table-server>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { isNil } from "lodash"

import formatDate from "@/utils/format-date"
import useRouteQueryPagination from "@/use/utils/use-route-query-pagination"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"

import { type TravelAuthorizationQueryOptions } from "@/api/travel-authorizations-api"
import { TravelDeskTravelRequestStatuses } from "@/api/travel-desk-travel-requests-api"

import useCurrentUser from "@/use/use-current-user"
import useTravelAuthorizations from "@/use/use-travel-authorizations"

const props = withDefaults(
  defineProps<{
    defaultPerPage?: number
  }>(),
  {
    defaultPerPage: 15,
  }
)

const headers = [
  {
    title: "Travel Auth #",
    key: "id",
  },
  {
    title: "Traveller",
    key: "name",
    sortable: false,
  },
  {
    title: "Purpose",
    key: "purposeText",
    sortable: false,
  },
  {
    title: "Departure",
    key: "departingAt",
    sortable: false,
  },
  {
    title: "Return",
    key: "returningAt",
    sortable: false,
  },
  {
    title: "Locations",
    key: "locations",
    sortable: false,
  },
  {
    title: "Authorization Status",
    key: "status",
  },
  {
    title: "Travel Desk Status",
    key: "travelDeskTravelRequest",
    sortable: false,
  },
  {
    title: "Actions",
    key: "actions",
    sortable: false,
  },
] as const

const { page, perPage } = useRouteQueryPagination({
  perPage: props.defaultPerPage,
  routeQuerySuffix: "TravelDesk",
})

const sortBy = useVuetifySortByToSafeRouteQuery("travelDeskSortBy", [
  {
    key: "id",
    order: "desc",
  },
])

const order = useVuetifySortByToSequelizeSafeOrder(sortBy)
const { currentUser, isAdmin, isReady } = useCurrentUser()

const travelAuthorizationsQuery = computed<TravelAuthorizationQueryOptions>(() => {
  const query: TravelAuthorizationQueryOptions = {
    page: page.value,
    perPage: perPage.value,
    order: order.value,
  }

  if (!isAdmin.value && !isNil(currentUser.value)) {
    query.where = {
      userId: currentUser.value.id,
    }
  }

  return query
})

const { travelAuthorizations, totalCount, isLoading, isErrored, refresh } = useTravelAuthorizations(
  travelAuthorizationsQuery,
  {
    skipWatchIf: () => !isReady.value,
  }
)

const { t } = useI18n()

function formatTravelDate(value: string | null | undefined) {
  if (!value) return "—"

  return formatDate(value)
}

function formatAuthorizationStatus(status: string | null | undefined) {
  if (!status) return "—"

  return t(`global.status.${status}`, status)
}

function requestActionLabel(status: TravelDeskTravelRequestStatuses | undefined) {
  if (status === TravelDeskTravelRequestStatuses.DRAFT) return "Submit Travel Desk Request"
  if (status === TravelDeskTravelRequestStatuses.OPTIONS_PROVIDED) return "Review Travel Options"

  return "View Request"
}

defineExpose({
  refresh,
})
</script>
