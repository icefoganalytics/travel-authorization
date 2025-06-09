<template>
  <div>
    <v-dialog
      v-model="showDialog"
      persistent
      max-width="80%"
    >
      <template #activator="{ on, attrs }">
        <v-btn
          color="primary"
          v-bind="attrs"
          v-on="on"
        >
          Add Rental Car
        </v-btn>
      </template>

      <v-form
        ref="form"
        @submit.prevent="createAndClose"
      >
        <v-card :loading="isLoading">
          <v-card-title class="blue">
            <div class="text-h5">Add Rental Car</div>
          </v-card-title>

          <v-card-text>
            <v-row class="mt-5 mx-0">
              <v-col
                cols="12"
                md="4"
              >
                <LocationsAutocomplete
                  v-model="rentalCar.pickUpCity"
                  :rules="[required]"
                  item-value="city"
                  label="Pick-up City *"
                  outlined
                  required
                />
              </v-col>
              <v-col
                cols="12"
                md="5"
              >
                <!-- TODO: add tooltip explaining disabled state -->
                <YesNoRowRadioGroup
                  v-model="rentalCar.matchFlightTimes"
                  label="Pick-up/Drop-off match flights"
                  :disabled="isNil(flightStart) || isNil(flightEnd)"
                  class="mt-1"
                  @change="matchWithFlight"
                />
              </v-col>
              <v-col
                cols="12"
                md="3"
              >
                <VehicleTypeSelect
                  v-model="rentalCar.vehicleType"
                  :rules="[required]"
                  label="Vehicle Type *"
                  outlined
                  required
                  @input="resetReasonForChangeIfCompact"
                />
              </v-col>
            </v-row>
            <v-row class="mt-0 mx-0">
              <v-col
                cols="12"
                md="3"
              >
                <LocationTypeSelect
                  v-model="rentalCar.pickUpLocation"
                  :rules="[required]"
                  label="Pick-up Location *"
                  outlined
                  required
                  @input="resetPickUpLocationOtherUnlessOther"
                />
                <v-text-field
                  v-if="rentalCar.pickUpLocation === LOCATION_TYPES.OTHER"
                  v-model="rentalCar.pickUpLocationOther"
                  :rules="[required]"
                  class="mt-n3"
                  label="Other Pick-up Location *"
                  outlined
                  required
                />
              </v-col>
              <v-col
                cols="12"
                md="2"
              >
                <v-text-field
                  v-model="pickUpDate"
                  label="Pick-up date *"
                  type="date"
                  :disabled="rentalCar.matchFlightTimes"
                  :min="minDate"
                  :max="maxDate"
                  :rules="[required]"
                  outlined
                  required
                />
                <v-text-field
                  v-model="dropOffDate"
                  label="Drop-off date *"
                  type="date"
                  class="mt-n3"
                  :disabled="rentalCar.matchFlightTimes"
                  :min="minDate"
                  :max="maxDate"
                  :rules="[required]"
                  outlined
                  required
                />
              </v-col>
              <v-col
                cols="12"
                md="2"
              >
                <v-text-field
                  v-model="pickUpTime"
                  label="Pick-up time *"
                  type="time"
                  :rules="[required]"
                  outlined
                  required
                />
                <v-text-field
                  v-model="dropOffTime"
                  label="Drop-off time *"
                  type="time"
                  :rules="[required]"
                  class="mt-n3"
                  outlined
                  required
                />
              </v-col>
              <v-col
                cols="12"
                md="5"
              >
                <v-textarea
                  v-if="rentalCar.vehicleType !== VEHICLE_TYPES.COMPACT"
                  v-model="rentalCar.vehicleChangeRationale"
                  label="Reason for Change *"
                  :rules="[required]"
                  rows="4"
                  outlined
                  required
                />
              </v-col>
            </v-row>
            <v-row class="mt-0 mx-0">
              <v-col
                cols="12"
                md="3"
              >
                <YesNoRowRadioGroup
                  v-model="rentalCar.sameDropOffLocation"
                  label="Same Drop-off location?"
                  class="mt-1"
                  @change="resetDropOffLocationStates"
                />
                <LocationsAutocomplete
                  v-if="rentalCar.sameDropOffLocation === false"
                  v-model="rentalCar.dropOffCity"
                  :rules="[required]"
                  item-value="city"
                  class="mt-n1"
                  label="Drop-off City *"
                  outlined
                  required
                />
              </v-col>
              <v-col
                cols="12"
                md="3"
              >
                <LocationTypeSelect
                  v-if="rentalCar.sameDropOffLocation === false"
                  v-model="rentalCar.dropOffLocation"
                  :rules="[required]"
                  class="mt-n1"
                  label="Drop-off Location *"
                  outlined
                  required
                  @input="resetDropOffLocationOtherUnlessOther"
                />
                <v-text-field
                  v-if="
                    rentalCar.sameDropOffLocation === false &&
                    rentalCar.dropOffLocation === LOCATION_TYPES.OTHER
                  "
                  v-model="rentalCar.dropOffLocationOther"
                  label="Other Drop-off Location *"
                  :rules="[required]"
                  class="mt-n3"
                  outlined
                  required
                />
              </v-col>
              <v-col
                cols="12"
                md="6"
              >
                <v-textarea
                  v-model="rentalCar.additionalNotes"
                  label="Additional Information"
                  outlined
                  rows="4"
                  clearable
                />
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn
              :loading="isLoading"
              color="grey darken-5"
              @click="close"
            >
              Cancel
            </v-btn>
            <v-btn
              :loading="isLoading"
              color="green darken-1"
              type="submit"
            >
              Add
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from "vue"
import { useRoute, useRouter } from "vue2-helpers/vue-router"
import { isNil } from "lodash"

import { required } from "@/utils/validators"
import useSnack from "@/use/use-snack"
import travelDeskRentalCarsApi, {
  LOCATION_TYPES,
  VEHICLE_TYPES,
} from "@/api/travel-desk-rental-cars-api"

import YesNoRowRadioGroup from "@/components/common/YesNoRowRadioGroup.vue"
import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"
import LocationTypeSelect from "@/components/travel-request-rental-cars/LocationTypeSelect.vue"
import VehicleTypeSelect from "@/components/travel-request-rental-cars/VehicleTypeSelect.vue"

const props = defineProps({
  travelDeskTravelRequestId: {
    type: Number,
    required: true,
  },
  minDate: {
    type: String,
    default: null,
  },
  maxDate: {
    type: String,
    default: null,
  },
  // TODO: consider loading flightStart/End using travelDeskTravelRequestId?
  flightStart: {
    type: String,
    default: null,
  },
  flightEnd: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(["created"])

const rentalCar = ref({
  travelRequestId: props.travelDeskTravelRequestId,
  sameDropOffLocation: true,
  matchFlightTimes: false,
  pickUpTime: "12:00",
  dropOffTime: "12:00",
  vehicleType: VEHICLE_TYPES.COMPACT,
})
const pickUpDate = ref("")
const pickUpTime = ref("12:00")
const dropOffDate = ref("")
const dropOffTime = ref("12:00")

const snack = useSnack()
const router = useRouter()
const route = useRoute()
const showDialog = ref(route.query.showRentalCarCreate === "true")

/** @type {import("vue").Ref<InstanceType<typeof import("vuetify/lib").VForm> | null>} */
const form = ref(null)
const isLoading = ref(false)

function matchWithFlight(value) {
  if (value === true) {
    pickUpDate.value = props.flightStart
    dropOffDate.value = props.flightEnd
  }
}

function resetReasonForChangeIfCompact(value) {
  if (value === VEHICLE_TYPES.COMPACT) {
    rentalCar.value.vehicleChangeRationale = null
  }
}

function resetPickUpLocationOtherUnlessOther(value) {
  if (value !== LOCATION_TYPES.OTHER) {
    rentalCar.value.pickUpLocationOther = null
  }
}

function resetDropOffLocationOtherUnlessOther(value) {
  if (value !== LOCATION_TYPES.OTHER) {
    rentalCar.value.dropOffLocationOther = null
  }
}

function resetDropOffLocationStates(value) {
  if (value === true) {
    rentalCar.value.dropOffCity = null
    rentalCar.value.dropOffLocation = null
    rentalCar.value.dropOffLocationOther = null
  }
}

watch(
  () => props.travelDeskTravelRequestId,
  () => {
    resetState()
  },
  { immediate: true }
)

watch(
  () => showDialog.value,
  (value) => {
    if (value) {
      router.push({ query: { showRentalCarCreate: "true" } })
    } else {
      router.push({ query: { showRentalCarCreate: undefined } })
    }
  }
)

function close() {
  showDialog.value = false
  resetState()
  form.value?.resetValidation()
}

async function createAndClose() {
  if (!form.value?.validate()) {
    snack("Please fill in all required fields", { color: "error" })
    return
  }

  // TODO: Notify the user, in the UI, that times are in UTC?
  // Or maybe make them local to city?
  // Oversight in original code so not fixing at this time.
  rentalCar.value.pickUpDate = pickUpDate.value + "T" + pickUpTime.value + ":00.000Z"
  rentalCar.value.dropOffDate = dropOffDate.value + "T" + dropOffTime.value + ":00.000Z"

  isLoading.value = true
  try {
    const { travelDeskRentalCar: newRentalCar } = await travelDeskRentalCarsApi.create(
      rentalCar.value
    )
    close()

    await nextTick()
    emit("created", newRentalCar.id)
    snack("Rental car request created successfully", { color: "success" })
  } catch (error) {
    console.error(error)
    snack("Failed to create rental car request", { color: "error" })
  } finally {
    isLoading.value = false
  }
}

function resetState() {
  rentalCar.value = {
    travelRequestId: props.travelDeskTravelRequestId,
    sameDropOffLocation: true,
    matchFlightTimes: false,
    pickUpTime: "12:00",
    dropOffTime: "12:00",
    vehicleType: VEHICLE_TYPES.COMPACT,
  }

  pickUpDate.value = ""
  pickUpTime.value = "12:00"
  dropOffDate.value = ""
  dropOffTime.value = "12:00"
}
</script>

<style scoped>
.label {
  font-weight: 600;
  font-size: 10pt !important;
}
</style>
