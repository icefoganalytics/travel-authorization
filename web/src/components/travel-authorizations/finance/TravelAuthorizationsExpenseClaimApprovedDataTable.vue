<template>
  <v-data-table
    v-bind="$attrs"
    :headers="headers"
    :items="travelAuthorizations"
    :loading="isLoading"
    :items-per-page.sync="perPage"
    :page.sync="page"
    :server-items-length="totalCount"
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
  </v-data-table>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"

import blockedToTrueConfirm from "@/utils/blocked-to-true-confirm"
import formatDate from "@/utils/format-date"
import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"

import { type LocationAsReference } from "@/api/locations-api"

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
  (event: "approved", travelAuthorizationId: number): void
}>()

const headers = ref([
  {
    text: "TA #",
    value: "id",
    sortable: false,
  },
  {
    text: "Requestee",
    value: "name",
    sortable: false,
  },
  {
    text: "Department",
    value: "department",
    sortable: false,
  },
  {
    text: "Final Destination",
    value: "finalDestination",
    sortable: false,
  },
  {
    text: "Type",
    value: "purposeText",
    sortable: false,
  },
  {
    text: "Departure Date",
    value: "departingAt",
    sortable: false,
  },
  {
    text: "Return Date",
    value: "returningAt",
    sortable: false,
  },
  {
    text: "Actions",
    value: "actions",
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

const travelAuthorizationsQuery = computed(() => {
  return {
    where: {
      ...props.where,
      status: TravelAuthorizationStatuses.EXPENSE_CLAIM_APPROVED,
    },
    filters: props.filters,
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
    !blockedToTrueConfirm("Are you sure you want to mark this travel authorization as complete?")
  ) {
    return
  }

  isProcessingTravelAuthorizationMap.value.set(travelAuthorizationId, true)
  try {
    // TODO: implement travel authorization expense processing completion state endpoint
    // await api.travelAuthorizations.approveApi.create(travelAuthorizationId)
    snack.success("Travel authorization approved!")
    emit("approved", travelAuthorizationId)
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
