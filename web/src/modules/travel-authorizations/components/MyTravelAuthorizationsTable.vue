<template>
  <v-data-table
    :page.sync="page"
    :items-per-page.sync="perPage"
    :sort-by.sync="vuetify2SortBy"
    :sort-desc.sync="vuetify2SortDesc"
    :headers="headers"
    :items="travelAuthorizations"
    :loading="isLoading"
    :server-items-length="totalCount"
    @click:row="goToMyTravelRequestWizardStep"
  >
    <template #top>
      <DeleteTravelAuthorizationDialog
        ref="deleteDialog"
        @deleted="refresh"
      />
    </template>
    <template #item.phase="{ value }">
      <span>{{ formatPhase(value) }}</span>
    </template>
    <template #item.finalDestination="{ value }">
      <span>{{ formatLocation(value) }}</span>
    </template>
    <template #item.departingAt="{ value }">
      <span>{{ formatDateWrapper(value) }}</span>
    </template>
    <template #item.returningAt="{ value }">
      <span>{{ formatDateWrapper(value) }}</span>
    </template>
    <template #item.status="{ value, item }">
      <span>{{ formatStatus(value, item) }}</span>
    </template>
    <template #item.action="{ value: actions, item }">
      <template v-if="isEmpty(actions)">
        <!-- no action: this is a valid state -->
      </template>
      <v-btn
        v-else-if="actions.includes('delete')"
        class="ml-2"
        color="error"
        @click.stop="showDeleteDialog(item)"
        >Delete</v-btn
      >
      <!-- Add call-to-action for this page: web/src/pages/my-travel-requests/AwaitingRequestBookingPage.vue -->
      <SubmitTravelDeskRequestButton
        v-else-if="actions.includes('submit_travel_desk_request')"
        :travel-authorization-id="item.id"
      />
      <TravelDeskOptionsProvidedButton
        v-else-if="actions.includes('travel_desk_rank_options')"
        :travel-authorization-id="item.id"
      />
      <SubmitExpenseClaimButton
        v-else-if="actions.includes('submit_expense_claim')"
        :travel-authorization-id="item.id"
      />
      <ViewItineraryButton
        v-else-if="actions.includes('view_itinerary')"
        :travel-authorization-id="item.id"
      />
      <AddExpenseButton
        v-else-if="actions.includes('add_expense')"
        :travel-authorization-id="item.id"
      />
      <SubmitPoolVehicleRequestButton
        v-else-if="actions.includes('submit_pool_vehicle_request')"
        :travel-authorization-id="item.id"
      />
      <span v-else> ERROR: unknown actions: {{ actions }}</span>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useRoute, useRouter } from "vue2-helpers/vue-router"
import { isNil, isEmpty, isString } from "lodash"

import { useI18n } from "@/plugins/vue-i18n-plugin"
import formatDate from "@/utils/format-date"
import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"

import { type LocationAsReference } from "@/api/locations-api"
import useCurrentUser from "@/use/use-current-user"
import useTravelAuthorizations, {
  type TravelAuthorizationAsIndex,
  TravelAuthorizationStatuses,
} from "@/use/use-travel-authorizations"

import AddExpenseButton from "@/modules/travel-authorizations/components/my-travel-authorizations-table/AddExpenseButton.vue"
import DeleteTravelAuthorizationDialog from "@/modules/travel-authorizations/components/my-travel-authorizations-table/DeleteTravelAuthorizationDialog.vue"
import TravelDeskOptionsProvidedButton from "@/modules/travel-authorizations/components/my-travel-authorizations-table/TravelDeskOptionsProvidedButton.vue"
import SubmitExpenseClaimButton from "@/modules/travel-authorizations/components/my-travel-authorizations-table/SubmitExpenseClaimButton.vue"
import SubmitPoolVehicleRequestButton from "@/modules/travel-authorizations/components/my-travel-authorizations-table/SubmitPoolVehicleRequestButton.vue"
import SubmitTravelDeskRequestButton from "@/modules/travel-authorizations/components/my-travel-authorizations-table/SubmitTravelDeskRequestButton.vue"
import ViewItineraryButton from "@/modules/travel-authorizations/components/my-travel-authorizations-table/ViewItineraryButton.vue"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useVuetify2SortByShim from "@/use/utils/use-vuetify2-sort-by-shim"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"

const props = withDefaults(
  defineProps<{
    routeQuerySuffix?: string
  }>(),
  {
    routeQuerySuffix: "",
  }
)

const headers = ref([
  {
    text: "Phase",
    value: "phase",
    sortable: false,
  },
  {
    text: "Location",
    value: "finalDestination",
    sortable: false,
  },
  {
    text: "Description",
    value: "eventName",
    sortable: false,
  },
  {
    text: "Start Date",
    value: "departingAt",
    sortable: false,
  },
  {
    text: "End Date",
    value: "returningAt",
    sortable: false,
  },
  {
    text: "Travel Auth Status",
    value: "status",
  },
  {
    text: "Travel Action",
    value: "action",
    sortable: false,
  },
])

const page = useRouteQuery<string, number>("page", "1", {
  transform: integerTransformer,
})
const perPage = useRouteQuery<string, number>("perPage", "10", {
  transform: integerTransformer,
})
const sortBy = useVuetifySortByToSafeRouteQuery(`sortBy${props.routeQuerySuffix}`, [])
const { vuetify2SortBy, vuetify2SortDesc } = useVuetify2SortByShim(sortBy)
const order = useVuetifySortByToSequelizeSafeOrder(sortBy)

const { currentUser } = useCurrentUser<true>()
const currentUserId = computed(() => currentUser.value.id)

const travelAuthorizationsQuery = computed(() => ({
  where: { userId: currentUserId.value },
  order: order.value,
  page: page.value,
  perPage: perPage.value,
}))
const { travelAuthorizations, totalCount, isLoading, refresh } =
  useTravelAuthorizations(travelAuthorizationsQuery)

const router = useRouter()

async function goToMyTravelRequestWizardStep(travelAuthorization: TravelAuthorizationAsIndex) {
  const { wizardStepName } = travelAuthorization
  if (isNil(wizardStepName)) return

  return router.push({
    name: "my-travel-requests/MyTravelRequestWizardPage",
    params: {
      travelAuthorizationId: travelAuthorization.id.toString(),
      stepName: wizardStepName,
    },
  })
}

function formatDateWrapper(value: string | number | null | undefined) {
  if (isNil(value)) return "Unknown"

  return formatDate(value, "dd-LLL-yyyy")
}

function formatLocation(value: LocationAsReference | null | undefined) {
  if (isNil(value) || isNil(value.city)) return "Unknown"

  return value.city
}

const { t } = useI18n()

function formatStatus(
  value: TravelAuthorizationStatuses,
  travelAuthorization: TravelAuthorizationAsIndex
) {
  if (travelAuthorization.isTravelling) {
    return t(`global.status.travelling`, { $default: "Unknown" })
  }

  return t(`global.status.${value}`, { $default: "Unknown" })
}

function formatPhase(value: string) {
  return t(`global.phase.${value}`, { $default: "Unknown" })
}

// TODO: replace this with newer show dialog patterns
onMounted(() => {
  showDeleteDialogForRouteQuery()
})

const route = useRoute()
const deleteDialog = ref<InstanceType<typeof DeleteTravelAuthorizationDialog> | null>(null)

function showDeleteDialog(item: TravelAuthorizationAsIndex) {
  deleteDialog.value?.show(item)
}

function showDeleteDialogForRouteQuery() {
  if (!isString(route.query.showDelete)) return

  const itemId = parseInt(route.query.showDelete)
  if (isNaN(itemId)) return

  const item = travelAuthorizations.value.find((item) => item.id === itemId)
  if (!item) return

  showDeleteDialog(item)
}

defineExpose({
  refresh,
})
</script>

<style scoped></style>
