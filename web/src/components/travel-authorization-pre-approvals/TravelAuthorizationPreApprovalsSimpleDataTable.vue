<template>
  <v-data-table
    :page.sync="page"
    :items-per-page.sync="perPage"
    :sort-by.sync="vuetify2SortBy"
    :sort-desc.sync="vuetify2SortDesc"
    :items="travelAuthorizationPreApprovals"
    :headers="headers"
    :server-items-length="totalCount"
    :loading="isLoading"
    :hide-default-footer="hideDefaultFooter"
    v-bind="$attrs"
    v-on="$listeners"
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
  </v-data-table>
</template>

<script setup>
import { computed } from "vue"

import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"
import useVuetify2SortByShim from "@/use/utils/use-vuetify2-sort-by-shim"
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
      text: "Name",
      value: "name",
      sortable: false,
    },
    {
      text: "Branch",
      value: "branch",
    },
    {
      text: "Reason",
      value: "reason",
      sortable: false,
    },
    {
      text: "Location",
      value: "location",
    },
  ]

  if (props.showActionsHeader) {
    baseHeaders.push({
      text: "Actions",
      value: "actions",
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
const { vuetify2SortBy, vuetify2SortDesc } = useVuetify2SortByShim(sortBy)
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
