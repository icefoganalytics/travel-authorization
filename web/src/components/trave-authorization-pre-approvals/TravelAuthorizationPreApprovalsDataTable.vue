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
    v-bind="$attrs"
    v-on="$listeners"
    @item-selected="applySameDeptSelection"
    @toggle-select-all="applyAllSameDeptSelection"
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
        :type="item.status === TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.DRAFT ? 'Edit' : 'View'"
        :travel-request="item"
        @updateTable="refresh"
      />
    </template>
  </v-data-table>
</template>

<script setup>
import { computed, nextTick, ref } from "vue"

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
const firstSelectionDept = ref("")

const travelAuthorizationPreApprovalsWithRestrictedSelectability = computed(() => {
  return travelAuthorizationPreApprovals.value.map((travelAuthorizationPreApproval) => {
    const isSelectable =
      travelAuthorizationPreApproval.status !==
        TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.APPROVED &&
      travelAuthorizationPreApproval.status !==
        TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.DECLINED &&
      travelAuthorizationPreApproval.department === firstSelectionDept.value

    return {
      ...travelAuthorizationPreApproval,
      isSelectable,
    }
  })
})

async function applySameDeptSelection(selection) {
  await nextTick()

  if (selectedItems.value.length == 1) {
    firstSelectionDept.value = selectedItems.value[0].department
  } else if (selectedItems.value.length === 0) {
    firstSelectionDept.value = ""
  }

  if (selection.value == true && selection.item.department != firstSelectionDept.value) {
    selectedItems.value = selectedItems.value.filter((req) => req.id != selection.item.id)
  }
}

async function applyAllSameDeptSelection(selection) {
  await nextTick()
  if (selection.value == true && firstSelectionDept.value) {
    selectedItems.value = selectedItems.value.filter(
      (req) => req.department == firstSelectionDept.value
    )
  } else {
    selectedItems.value = []
    firstSelectionDept.value = ""
  }
}

defineExpose({
  refresh,
})
</script>
