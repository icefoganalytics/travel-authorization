<template>
  <!-- TODO: split component into table and selectable table so each layer is less complex -->
  <v-data-table-server
    v-model="selectedItems"
    v-model:page="page"
    v-model:items-per-page="perPage"
    v-model:sort-by="sortBy"
    :items="travelAuthorizationPreApprovals"
    :headers="headers"
    :items-length="totalCount"
    :loading="isLoading"
    :show-select="showSelect"
    :item-selectable="isItemSelectable"
    select-strategy="page"
    return-object
    v-bind="$attrs"
  >
    <template #top="slotProps">
      <slot
        name="top"
        :selected-items="selectedItems"
        v-bind="slotProps"
      ></slot>
    </template>

    <template #item.name="{ item }">
      <VTravelAuthorizationPreApprovalProfilesChip :travel-authorization-pre-approval="item" />
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
      <v-btn
        v-if="canEdit(item)"
        variant="outlined"
        :to="{
          name: 'travel-pre-approvals/TravelPreApprovalEditPage',
          params: {
            travelAuthorizationPreApprovalId: item.id,
          },
        }"
      >
        Edit
      </v-btn>
      <v-btn
        v-else
        variant="outlined"
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
  </v-data-table-server>
</template>

<script setup>
import { computed, ref } from "vue"
import { isNil } from "lodash"

import { formatDate } from "@/utils/formatters"

import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"

import useCurrentUser from "@/use/use-current-user"
import useTravelAuthorizationPreApprovals, {
  TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES,
} from "@/use/use-travel-authorization-pre-approvals"

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
  showSelect: {
    type: Boolean,
    default: true,
  },
})

const headers = [
  {
    title: "Name",
    key: "name",
    sortable: false,
    cellClass: "max-w-64",
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
    title: "Travel Date",
    key: "travelDate",
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
  {
    title: "Reason",
    key: "reason",
    sortable: false,
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
const perPage = useRouteQuery(`perPage${props.routeQuerySuffix}`, "5", {
  transform: integerTransformer,
})
const sortBy = useVuetifySortByToSafeRouteQuery(`sortBy${props.routeQuerySuffix}`, [])
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

const { currentUser, isAdmin, isPreApprovedTravelAdmin } = useCurrentUser()

function canEdit(travelAuthorizationPreApproval) {
  if (travelAuthorizationPreApproval.status !== TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.DRAFT) {
    return false
  }

  if (isAdmin.value) return true
  if (
    isPreApprovedTravelAdmin.value &&
    travelAuthorizationPreApproval.department === currentUser.value.department
  ) {
    return true
  }

  return travelAuthorizationPreApproval.creatorId === currentUser.value.id
}

const selectedItems = ref([])

const selectedDepartment = computed(() => {
  const firstSelectedItem = selectedItems.value[0]
  if (isNil(firstSelectedItem)) return null

  return firstSelectedItem.department
})

function isItemSelectable(travelAuthorizationPreApproval) {
  const isDraft =
    travelAuthorizationPreApproval.status === TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.DRAFT
  if (!isDraft) return false

  const hasNoSelection = isNil(selectedDepartment.value)
  if (hasNoSelection) return true

  const isSameDepartment = travelAuthorizationPreApproval.department === selectedDepartment.value
  return isSameDepartment
}

defineExpose({
  refresh,
})
</script>

<style scoped>
/* https://tailwindcss.com/docs/max-width#basic-example */
:deep(.max-w-64) {
  --spacing: 0.25rem;
  max-width: calc(var(--spacing) * 64);
}
</style>
