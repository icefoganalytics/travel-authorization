<template>
  <v-card>
    <v-card-title>
      <h4>Other Transportation Request</h4>
    </v-card-title>
    <v-card-text class="px-0 px-md-4">
      <v-data-table
        :headers="headers"
        :items="travelDeskOtherTransportations"
        :loading="isLoading"
        hide-default-footer
      >
        <template #item.date="{ item }">
          {{ formatDate(item.date) }}
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, ref } from "vue"
import { DateTime } from "luxon"

import useTravelDeskOtherTransportations from "@/use/use-travel-desk-other-transportations"

const props = defineProps({
  travelDeskTravelRequestId: {
    type: Number,
    required: true,
  },
})

const headers = ref([
  {
    text: "Type",
    value: "transportationType",
    sortable: false,
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
    text: "",
    value: "actions",
    width: "4rem",
    sortable: false,
  },
])

const travelDeskOtherTransportationsQuery = computed(() => ({
  where: {
    travelRequestId: props.travelDeskTravelRequestId,
  },
}))
const { travelDeskOtherTransportations, isLoading } = useTravelDeskOtherTransportations(
  travelDeskOtherTransportationsQuery
)

function formatDate(date) {
  return DateTime.fromISO(date, { zone: "utc" }).toFormat("MMM dd yyyy")
}
</script>

<style scoped></style>
