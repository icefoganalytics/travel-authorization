<template>
  <v-dialog
    v-model="confirmBookingDialog"
    width="500"
    @keydown.esc="close"
    @click:outside="close"
  >
    <v-card>
      <v-card-title class="warning">
        <div class="text-h5">Confirm Booking is Complete</div>
      </v-card-title>
      <v-card-text>
        <p class="mt-5">
          Are you sure this booking is Complete?<br />
          Once a booking is completed, you can no longer make changes to it.
        </p>
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="grey darken-5"
          class="px-5"
          @click="close"
        >
          <div>Cancel</div>
        </v-btn>
        <v-btn
          class="mr-0 ml-auto px-5"
          color="#005A65"
          :loading="isLoading"
          @click="bookTravelRequest"
          >Confirm
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from "vue"
import { isNil } from "lodash"

import useSnack from "@/use/use-snack"
import travelDeskTravelRequestsApi from "@/api/travel-desk-travel-requests-api"
import useRouteQuery, { integerTransformerLegacy } from "@/use/utils/use-route-query"

const emit = defineEmits({
  booked: null,
})

const confirmBookingDialog = ref(false)
const isLoading = ref(false)
const travelDeskTravelRequestId = useRouteQuery("showConfirmBooking", null, {
  mode: "push",
  transform: integerTransformerLegacy,
})

const snack = useSnack()

async function bookTravelRequest() {
  isLoading.value = true
  try {
    await travelDeskTravelRequestsApi.book(travelDeskTravelRequestId.value)
    snack.success("Travel request booked.")
    emit("booked")
    close()
  } catch (error) {
    console.error(error)
    snack.error(`Failed to book travel request: ${error}`)
  } finally {
    isLoading.value = false
  }
}

watch(
  travelDeskTravelRequestId,
  (newTravelDeskTravelRequestId) => {
    if (isNil(newTravelDeskTravelRequestId)) {
      confirmBookingDialog.value = false
    } else {
      confirmBookingDialog.value = true
    }
  },
  {
    immediate: true,
  }
)

function open(newTravelDeskTravelRequestId) {
  travelDeskTravelRequestId.value = newTravelDeskTravelRequestId
}

function close() {
  travelDeskTravelRequestId.value = null
}

defineExpose({
  open,
})
</script>
