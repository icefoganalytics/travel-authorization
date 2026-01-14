<template>
  <v-data-table
    :page.sync="page"
    :items-per-page.sync="perPage"
    :sort-by.sync="vuetify2SortBy"
    :sort-desc.sync="vuetify2SortDesc"
    :headers="headers"
    :items="travelDeskHotels"
    :loading="isLoading"
    :server-items-length="totalCount"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template #item.checkIn="{ value }">
      {{ formatDate(value) }}
    </template>

    <template #item.checkOut="{ value }">
      {{ formatDate(value) }}
    </template>

    <template #item.isDedicatedConferenceHotelAvailable="{ item }">
      {{ item.isDedicatedConferenceHotelAvailable ? "Yes" : "No" }}
    </template>

    <template #item.actions="{ item }">
      <div class="d-flex">
        <v-btn
          title="Edit"
          icon
          color="blue"
          @click.stop="goToTravelDeskHotelEditPage(item.id)"
          ><v-icon>mdi-pencil</v-icon></v-btn
        >
        <v-btn
          :loading="isDeleting"
          title="Delete"
          icon
          color="red"
          @click.stop="deleteItem(item.id)"
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
import { ref, computed } from "vue"
import { useRouter } from "vue2-helpers/vue-router"

import blockedToTrueConfirm from "@/utils/blocked-to-true-confirm"
import formatDate from "@/utils/format-date"

import travelDeskHotelsApi, {
  type TravelDeskHotelWhereOptions,
  type TravelDeskHotelFiltersOptions,
} from "@/api/travel-desk-hotels-api"

import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import useVuetifySortByToSafeRouteQuery from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"
import useVuetify2SortByShim from "@/use/utils/use-vuetify2-sort-by-shim"

import useSnack from "@/use/use-snack"
import useTravelDeskHotels from "@/use/use-travel-desk-hotels"

const props = withDefaults(
  defineProps<{
    where?: TravelDeskHotelWhereOptions
    filters?: TravelDeskHotelFiltersOptions
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
    text: "Check-in Date",
    value: "checkIn",
  },
  {
    text: "Check-out Date",
    value: "checkOut",
  },
  {
    text: "City",
    value: "city",
    sortable: false,
  },
  {
    text: "Conference Hotel Available?",
    value: "isDedicatedConferenceHotelAvailable",
    sortable: false,
  },
  {
    text: "Event Name",
    value: "conferenceName",
    sortable: false,
  },
  {
    text: "Hotel Name",
    value: "conferenceHotelName",
    sortable: false,
  },
  {
    text: "Additional Information",
    value: "additionalInformation",
    sortable: false,
  },
  {
    text: "Actions",
    value: "actions",
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
    key: "checkIn",
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
const { travelDeskHotels, totalCount, isLoading, refresh } = useTravelDeskHotels(query)

const router = useRouter()

function goToTravelDeskHotelEditPage(travelDeskHotelId: number) {
  return router.push({
    name: "travel-desk/hotels/TravelDeskHotelEditPage",
    params: {
      travelDeskHotelId: travelDeskHotelId.toString(),
    },
    query: {
      returnTo: props.returnTo,
    },
  })
}

const isDeleting = ref(false)
const snack = useSnack()

async function deleteItem(itemId: number) {
  if (!blockedToTrueConfirm("Are you sure you want to remove this hotel?")) return

  isDeleting.value = true
  try {
    await travelDeskHotelsApi.delete(itemId)
    snack.success("Hotel deleted successfully")
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

<style scoped></style>
