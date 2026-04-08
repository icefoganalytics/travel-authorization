<template>
  <v-data-table-server
    v-model:page="page"
    v-model:items-per-page="perPage"
    :headers="headers"
    :items="travelDeskFlightRequests"
    :loading="isLoading"
    :items-length="totalCount"
    disable-sort
    v-bind="$attrs"
  >
    <template #top>
      <TravelDeskFlightRequestEditDialog
        ref="travelDeskFlightRequestEditDialog"
        :min-date="minDate"
        :max-date="maxDate"
        @saved="emitUpdatedAndRefresh"
      />
    </template>
    <template #item.datePreference="{ value }">
      {{ formatDate(value) }}
    </template>

    <template #item.actions="{ item }">
      <v-btn
        title="Edit"
        icon
        color="primary"
        @click.stop="showEditDialog(item.id)"
        ><v-icon>mdi-pencil</v-icon></v-btn
      >
      <v-btn
        :loading="isLoading"
        title="Delete"
        icon
        color="red"
        @click.stop="deleteFlightRequest(item.id)"
        ><v-icon>mdi-close</v-icon></v-btn
      >
    </template>
    <template
      v-for="(_, slotName) in $slots"
      #[slotName]="slotData"
    >
      <slot
        :name="slotName"
        v-bind="slotData"
      ></slot>
    </template>
  </v-data-table-server>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef } from "vue"

import blockedToTrueConfirm from "@/utils/blocked-to-true-confirm"
import formatDate from "@/utils/format-date"

import travelDeskFlightRequestsApi from "@/api/travel-desk-flight-requests-api"

import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import useSnack from "@/use/use-snack"
import useTravelDeskFlightRequests from "@/use/use-travel-desk-flight-requests"

import TravelDeskFlightRequestEditDialog from "@/components/travel-desk-flight-requests/TravelDeskFlightRequestEditDialog.vue"

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
  minDate: {
    type: String,
    default: "",
  },
  maxDate: {
    type: String,
    default: "",
  },
})

const emit = defineEmits(["updated"])

const headers = [
  {
    title: "Depart Location",
    key: "departLocation",
  },
  {
    title: "Arrive Location",
    key: "arriveLocation",
  },
  {
    title: "Date",
    key: "datePreference",
  },
  {
    title: "Time Preference",
    key: "timePreference",
  },
  {
    title: "Seat Preference",
    key: "seatPreference",
  },
  {
    title: "Actions",
    key: "actions",
    align: "end" as const,
  },
]

const page = useRouteQuery<string, number>(`page${props.routeQuerySuffix}`, "1", {
  transform: integerTransformer,
})
const perPage = useRouteQuery<string, number>(`perPage${props.routeQuerySuffix}`, "5", {
  transform: integerTransformer,
})

const travelDeskFlightRequestsQuery = computed(() => ({
  where: props.where,
  filters: props.filters,
  page: page.value,
  perPage: perPage.value,
}))
const { travelDeskFlightRequests, totalCount, isLoading, refresh } = useTravelDeskFlightRequests(
  travelDeskFlightRequestsQuery
)
const travelDeskFlightRequestEditDialog = useTemplateRef("travelDeskFlightRequestEditDialog")

function showEditDialog(flightRequestId: number) {
  travelDeskFlightRequestEditDialog.value?.show(flightRequestId)
}

const isDeleting = ref(false)
const snack = useSnack()

async function deleteFlightRequest(flightRequestId: number) {
  if (!blockedToTrueConfirm("Are you sure you want to remove this flight request?")) return

  isDeleting.value = true
  try {
    await travelDeskFlightRequestsApi.delete(flightRequestId)
    snack.success("Flight request deleted successfully")
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
