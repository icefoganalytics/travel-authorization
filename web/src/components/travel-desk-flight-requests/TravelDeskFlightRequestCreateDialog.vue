<template>
  <v-dialog
    v-model="showDialog"
    persistent
    max-width="1200px"
    @keydown.esc="hide"
  >
    <template #activator="{ on, attrs }">
      <v-btn
        color="primary"
        v-bind="merge({}, attrs, activatorProps)"
        v-on="on"
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
                item-value="city"
                outlined
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
                outlined
                required
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col
              cols="12"
              md="4"
            >
              <DatePicker
                v-model="travelDeskFlightRequest.datePreference"
                :min="minDate"
                :max="maxDate"
                :picker-date="minDate"
                :rules="[required]"
                label="Date *"
                type="date"
                outlined
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
                outlined
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
            outlined
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

<script setup>
import { ref, nextTick } from "vue"
import { merge } from "lodash"

import { required } from "@/utils/validators"

import travelDeskFlightRequestsApi from "@/api/travel-desk-flight-requests-api"

import useRouteQuery from "@/use/utils/use-route-query"
import useSnack from "@/use/use-snack"

import DatePicker from "@/components/common/DatePicker.vue"
import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"
import SeatPreferenceSelect from "@/components/travel-desk-flight-requests/SeatPreferenceSelect.vue"

const props = defineProps({
  attributes: {
    type: Object,
    default: () => ({}),
  },
  minDate: {
    type: String,
    default: "",
  },
  maxDate: {
    type: String,
    default: "",
  },
  activatorProps: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(["created"])

const travelDeskFlightRequest = ref({
  ...props.attributes,
})

const snack = useSnack()
const showDialog = useRouteQuery("showTravelDeskFlightRequestCreate", false, { transform: Boolean })

/** @type {import("vue").Ref<InstanceType<typeof import("vuetify/lib").VForm> | null>} */
const form = ref(null)
const isLoading = ref(false)

function hide() {
  showDialog.value = false
  resetFlightRequest()
  form.value?.resetValidation()
}

async function createAndHide() {
  if (!form.value?.validate()) {
    snack.error("Please fill in all required fields")
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

function resetFlightRequest() {
  travelDeskFlightRequest.value = {
    travelRequestId: props.travelDeskTravelRequestId,
  }
}
</script>

<style scoped>
.label {
  font-weight: 600;
  font-size: 10pt !important;
}
</style>
