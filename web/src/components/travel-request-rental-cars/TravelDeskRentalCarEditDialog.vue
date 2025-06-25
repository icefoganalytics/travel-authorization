<template>
  <div>
    <v-dialog
      v-model="showDialog"
      persistent
      max-width="80%"
    >
      <v-form
        ref="form"
        @submit.prevent="updateAndClose"
      >
        <v-card :loading="isLoading">
          <v-card-title class="blue">
            <div class="text-h5">Edit Rental Car</div>
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
                  :items="Object.values(LOCATION_TYPES)"
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
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, computed } from "vue"
import { useRoute, useRouter } from "vue2-helpers/vue-router"
import { isNil, cloneDeep } from "lodash"
import { DateTime } from "luxon"

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
  minDate: {
    type: String,
    default: null,
  },
  maxDate: {
    type: String,
    default: null,
  },
  // TODO: consider computing flightStart/End internally?
  flightStart: {
    type: String,
    default: null,
  },
  flightEnd: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(["saved"])

const rentalCar = ref({})
const rentalCarId = computed(() => rentalCar.value.id)

const pickUpDate = ref("")
const pickUpTime = ref("")
const dropOffDate = ref("")
const dropOffTime = ref("")

const snack = useSnack()
const router = useRouter()
const route = useRoute()
const showDialog = ref(false)

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
  () => showDialog.value,
  (value) => {
    if (value) {
      if (route.query.showRentalCarEdit === rentalCarId.value?.toString()) {
        return
      }

      router.push({ query: { showRentalCarEdit: rentalCarId.value } })
    } else {
      router.push({ query: { showRentalCarEdit: undefined } })
    }
  }
)

function show(newRentalCar) {
  rentalCar.value = cloneDeep(newRentalCar)

  const pickUpDateTime = DateTime.fromISO(rentalCar.value.pickUpDate, { zone: "utc" })
  pickUpDate.value = pickUpDateTime.toFormat("yyyy-MM-dd")
  pickUpTime.value = pickUpDateTime.toFormat("HH:mm")

  const dropOffDateTime = DateTime.fromISO(rentalCar.value.dropOffDate, { zone: "utc" })
  dropOffDate.value = dropOffDateTime.toFormat("yyyy-MM-dd")
  dropOffTime.value = dropOffDateTime.toFormat("HH:mm")

  showDialog.value = true
}

function close() {
  showDialog.value = false
  resetState()
  form.value?.resetValidation()
}

async function updateAndClose() {
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
    const { travelDeskRentalCar: newRentalCar } = await travelDeskRentalCarsApi.update(
      rentalCarId.value,
      rentalCar.value
    )
    close()

    await nextTick()
    emit("saved", newRentalCar.id)
    snack("Rental car request saved successfully", { color: "success" })
  } catch (error) {
    console.error(error)
    snack("Failed to save rental car request", { color: "error" })
  } finally {
    isLoading.value = false
  }
}

function resetState() {
  rentalCar.value = {}

  pickUpDate.value = ""
  pickUpTime.value = ""
  dropOffDate.value = ""
  dropOffTime.value = ""
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
