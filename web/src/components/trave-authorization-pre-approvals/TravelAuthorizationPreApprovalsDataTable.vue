<template>
  <v-data-table
    v-model="selectedItems"
    :page.sync="page"
    :items-per-page.sync="perPage"
    :sort-by.sync="vuetify2SortBy"
    :sort-desc.sync="vuetify2SortDesc"
    :items="travelAuthorizationPreApprovalsWithRestrictedSelectability"
    :headers="headers"
    :server-items-length="totalCount"
    :loading="isLoading"
    show-select
    :single-select="noRowsAreSelectable"
    v-bind="$attrs"
    v-on="$listeners"
    @item-selected="lockSelectabilityToSameDepartment"
    @toggle-select-all="selectAllOfSameDepartment"
  >
    <template #top="slotProps">
      <slot
        name="top"
        :selected-items="selectedItems"
        v-bind="slotProps"
      ></slot>
    </template>

    <template #item.name="{ item }">
      <template v-if="item.profiles.length === 0"> Unspecified </template>
      <template v-else-if="item.profiles.length === 1">
        {{ item.profiles[0].profileName.replace(".", " ") }}
      </template>
      <v-tooltip
        v-else
        top
        color="primary"
      >
        <template #activator="{ on }">
          <div v-on="on">
            <span>
              {{ item.profiles[0].profileName.replace(".", " ") }}
            </span>
            <span>, ... </span>
          </div>
        </template>
        <span
          ><div
            v-for="(profile, index) in item.profiles"
            :key="index"
          >
            {{ profile.profileName.replace(".", " ") }}
          </div></span
        >
      </v-tooltip>
    </template>

    <template #item.travelDate="{ item }">
      <div v-if="item.isOpenForAnyDate">
        {{ item.month }}
      </div>
      <div v-else>
        <div>
          {{ formatDate(item.startDate) }}
          to
        </div>
        <div>
          {{ formatDate(item.endDate) }}
        </div>
      </div>
    </template>

    <template #item.actions="{ item }">
      <NewTravelRequest
        v-if="item.status === TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.DRAFT"
        :type="'Edit'"
        :travel-request="item"
        @updateTable="refresh"
      />
      <v-btn
        v-else
        color="secondary"
        :to="{
          name: 'travel-pre-approvals/TravelPreApprovalPage',
          params: {
            travelAuthorizationPreApprovalId: item.id,
          },
        }"
      >
        View
      </v-btn>
    </template>
  </v-data-table>
</template>

<script setup>
import { computed, ref } from "vue"
import { isEmpty, isNil } from "lodash"

import { formatDate } from "@/utils/formatters"

import { TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES } from "@/api/travel-authorization-pre-approvals-api"

import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"
import useVuetify2SortByShim from "@/use/utils/use-vuetify2-sort-by-shim"
import useTravelAuthorizationPreApprovals from "@/use/use-travel-authorization-pre-approvals"

import NewTravelRequest from "@/modules/preapproved/views/Requests/NewTravelRequest.vue"

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
    text: "Name",
    value: "name",
    sortable: false,
  },
  {
    text: "Department",
    value: "department",
  },
  {
    text: "Branch",
    value: "branch",
  },
  {
    text: "Travel Date",
    value: "travelDate",
    sortable: false,
  },
  {
    text: "Location",
    value: "location",
  },
  {
    text: "Purpose Type",
    value: "purpose",
  },
  {
    text: "Reason",
    value: "reason",
    sortable: false,
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
const sortBy = useVuetifySortByToSafeRouteQuery(`sortBy${props.routeQuerySuffix}`, [
  {
    key: "status",
    order: "desc",
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

const selectedItems = ref([])
const departmentSelectionLimiter = ref(null)

const travelAuthorizationPreApprovalsWithRestrictedSelectability = computed(() => {
  return travelAuthorizationPreApprovals.value.map((travelAuthorizationPreApproval) => {
    const isSelectable =
      travelAuthorizationPreApproval.status !==
        TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.APPROVED &&
      travelAuthorizationPreApproval.status !==
        TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.DECLINED &&
      (travelAuthorizationPreApproval.department === departmentSelectionLimiter.value ||
        isNil(departmentSelectionLimiter.value))

    return {
      ...travelAuthorizationPreApproval,
      isSelectable,
    }
  })
})

const noRowsAreSelectable = computed(
  () =>
    !travelAuthorizationPreApprovalsWithRestrictedSelectability.value.some(
      (travelAuthorizationPreApproval) => travelAuthorizationPreApproval.isSelectable
    )
)

async function lockSelectabilityToSameDepartment({
  item: travelAuthorizationPreApproval,
  value: isSelected,
}) {
  if (isSelected) {
    departmentSelectionLimiter.value = travelAuthorizationPreApproval.department
  } else {
    departmentSelectionLimiter.value = null
  }
}

async function selectAllOfSameDepartment({ items, value: isSelected }) {
  if (isSelected && departmentSelectionLimiter.value) {
    selectedItems.value = items.filter(
      (travelAuthorizationPreApproval) =>
        travelAuthorizationPreApproval.isSelectable &&
        travelAuthorizationPreApproval.department === departmentSelectionLimiter.value
    )
  } else if (isSelected && !isEmpty(items)) {
    const firstTravelAuthorizationPreApproval = items[0]
    departmentSelectionLimiter.value = firstTravelAuthorizationPreApproval.department
    selectedItems.value = items.filter(
      (travelAuthorizationPreApproval) =>
        travelAuthorizationPreApproval.isSelectable &&
        travelAuthorizationPreApproval.department === departmentSelectionLimiter.value
    )
  } else {
    selectedItems.value = []
    departmentSelectionLimiter.value = null
  }
}

defineExpose({
  refresh,
})
</script>
