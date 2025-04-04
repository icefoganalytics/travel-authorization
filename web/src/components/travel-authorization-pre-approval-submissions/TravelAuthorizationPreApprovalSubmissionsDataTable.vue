<template>
  <v-data-table
    :page.sync="page"
    :items-per-page.sync="perPage"
    :sort-by.sync="vuetify2SortBy"
    :sort-desc.sync="vuetify2SortDesc"
    :items="travelAuthorizationPreApprovalSubmissions"
    :headers="headers"
    :server-items-length="totalCount"
    :loading="isLoading"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template #top="slotProps">
      <slot
        name="top"
        v-bind="slotProps"
      ></slot>
    </template>

    <!-- TODO: maybe show approvedAt instead when available? -->
    <template #item.createdAt="{ item }">
      {{ formatDate(item.createdAt) }}
    </template>

    <template #item.location="{ item }">
      {{ item.preApprovals.map((p) => p.location).join(" - ") }}
    </template>

    <!-- TODO: maybe show approverId instead when available? -->
    <template #item.creatorId="{ item }">
      <UserChip :user-id="item.creatorId" />
    </template>

    <template #item.actions="slotProps">
      <slot
        name="item.actions"
        v-bind="slotProps"
      ></slot>
    </template>
  </v-data-table>
</template>

<script setup>
import { computed } from "vue"

import { formatDate } from "@/utils/formatters"

import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"
import useVuetify2SortByShim from "@/use/utils/use-vuetify2-sort-by-shim"
import useTravelAuthorizationPreApprovalSubmissions from "@/use/use-travel-authorization-pre-approval-submissions"

import UserChip from "@/components/users/UserChip.vue"

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

const headers = [
  {
    text: "Submission Date",
    value: "createdAt",
  },
  {
    text: "Department",
    value: "department",
  },
  {
    text: "Location",
    value: "location",
    sortable: false,
  },
  {
    text: "Submitter",
    value: "creatorId",
  },
  {
    text: "Status",
    value: "status",
  },
  {
    text: "Actions",
    value: "actions",
    sortable: false,
  },
]

const page = useRouteQuery(`page${props.routeQuerySuffix}`, "1", {
  transform: integerTransformer,
})
const perPage = useRouteQuery(`perPage${props.routeQuerySuffix}`, "10", {
  transform: integerTransformer,
})
const sortBy = useVuetifySortByToSafeRouteQuery(`sortBy${props.routeQuerySuffix}`, [])
const { vuetify2SortBy, vuetify2SortDesc } = useVuetify2SortByShim(sortBy)
const order = useVuetifySortByToSequelizeSafeOrder(sortBy)

const travelAuthorizationPreApprovalSubmissionsQuery = computed(() => ({
  where: props.where,
  filters: props.filters,
  order: order.value,
  page: page.value,
  perPage: perPage.value,
}))
const { travelAuthorizationPreApprovalSubmissions, isLoading, totalCount, refresh } =
  useTravelAuthorizationPreApprovalSubmissions(travelAuthorizationPreApprovalSubmissionsQuery)

defineExpose({
  refresh,
})
</script>

<style scoped>
::v-deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
