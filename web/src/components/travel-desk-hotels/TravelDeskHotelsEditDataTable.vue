<template>
  <TravelDeskHotelsDataTable
    ref="travelDeskHotelsDataTable"
    :where="where"
    :filters="filters"
  >
    <template #top>
      <TravelDeskHotelEditDialog
        ref="editDialog"
        :min-date="minDate"
        :max-date="maxDate"
        :flight-start="earliestFlightDate"
        :flight-end="latestFlightDate"
        @saved="refreshTravelDeskHotels"
      />
    </template>
    <template #item.actions="{ item }">
      <div class="d-flex justify-end">
        <v-btn
          title="Edit"
          icon
          color="blue"
          @click="showEditDialog(item.id)"
          ><v-icon>mdi-pencil</v-icon></v-btn
        >
        <v-btn
          :loading="isLoading"
          title="Delete"
          icon
          color="red"
          @click="deleteHotel(item)"
          ><v-icon>mdi-close</v-icon></v-btn
        >
      </div>
    </template>
  </TravelDeskHotelsDataTable>
</template>

<script setup>
import { ref } from "vue"

import blockedToTrueConfirm from "@/utils/blocked-to-true-confirm"
import travelDeskHotelsApi from "@/api/travel-desk-hotels-api"

import TravelDeskHotelsDataTable from "@/components/travel-desk-hotels/TravelDeskHotelsDataTable.vue"
import TravelDeskHotelEditDialog from "@/components/travel-desk-hotels/TravelDeskHotelEditDialog.vue"

defineProps({
  where: {
    type: Object,
    default: () => ({}),
  },
  filters: {
    type: Object,
    default: () => ({}),
  },
  minDate: {
    /** @type {string | null} */
    type: String,
    default: null,
  },
  maxDate: {
    /** @type {string | null} */
    type: String,
    default: null,
  },
  earliestFlightDate: {
    /** @type {string | null} */
    type: String,
    default: null,
  },
  latestFlightDate: {
    type: String,
    default: null,
  },
})

/** @type {import("vue").Ref<InstanceType<typeof TravelDeskHotelEditDialog> | null>} */
const editDialog = ref(null)

function showEditDialog(travelDeskHotelId) {
  editDialog.value?.show(travelDeskHotelId)
}

/** @type {import("vue").Ref<InstanceType<typeof TravelDeskHotelsDataTable> | null>} */
const travelDeskHotelsDataTable = ref(null)

async function refreshTravelDeskHotels() {
  return travelDeskHotelsDataTable.value?.refresh()
}

const isLoading = ref(false)

async function deleteHotel(hotel) {
  if (!blockedToTrueConfirm("Are you sure you want to remove this hotel?")) return

  isLoading.value = true
  try {
    await travelDeskHotelsApi.delete(hotel.id)
    await refreshTravelDeskHotels()
  } catch (error) {
    console.error(error)
  } finally {
    isLoading.value = false
  }
}

defineExpose({
  refresh: refreshTravelDeskHotels,
})
</script>
