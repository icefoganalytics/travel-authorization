<template>
  <v-dialog
    v-model="showDialog"
    persistent
    max-width="1200px"
    @keydown.esc="hide"
    @update:model-value="hideIfFalse"
  >
    <template #activator="{ props: activatorProps }">
      <v-btn
        color="primary"
        v-bind="activatorProps"
      >
        Add Flight
      </v-btn>
    </template>

    <v-form
      ref="form"
      @submit.prevent="createAndHide"
    >
      <v-card :loading="isLoading">
        <v-card-title>
          <h2>Add Flight</h2>
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
              <StringDateInput
                v-model="travelDeskFlightRequest.datePreference"
                :min="minDate"
                :max="maxDate"
                :picker-date="minDate"
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
            color="primary"
            type="submit"
          >
            Create Flight
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

import travelDeskFlightRequestsApi, {
  type TravelDeskFlightRequest,
} from "@/api/travel-desk-flight-requests-api"

import useRouteQuery, { booleanTransformer } from "@/use/utils/use-route-query"
import useSnack from "@/use/use-snack"

import StringDateInput from "@/components/common/StringDateInput.vue"
import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"
import SeatPreferenceSelect from "@/components/travel-desk-flight-requests/SeatPreferenceSelect.vue"

const props = withDefaults(
  defineProps<{
    travelRequestId: number
    minDate?: string | null
    maxDate?: string | null
  }>(),
  {
    minDate: null,
    maxDate: null,
  }
)

const emit = defineEmits<{
  created: [travelDeskFlightRequestId: number]
}>()

const showDialog = useRouteQuery("showTravelDeskFlightRequestCreate", "false", {
  transform: booleanTransformer,
})

const travelDeskFlightRequest = ref<Partial<TravelDeskFlightRequest>>({
  travelRequestId: props.travelRequestId,
})

watch(
  () => props.travelRequestId,
  () => {
    resetTravelDeskFlightRequest()
  },
  { immediate: true }
)

const form = useTemplateRef("form")
const snack = useSnack()
const isLoading = ref(false)

async function createAndHide() {
  if (isNil(form.value)) return

  const { valid } = await form.value.validate()
  if (!valid) {
    snack.warning("Please fill in all required fields.")
    return
  }

  isLoading.value = true
  try {
    const { travelDeskFlightRequest: newTravelDeskFlightRequest } =
      await travelDeskFlightRequestsApi.create(travelDeskFlightRequest.value)
    hide()

    await nextTick()
    emit("created", newTravelDeskFlightRequest.id)
    snack.success("Flight request created successfully")
  } catch (error) {
    console.error(`Failed to create flight request: ${error}`, { error })
    snack.error(`Failed to create flight request: ${error}`)
  } finally {
    isLoading.value = false
  }
}

function resetTravelDeskFlightRequest() {
  travelDeskFlightRequest.value = {
    travelRequestId: props.travelRequestId,
  }
}

function show() {
  showDialog.value = true
}

function hide() {
  showDialog.value = false
  resetTravelDeskFlightRequest()
  form.value?.resetValidation()
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
