<template>
  <v-card>
    <v-card-title>
      <h4>Rental Car Request</h4>
    </v-card-title>
    <v-card-text class="px-0 px-md-4">
      <v-data-table
        :headers="headers"
        :items="travelDeskRentalCars"
        :loading="isLoading"
        hide-default-footer
      >
        <template #item.matchFlightTimes="{ item }">
          {{ item.matchFlightTimes ? "Yes" : "No" }}
        </template>
        <template #item.pickUpLocation="{ item }">
          <div v-if="item.pickUpLocation === LOCATION_TYPES.OTHER">
            {{ item.pickUpLocationOther }}
          </div>
          <div v-else>{{ item.pickUpLocation }}</div>
        </template>

        <template #item.dropOffLocation="{ item }">
          <div v-if="item.sameDropOffLocation && item.pickUpLocation === LOCATION_TYPES.OTHER">
            {{ item.pickUpLocationOther }}
          </div>
          <div v-else-if="item.sameDropOffLocation">{{ item.pickUpLocation }}</div>
          <div v-else>{{ item.dropOffLocation }}</div>
        </template>

        <template #item.pickUpDate="{ value }">
          {{ formatDate(value) }}
        </template>
        <template #item.dropOffDate="{ value }">
          {{ formatDate(value) }}
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, ref } from "vue"
import { DateTime } from "luxon"

import useTravelDeskRentalCars, { LOCATION_TYPES } from "@/use/use-travel-desk-rental-cars"

const props = defineProps({
  travelDeskTravelRequestId: {
    type: Number,
    required: true,
  },
})

const headers = ref([
  {
    text: "Match Flight Times",
    value: "matchFlightTimes",
    sortable: false,
  },
  {
    text: "Pick-Up City",
    value: "pickUpCity",
    sortable: false,
  },
  {
    text: "Pick-up Location",
    value: "pickUpLocation",
    sortable: false,
  },
  {
    text: "Drop-off City",
    value: "dropOffCity",
    sortable: false,
  },
  {
    text: "Drop-off Location",
    value: "dropOffLocation",
    sortable: false,
  },
  {
    text: "Pick-up Date",
    value: "pickUpDate",
  },
  {
    text: "Drop-off Date",
    value: "dropOffDate",
  },
  {
    text: "Vehicle Type",
    value: "vehicleType",
    sortable: false,
  },
  {
    text: "Reason Change",
    value: "vehicleChangeRationale",
    sortable: false,
  },
  {
    text: "Additional Notes",
    value: "additionalNotes",
    sortable: false,
  },
  {
    text: "",
    value: "actions",
    width: "4rem",
    sortable: false,
  },
])

const travelDeskRentalCarsQuery = computed(() => ({
  where: {
    travelRequestId: props.travelDeskTravelRequestId,
  },
}))
const { travelDeskRentalCars, isLoading } = useTravelDeskRentalCars(travelDeskRentalCarsQuery)

function formatDate(date) {
  return DateTime.fromISO(date, { zone: "utc" }).toFormat("MMM dd yyyy, HH:mm")
}
</script>

<style scoped></style>
