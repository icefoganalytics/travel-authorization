<template>
  <v-card>
    <v-card-title>
      <h4>Hotel Request</h4>
    </v-card-title>
    <v-card-text class="px-0 px-md-4">
      <v-data-table
        :headers="headers"
        :items="travelDeskHotels"
        :loading="isLoading"
        hide-default-footer
      >
        <template #item.isDedicatedConferenceHotelAvailable="{ item }">
          {{ item.isDedicatedConferenceHotelAvailable ? "Yes" : "No" }}
        </template>

        <template #item.checkIn="{ item }">
          {{ formatDate(item.checkIn) }}
        </template>

        <template #item.checkOut="{ item }">
          {{ formatDate(item.checkOut) }}
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, ref } from "vue"
import { DateTime } from "luxon"

import useTravelDeskHotels from "@/use/use-travel-desk-hotels"

const props = defineProps({
  travelDeskTravelRequestId: {
    type: Number,
    required: true,
  },
})

const headers = ref([
  {
    text: "Check-in",
    value: "checkIn",
  },
  {
    text: "Check-out",
    value: "checkOut",
  },
  {
    text: "City",
    value: "city",
    sortable: false,
  },
  {
    text: "Conference Hotel?",
    value: "isDedicatedConferenceHotelAvailable",
    sortable: false,
  },
  {
    text: "Conference/Meeting Name",
    value: "conferenceName",
    sortable: false,
  },
  {
    text: "Conference/Meeting Hotel",
    value: "conferenceHotelName",
    sortable: false,
  },
  {
    text: "Additional Information",
    value: "additionalInformation",
    sortable: false,
  },
  {
    text: "",
    value: "actions",
    width: "4rem",
    sortable: false,
  },
])

const travelDeskHotelsQuery = computed(() => ({
  where: {
    travelRequestId: props.travelDeskTravelRequestId,
  },
}))
const { travelDeskHotels, isLoading } = useTravelDeskHotels(travelDeskHotelsQuery)

function formatDate(date) {
  return DateTime.fromISO(date, { zone: "utc" }).toFormat("MMM dd yyyy")
}
</script>

<style scoped></style>
