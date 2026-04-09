<template>
  <v-dialog
    :model-value="showDialog"
    persistent
    max-width="1200px"
    @keydown.esc="hide"
    @update:model-value="hideIfFalse"
  >
    <v-form
      ref="form"
      @submit.prevent="updateAndHide"
    >
      <v-skeleton-loader
        v-if="isNil(travelDeskFlightRequestId) || isNil(travelDeskFlightRequest)"
        type="card"
      />
      <v-card
        v-else
        :loading="isLoading"
      >
        <v-card-title>
          <h2>Edit Flight</h2>
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col
              cols="12"
              md="4"
            >
              <LocationsAutocomplete
                v-model="travelDeskFlightRequest.departLocation"
                :rules="[required]"
                label="Depart Location *"
                item-value="city"
                variant="outlined"
                required
              />
            </v-col>
            <v-col
              cols="12"
              md="4"
            >
              <LocationsAutocomplete
                v-model="travelDeskFlightRequest.arriveLocation"
                :rules="[required]"
                label="Arrive Location *"
                item-value="city"
                variant="outlined"
                required
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col
              cols="12"
              md="4"
            >
              <v-text-field
                v-model="travelDeskFlightRequest.datePreference"
                :min="minDate"
                :max="maxDate"
                :rules="[required]"
                label="Date *"
                type="date"
                variant="outlined"
                required
              />
            </v-col>
            <v-col
              cols="12"
              md="4"
            >
              <div class="label">Time Preference *</div>
              <v-radio-group
                v-model="travelDeskFlightRequest.timePreference"
                :rules="[required]"
                class="mt-1"
                row
                required
              >
                <v-radio
                  label="AM"
                  value="AM"
                ></v-radio>
                <v-radio
                  label="PM"
                  value="PM"
                ></v-radio>
              </v-radio-group>
            </v-col>
            <v-col
              cols="12"
              md="4"
            >
              <SeatPreferenceSelect
                v-model="travelDeskFlightRequest.seatPreference"
                :rules="[required]"
                label="Seat Preference *"
                variant="outlined"
                required
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            :loading="isLoading"
            color="warning"
            variant="outlined"
            @click="hide"
          >
            Cancel
          </v-btn>
          <v-btn
            :loading="isLoading"
            type="submit"
            color="primary"
          >
            Save Flight
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script setup>
import { ref, nextTick, watch } from "vue"
import { isNil } from "lodash"

import { required } from "@/utils/validators"

import travelDeskFlightRequestsApi from "@/api/travel-desk-flight-requests-api"

import useRouteQuery, { integerTransformerLegacy } from "@/use/utils/use-route-query"
import useSnack from "@/use/use-snack"
import useTraveDeskFlightRequest from "@/use/use-travel-desk-flight-request"

import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"
import SeatPreferenceSelect from "@/components/travel-desk-flight-requests/SeatPreferenceSelect.vue"

defineProps({
  minDate: {
    type: String,
    default: "",
  },
  maxDate: {
    type: String,
    default: "",
  },
})

const emit = defineEmits(["saved"])

const travelDeskFlightRequestId = useRouteQuery("showFlightRequestEdit", undefined, {
  transform: integerTransformerLegacy,
})

const { travelDeskFlightRequest, isLoading } = useTraveDeskFlightRequest(travelDeskFlightRequestId)

const showDialog = ref(false)

/** @type {import("vue").Ref<InstanceType<typeof import("vuetify/components").VForm> | null>} */
const form = ref(null)

function show(newTravelDeskFlightRequestId) {
  travelDeskFlightRequestId.value = newTravelDeskFlightRequestId
}

function hide() {
  travelDeskFlightRequestId.value = undefined
}

watch(
  travelDeskFlightRequestId,
  (newTravelDeskFlightRequestId) => {
    if (isNil(newTravelDeskFlightRequestId)) {
      showDialog.value = false
      travelDeskFlightRequest.value = null
      form.value?.resetValidation()
    } else {
      showDialog.value = true
    }
  },
  {
    immediate: true,
  }
)

const snack = useSnack()

async function updateAndHide() {
  if (isNil(form.value)) return

  const { valid } = await form.value.validate()
  if (!valid) {
    snack.error("Please fill in all required fields")
    return
  }

  isLoading.value = true
  try {
    if (travelDeskFlightRequestId.value === undefined) {
      throw new Error("Flight request could not be found")
    }

    const { travelDeskFlightRequest: newFlightRequest } = await travelDeskFlightRequestsApi.update(
      travelDeskFlightRequestId.value,
      travelDeskFlightRequest.value
    )
    hide()

    await nextTick()
    emit("saved", newFlightRequest.id)
    snack.success("Flight request saved")
  } catch (error) {
    console.error(`Failed to save flight request: ${error}`, { error })
    snack.error(`Failed to save flight request: ${error}`)
  } finally {
    isLoading.value = false
  }
}

function hideIfFalse(value) {
  if (value !== false) return

  hide()
}

defineExpose({
  show,
})
</script>

<style scoped>
.label {
  font-weight: 600;
  font-size: 10pt !important;
}
</style>
