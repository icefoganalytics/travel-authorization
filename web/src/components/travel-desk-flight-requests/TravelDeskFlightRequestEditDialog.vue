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
                item-value="cityUniqueLegacy"
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
                item-value="cityUniqueLegacy"
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
              <v-radio-group
                v-model="travelDeskFlightRequest.timePreference"
                label="Time Preference *"
                :rules="[required]"
                inline
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

<script setup lang="ts">
import { nextTick, ref, useTemplateRef, watch } from "vue"
import { isNil } from "lodash"

import { required } from "@/utils/validators"

import travelDeskFlightRequestsApi from "@/api/travel-desk-flight-requests-api"

import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import useSnack from "@/use/use-snack"
import useTraveDeskFlightRequest from "@/use/use-travel-desk-flight-request"

import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"
import SeatPreferenceSelect from "@/components/travel-desk-flight-requests/SeatPreferenceSelect.vue"

withDefaults(
  defineProps<{
    minDate?: string | null
    maxDate?: string | null
  }>(),
  {
    minDate: null,
    maxDate: null,
  }
)

const emit = defineEmits<{
  saved: [travelDeskFlightRequestId: number]
}>()

const travelDeskFlightRequestId = useRouteQuery<string | undefined, number | undefined>(
  "showFlightRequestEdit",
  undefined,
  {
    transform: integerTransformer,
  }
)

const { travelDeskFlightRequest, isLoading } = useTraveDeskFlightRequest(travelDeskFlightRequestId)

const showDialog = ref(false)
const form = useTemplateRef("form")

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
    snack.warning("Please fill in all required fields.")
    return
  }

  isLoading.value = true
  try {
    if (isNil(travelDeskFlightRequestId.value)) {
      throw new Error("Flight request could not be found")
    }

    if (isNil(travelDeskFlightRequest.value)) {
      throw new Error("Flight request could not be loaded")
    }

    const { travelDeskFlightRequest: updatedTravelDeskFlightRequest } =
      await travelDeskFlightRequestsApi.update(
        travelDeskFlightRequestId.value,
        travelDeskFlightRequest.value
      )
    hide()

    await nextTick()
    emit("saved", updatedTravelDeskFlightRequest.id)
    snack.success("Flight request saved.")
  } catch (error) {
    console.error(`Failed to save flight request: ${error}`, { error })
    snack.error(`Failed to save flight request: ${error}`)
  } finally {
    isLoading.value = false
  }
}

function show(newTravelDeskFlightRequestId: number) {
  travelDeskFlightRequestId.value = newTravelDeskFlightRequestId
}

function hide() {
  travelDeskFlightRequestId.value = undefined
}

function hideIfFalse(value: boolean | null) {
  if (value !== false) return

  hide()
}

defineExpose({
  show,
  hide,
})
</script>
