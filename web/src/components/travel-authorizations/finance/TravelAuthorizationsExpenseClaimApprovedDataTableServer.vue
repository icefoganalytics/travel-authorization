<template>
  <v-data-table-server
    v-model:page="page"
    v-model:items-per-page="perPage"
    v-model:sort-by="sortBy"
    v-bind="$attrs"
    :headers="headers"
    :items="travelAuthorizations"
    :loading="isLoading"
    :items-length="totalCount"
    v-on="$listeners"
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
    <template #item.actions="{ item }">
      <v-tooltip
        v-if="item.unprocessedExpenseCount > 0"
        bottom
      >
        <template #activator="{ on, attrs }">
          <v-chip
            outlined
            v-bind="attrs"
            v-on="on"
          >
            <v-icon
              left
              small
            >
              mdi-progress-clock
            </v-icon>
            Pending: {{ item.unprocessedExpenseCount }}
          </v-chip>
        </template>
        <span>{{ item.unprocessedExpenseCount }} expenses remaining to be processed.</span>
      </v-tooltip>
      <!-- TODO: should this perform a different status effect if some expenses where rejected? -->
      <v-btn
        v-else
        class="ma-0 mr-2"
        color="primary"
        :loading="isProcessingTravelAuthorization(item.id)"
        @click.stop="approveTravelAuthorization(item.id)"
      >
        <v-icon left> mdi-check </v-icon>
        Complete
      </v-btn>
    </template>
  </v-data-table-server>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from "vue"

import blockedToTrueConfirm from "@/utils/blocked-to-true-confirm"
import formatDate from "@/utils/format-date"
import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"

import { type LocationAsReference } from "@/api/locations-api"
import travelAuthorizationsApi from "@/api/travel-authorizations-api"

import useTravelAuthorizations, {
  TravelAuthorizationStatuses,
  type TravelAuthorizationFiltersOptions,
  type TravelAuthorizationWhereOptions,
} from "@/use/use-travel-authorizations"
import useSnack from "@/use/use-snack"

const props = withDefaults(
  defineProps<{
    where?: TravelAuthorizationWhereOptions
    filters?: TravelAuthorizationFiltersOptions
    routeQuerySuffix?: string
  }>(),
  {
    where: () => ({}),
    filters: () => ({}),
    routeQuerySuffix: "",
  }
)

const emit = defineEmits<{
  (event: "expensed", travelAuthorizationId: number): void
}>()

const headers = ref([
  {
    title: "TA #",
    key: "id",
  },
  {
    title: "Requestee",
    key: "name",
    sortable: false,
  },
  {
    title: "Department",
    key: "department",
  },
  {
    title: "Final Destination",
    key: "finalDestination",
    sortable: false,
  },
  {
    title: "Type",
    key: "purposeText",
  },
  {
    title: "Departure Date",
    key: "departingAt",
  },
  {
    title: "Return Date",
    key: "returningAt",
  },
  {
    title: "Actions",
    key: "actions",
    sortable: false,
    align: "center",
  },
])

const page = useRouteQuery<string, number>(`page${props.routeQuerySuffix}`, "1", {
  transform: integerTransformer,
})
const perPage = useRouteQuery<string, number>(`perPage${props.routeQuerySuffix}`, "10", {
  transform: integerTransformer,
})

const sortBy = useVuetifySortByToSafeRouteQuery(`sortBy${props.routeQuerySuffix}`, [
  {
    key: "id",
    order: "asc",
  },
])
const order = useVuetifySortByToSequelizeSafeOrder(sortBy)

const travelAuthorizationsQuery = computed(() => {
  return {
    where: {
      ...props.where,
      status: TravelAuthorizationStatuses.EXPENSE_CLAIM_APPROVED,
    },
    filters: props.filters,
    order: order.value,
    page: page.value,
    perPage: perPage.value,
  }
})
const { travelAuthorizations, totalCount, isLoading, refresh } =
  useTravelAuthorizations(travelAuthorizationsQuery)

const isProcessingTravelAuthorizationMap = ref(new Map<number, boolean>())
const snack = useSnack()

async function approveTravelAuthorization(travelAuthorizationId: number): Promise<void> {
  if (
    !blockedToTrueConfirm("Are you sure you want to mark this travel authorization as expensed?")
  ) {
    return
  }

  isProcessingTravelAuthorizationMap.value.set(travelAuthorizationId, true)
  try {
    await travelAuthorizationsApi.expense(travelAuthorizationId)
    snack.success("Travel authorization expensed!")
    refresh()

    await nextTick()
    emit("expensed", travelAuthorizationId)
  } finally {
    isProcessingTravelAuthorizationMap.value.set(travelAuthorizationId, false)
  }
}

function isProcessingTravelAuthorization(travelAuthorizationId: number): boolean {
  return isProcessingTravelAuthorizationMap.value.get(travelAuthorizationId) ?? false
}

function formatFinalDestination(value: LocationAsReference) {
  const { city, province } = value
  return `${city} (${province})`
}

defineExpose({
  refresh,
})
</script>
