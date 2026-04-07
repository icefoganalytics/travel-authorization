<template>
  <v-data-table-server
    v-model:page="page"
    v-model:items-per-page="perPage"
    v-model:sort-by="sortBy"
    :items="travelAuthorizationPreApprovals"
    :headers="headers"
    :items-length="totalCount"
    :loading="isLoading"
    :hide-default-footer="hideDefaultFooter"
    v-bind="$attrs"
  >
    <template #top="slotProps">
      <slot
        name="top"
        v-bind="slotProps"
      ></slot>
    </template>

    <template #item.name="{ item }">
      <VTravelAuthorizationPreApprovalProfilesChip :travel-authorization-pre-approval="item" />
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

import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"
import useTravelAuthorizationPreApprovals from "@/use/use-travel-authorization-pre-approvals"

import VTravelAuthorizationPreApprovalProfilesChip from "@/components/travel-authorization-pre-approvals/VTravelAuthorizationPreApprovalProfilesChip.vue"

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
  hideDefaultFooter: {
    type: Boolean,
    default: true,
  },
  showActionsHeader: {
    type: Boolean,
    default: false,
  },
})

const headers = computed(() => {
  const baseHeaders = [
    {
      title: "Name",
      key: "name",
      sortable: false,
    },
    {
      title: "Department",
      key: "department",
    },
    {
      title: "Branch",
      key: "branch",
    },
    {
      title: "Reason",
      key: "reason",
      sortable: false,
    },
    {
      title: "Location",
      key: "location",
    },
    {
      title: "Purpose Type",
      key: "purpose",
    },
  ]

  if (props.showActionsHeader) {
    baseHeaders.push({
      title: "Actions",
      key: "actions",
      sortable: false,
    })
  }
  return baseHeaders
})

const page = useRouteQuery(`page${props.routeQuerySuffix}`, "1", {
  transform: integerTransformer,
})
const perPage = useRouteQuery(`perPage${props.routeQuerySuffix}`, "5", {
  transform: integerTransformer,
})
const sortBy = useVuetifySortByToSafeRouteQuery(`sortBy${props.routeQuerySuffix}`, [
  {
    key: "branch",
    order: "asc",
  },
])
const order = useVuetifySortByToSequelizeSafeOrder(sortBy)

const travelAuthorizationPreApprovalsQuery = computed(() => ({
  where: props.where,
  filters: props.filters,
  order: order.value,
  page: page.value,
  perPage: perPage.value,
}))
const { travelAuthorizationPreApprovals, isLoading, totalCount, refresh } =
  useTravelAuthorizationPreApprovals(travelAuthorizationPreApprovalsQuery)

defineExpose({
  refresh,
})
</script>
