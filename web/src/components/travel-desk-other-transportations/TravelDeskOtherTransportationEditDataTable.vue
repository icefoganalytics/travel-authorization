<template>
  <v-data-table
    :page.sync="page"
    :items-per-page.sync="perPage"
    :sort-by.sync="vuetify2SortBy"
    :sort-desc.sync="vuetify2SortDesc"
    :headers="headers"
    :items="travelDeskOtherTransportations"
    :loading="isLoading"
    :server-items-length="totalCount"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template #item.date="{ value }">
      {{ formatDate(value) }}
    </template>

    <template #item.actions="{ item }">
      <div class="d-flex">
        <v-btn
          title="Edit"
          icon
          color="primary"
          @click.stop="goToTravelDeskOtherTransportationEditPage(item.id)"
          ><v-icon>mdi-pencil</v-icon></v-btn
        >
        <v-btn
          :loading="isDeleting"
          title="Delete"
          icon
          color="red"
          @click.stop="deleteTravelDeskOtherTransportation(item.id)"
          ><v-icon>mdi-close</v-icon></v-btn
        >
      </div>
    </template>

    <template
      v-for="(_, slotName) in $scopedSlots"
      #[slotName]="slotData"
    >
      <slot
        :name="slotName"
        v-bind="slotData"
      ></slot>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { useRouter } from "vue2-helpers/vue-router"

import blockedToTrueConfirm from "@/utils/blocked-to-true-confirm"
import formatDate from "@/utils/format-date"

import travelDeskOtherTransportationsApi, {
  type TravelDeskOtherTransportationWhereOptions,
  type TravelDeskOtherTransportationFiltersOptions,
} from "@/api/travel-desk-other-transportations-api"

import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"
import useVuetify2SortByShim from "@/use/utils/use-vuetify2-sort-by-shim"

import useSnack from "@/use/use-snack"
import useTravelDeskOtherTransportations from "@/use/use-travel-desk-other-transportations"

const props = withDefaults(
  defineProps<{
    where?: TravelDeskOtherTransportationWhereOptions
    filters?: TravelDeskOtherTransportationFiltersOptions
    routeQuerySuffix?: string
    returnTo?: string
  }>(),
  {
    where: () => ({}),
    filters: () => ({}),
    routeQuerySuffix: "",
    returnTo: undefined,
  }
)

const emit = defineEmits<{
  (event: "updated"): void
}>()

const headers = [
  {
    text: "Type",
    value: "transportationType",
  },
  {
    text: "Depart Location",
    value: "depart",
    sortable: false,
  },
  {
    text: "Arrive Location",
    value: "arrive",
    sortable: false,
  },
  {
    text: "Date",
    value: "date",
  },
  {
    text: "Additional Information",
    value: "additionalNotes",
    sortable: false,
  },
  {
    text: "Actions",
    value: "actions",
    align: "end",
    sortable: false,
  },
]

const page = useRouteQuery<string, number>(`page${props.routeQuerySuffix}`, "1", {
  transform: integerTransformer,
})
const perPage = useRouteQuery<string, number>(`perPage${props.routeQuerySuffix}`, "5", {
  transform: integerTransformer,
})
const sortBy = useVuetifySortByToSafeRouteQuery(`sortBy${props.routeQuerySuffix}`, [
  {
    key: "date",
    order: "asc",
  },
])
const { vuetify2SortBy, vuetify2SortDesc } = useVuetify2SortByShim(sortBy)
const order = useVuetifySortByToSequelizeSafeOrder(sortBy)

const query = computed(() => ({
  where: props.where,
  filters: props.filters,
  order: order.value,
  page: page.value,
  perPage: perPage.value,
}))
const { travelDeskOtherTransportations, totalCount, isLoading, refresh } =
  useTravelDeskOtherTransportations(query)

const router = useRouter()

function goToTravelDeskOtherTransportationEditPage(travelDeskOtherTransportationId: number) {
  return router.push({
    name: "travel-desk/other-transportations/TravelDeskOtherTransportationEditPage",
    params: {
      travelDeskOtherTransportationId: travelDeskOtherTransportationId.toString(),
    },
    query: {
      returnTo: props.returnTo,
    },
  })
}

const isDeleting = ref(false)
const snack = useSnack()

async function deleteTravelDeskOtherTransportation(travelDeskOtherTransportationId: number) {
  if (!blockedToTrueConfirm("Are you sure you want to remove this transportation?")) return

  isDeleting.value = true
  try {
    await travelDeskOtherTransportationsApi.delete(travelDeskOtherTransportationId)
    snack.success("Transportation deleted successfully")
    await emitUpdatedAndRefresh()
  } catch (error) {
    console.error(error)
  } finally {
    isDeleting.value = false
  }
}

async function emitUpdatedAndRefresh() {
  emit("updated")
  await refresh()
}

defineExpose({
  refresh,
})
</script>
