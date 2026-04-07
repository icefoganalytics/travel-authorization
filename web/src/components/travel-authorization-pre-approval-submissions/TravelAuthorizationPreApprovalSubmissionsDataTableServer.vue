<template>
  <v-data-table-server
    v-model:page="page"
    v-model:items-per-page="perPage"
    v-model:sort-by="sortBy"
    :items="travelAuthorizationPreApprovalSubmissions"
    :headers="headers"
    :items-length="totalCount"
    :loading="isLoading"
    v-bind="$attrs"
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
  </v-data-table-server>
</template>

<script setup>
import { computed } from "vue"

import { formatDate } from "@/utils/formatters"

import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"
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
    title: "Submission Date",
    key: "createdAt",
  },
  {
    title: "Department",
    key: "department",
  },
  {
    title: "Location",
    key: "location",
    sortable: false,
  },
  {
    title: "Submitter",
    key: "creatorId",
  },
  {
    title: "Status",
    key: "status",
  },
  {
    title: "Actions",
    key: "actions",
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
:deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
