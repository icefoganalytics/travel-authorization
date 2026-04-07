<template>
  <v-data-table-server
    v-model:page="page"
    v-model:items-per-page="perPage"
    v-model:sort-by="sortBy"
    :items="travelAuthorizationPreApprovalProfiles"
    :headers="headers"
    :items-length="totalCount"
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

    <!-- TODO: add read page for pre-approval profile -->
    <!-- <v-btn
      color="secondary"
      :to="{
        name: 'travel-pre-approvals/TravelPreApprovalPage',
        params: {
          travelAuthorizationPreApprovalId: item.id,
        },
      }"
    >
      View
    </v-btn> -->
    <template #item.actions="slotProps">
      <slot
        name="item.actions"
        v-bind="slotProps"
      ></slot>
    </template>
  </v-data-table-server>
</template>

<script setup>
import { computed, ref } from "vue"

import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"
import useTravelAuthorizationPreApprovalProfiles from "@/use/use-travel-authorization-pre-approval-profiles"

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
    title: "Name",
    key: "profileName",
  },
  {
    title: "Dept.",
    key: "department",
  },
  {
    title: "Branch",
    key: "branch",
  },
  {
    title: "Actions",
    key: "actions",
    sortable: false,
  },
])

const page = useRouteQuery(`page${props.routeQuerySuffix}`, "1", {
  transform: integerTransformer,
})
const perPage = useRouteQuery(`perPage${props.routeQuerySuffix}`, "10", {
  transform: integerTransformer,
})
const sortBy = useVuetifySortByToSafeRouteQuery(`sortBy${props.routeQuerySuffix}`, [
  {
    key: "profileName",
    order: "desc",
  },
])
const order = useVuetifySortByToSequelizeSafeOrder(sortBy)

const travelAuthorizationPreApprovalProfilesQuery = computed(() => ({
  where: props.where,
  filters: props.filters,
  order: order.value,
  page: page.value,
  perPage: perPage.value,
}))
const { travelAuthorizationPreApprovalProfiles, isLoading, totalCount, refresh } =
  useTravelAuthorizationPreApprovalProfiles(travelAuthorizationPreApprovalProfilesQuery)

defineExpose({
  refresh,
})
</script>

<style scoped>
/* Consider moving to global style. */
::v-deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
