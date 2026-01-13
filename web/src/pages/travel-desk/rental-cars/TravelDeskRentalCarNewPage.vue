<template>
  <HeaderActionsFormCard
    ref="headerActionsFormCard"
    title="New Rental Car Request"
    header-tag="h2"
    lazy-validation
    @submit.prevent="createAndReturn"
  >
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <h3 class="primary--text">
          <v-icon
            color="primary"
            size="28"
            class="mr-2"
            >mdi-calendar-month</v-icon
          >
          1. Trip Schedule
        </h3>
        <v-row>
          <v-col cols="6">
            <DatePicker
              v-model="pickUpDate"
              label="Pick-up date *"
              :picker-date="tripStartDate"
              :disabled="travelDeskRentalCarAttributes.matchFlightTimes"
              :min="tripStartDate"
              :max="tripEndDate"
              :rules="[required]"
              outlined
              required
            />
          </v-col>
          <v-col cols="6">
            <TimeTextField
              v-model="pickUpTime"
              label="Pick-up time *"
              :rules="[required]"
              outlined
              required
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6">
            <DatePicker
              v-model="dropOffDate"
              label="Drop-off date *"
              :disabled="travelDeskRentalCarAttributes.matchFlightTimes"
              :picker-date="tripStartDate"
              :min="tripStartDate"
              :max="tripEndDate"
              :rules="[required]"
              outlined
              required
            />
          </v-col>
          <v-col cols="6">
            <TimeTextField
              v-model="dropOffTime"
              label="Drop-off time *"
              :rules="[required]"
              outlined
              required
            />
          </v-col>
        </v-row>

        <v-sheet class="grey lighten-4 rounded-lg px-4">
          <v-row>
            <v-col>
              <YesNoRowRadioGroup
                v-model="travelDeskRentalCarAttributes.matchFlightTimes"
                label="Pick-up/Drop-off match flights"
                class="mt-0"
                @change="matchWithFlight"
              />
            </v-col>
          </v-row>
        </v-sheet>

        <h3 class="primary--text mt-10">
          <v-icon
            color="primary"
            size="28"
            class="mr-2"
            >mdi-map-marker</v-icon
          >
          2. Location Details
        </h3>
        <v-row>
          <v-col cols="12">
            <LocationsAutocomplete
              v-model="travelDeskRentalCarAttributes.pickUpCity"
              label="Pick-up City *"
              :rules="[required]"
              item-value="city"
              outlined
              required
            />
          </v-col>
          <v-col cols="12">
            <TravelDeskRentalCarLocationTypeSelect
              v-model="travelDeskRentalCarAttributes.pickUpLocation"
              label="Pick-up Location *"
              :rules="[required]"
              outlined
              required
              @input="resetPickUpLocationOtherUnlessOther"
            />
            <v-text-field
              v-if="
                travelDeskRentalCarAttributes.pickUpLocation ===
                TravelDeskRentalCarLocationTypes.OTHER
              "
              v-model="travelDeskRentalCarAttributes.pickUpLocationOther"
              label="Other Pick-up Location *"
              :rules="[required]"
              outlined
              required
            />
          </v-col>
        </v-row>
        <v-sheet class="grey lighten-4 rounded-lg px-4">
          <v-row>
            <v-col>
              <YesNoRowRadioGroup
                v-model="travelDeskRentalCarAttributes.sameDropOffLocation"
                label="Same Drop-off location?"
                class="mt-1"
                @change="resetDropOffLocationStates"
              />
            </v-col>
          </v-row>
          <v-row v-if="travelDeskRentalCarAttributes.sameDropOffLocation === false">
            <v-col cols="12">
              <LocationsAutocomplete
                v-model="travelDeskRentalCarAttributes.dropOffCity"
                label="Drop-off City *"
                :rules="[required]"
                item-value="city"
                outlined
                required
              />
            </v-col>
            <v-col cols="12">
              <TravelDeskRentalCarLocationTypeSelect
                v-model="travelDeskRentalCarAttributes.dropOffLocation"
                label="Drop-off Location *"
                :rules="[required]"
                outlined
                required
                @input="updateDropOffLocation"
              />
              <v-text-field
                v-if="
                  travelDeskRentalCarAttributes.sameDropOffLocation === false &&
                  travelDeskRentalCarAttributes.dropOffLocation ===
                    TravelDeskRentalCarLocationTypes.OTHER
                "
                v-model="travelDeskRentalCarAttributes.dropOffLocationOther"
                label="Other Drop-off Location *"
                class="mt-n3"
                :rules="[required]"
                outlined
                required
              />
            </v-col>
          </v-row>
        </v-sheet>
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <h3 class="primary--text mt-10 mt-md-0">
          <v-icon
            color="primary"
            size="28"
            class="mr-2"
            >mdi-car</v-icon
          >
          3. Vehicle & Extra Info
        </h3>
        <v-row>
          <v-col cols="12">
            <TravelDeskRentalCarVehicleTypeSelect
              v-model="travelDeskRentalCarAttributes.vehicleType"
              label="Vehicle Type *"
              :rules="[required]"
              outlined
              required
              @input="resetVehicleChangeRationaleIfCompact"
            />
          </v-col>
          <v-col
            v-if="
              travelDeskRentalCarAttributes.vehicleType !== TravelDeskRentalCarVehicleTypes.COMPACT
            "
            cols="12"
          >
            <v-textarea
              v-model="travelDeskRentalCarAttributes.vehicleChangeRationale"
              label="Reason for Change *"
              hint="Please provide a reason for requesting a vehicle type other than Compact."
              :rules="[required]"
              outlined
              persistent-hint
              required
              rows="4"
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="travelDeskRentalCarAttributes.additionalNotes"
              label="Additional Information"
              outlined
              rows="10"
              clearable
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-divider />

    <template #actions>
      <v-btn
        color="primary"
        type="submit"
        :loading="isSaving"
        :disabled="isSaving"
      >
        Save Rental Car Request
      </v-btn>
      <v-btn
        color="grey"
        @click="returnToTravelDesk"
      >
        Cancel
      </v-btn>
    </template>
  </HeaderActionsFormCard>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"
import { useRouter } from "vue2-helpers/vue-router"

import { required } from "@/utils/validators"

import travelDeskRentalCarsApi, {
  type TravelDeskRentalCar,
  TravelDeskRentalCarLocationTypes,
  TravelDeskRentalCarVehicleTypes,
} from "@/api/travel-desk-rental-cars-api"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useSnack from "@/use/use-snack"
import useTravelTimesSummary from "@/use/travel-desk-travel-requests/use-travel-times-summary"

import DatePicker from "@/components/common/DatePicker.vue"
import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"
import TimeTextField from "@/components/common/TimeTextField.vue"
import YesNoRowRadioGroup from "@/components/common/YesNoRowRadioGroup.vue"

import TravelDeskRentalCarLocationTypeSelect from "@/components/travel-request-rental-cars/TravelDeskRentalCarLocationTypeSelect.vue"
import TravelDeskRentalCarVehicleTypeSelect from "@/components/travel-request-rental-cars/TravelDeskRentalCarVehicleTypeSelect.vue"

import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"

const props = defineProps<{
  travelDeskTravelRequestId: string
}>()

const travelDeskTravelRequestIdAsNumber = computed(() => parseInt(props.travelDeskTravelRequestId))

const { tripStartDate, tripEndDate, flightStartDate, flightEndDate } = useTravelTimesSummary(
  travelDeskTravelRequestIdAsNumber
)

const travelDeskRentalCarAttributes = ref<Partial<TravelDeskRentalCar>>({
  travelRequestId: travelDeskTravelRequestIdAsNumber.value,
  pickUpCity: undefined,
  pickUpLocation: undefined,
  pickUpLocationOther: undefined,
  dropOffCity: undefined,
  dropOffLocation: undefined,
  dropOffLocationOther: undefined,
  sameDropOffLocation: true,
  matchFlightTimes: false,
  vehicleType: TravelDeskRentalCarVehicleTypes.COMPACT,
  vehicleChangeRationale: undefined,
  additionalNotes: undefined,
})

const pickUpDate = ref("")
const pickUpTime = ref("12:00")
const dropOffDate = ref("")
const dropOffTime = ref("12:00")

function resetPickUpLocationOtherUnlessOther(value: string) {
  if (value !== TravelDeskRentalCarLocationTypes.OTHER) {
    travelDeskRentalCarAttributes.value.pickUpLocationOther = undefined
  }
}

function updateDropOffLocation(value: string) {
  travelDeskRentalCarAttributes.value.dropOffLocation = value
  if (value !== TravelDeskRentalCarLocationTypes.OTHER) {
    travelDeskRentalCarAttributes.value.dropOffLocationOther = undefined
  }
}

function resetDropOffLocationStates(value: boolean) {
  if (value === true) {
    travelDeskRentalCarAttributes.value.dropOffCity = undefined
    travelDeskRentalCarAttributes.value.dropOffLocation = undefined
    travelDeskRentalCarAttributes.value.dropOffLocationOther = undefined
  }
}

function resetVehicleChangeRationaleIfCompact(value: string) {
  if (value === TravelDeskRentalCarVehicleTypes.COMPACT) {
    travelDeskRentalCarAttributes.value.vehicleChangeRationale = undefined
  }
}

function matchWithFlight(value: boolean) {
  if (value && flightStartDate.value && flightEndDate.value) {
    pickUpDate.value = flightStartDate.value
    dropOffDate.value = flightEndDate.value
    pickUpTime.value = "12:00"
    dropOffTime.value = "12:00"
  }
}

const headerActionsFormCard = ref<InstanceType<typeof HeaderActionsFormCard> | null>(null)
const isSaving = ref(false)
const snack = useSnack()
const router = useRouter()

async function createAndReturn() {
  if (!headerActionsFormCard.value?.validate()) return

  // TODO: Notify the user, in the UI, that times are in UTC?
  // Or maybe make them local to city?
  // Oversight in original code so not fixing at this time.
  travelDeskRentalCarAttributes.value.pickUpDate = `${pickUpDate.value}T${pickUpTime.value}:00.000Z`
  travelDeskRentalCarAttributes.value.dropOffDate = `${dropOffDate.value}T${dropOffTime.value}:00.000Z`

  isSaving.value = true
  try {
    await travelDeskRentalCarsApi.create(travelDeskRentalCarAttributes.value)
    snack.success("Rental car request created successfully!")

    return router.push({
      name: "travel-desk/TravelDeskEditPage",
      params: {
        travelDeskTravelRequestId: props.travelDeskTravelRequestId,
      },
    })
  } catch (error) {
    console.error(`Failed to create rental car: ${error}`, { error })
    snack.error(`Failed to create rental car: ${error}`)
  } finally {
    isSaving.value = false
  }
}

function returnToTravelDesk() {
  router.push({
    name: "travel-desk/TravelDeskEditPage",
    params: {
      travelDeskTravelRequestId: props.travelDeskTravelRequestId,
    },
  })
}

const breadcrumbs = computed(() => [
  {
    text: "Travel Desk",
    to: {
      name: "TravelDeskPage",
    },
  },
  {
    text: "Request",
    to: {
      name: "TravelDeskReadPage",
      params: {
        travelDeskTravelRequestId: props.travelDeskTravelRequestId,
      },
    },
  },
  {
    text: "New Rental Car",
    to: {
      name: "travel-desk/rental-cars/TravelDeskRentalCarNewPage",
      params: {
        travelDeskTravelRequestId: props.travelDeskTravelRequestId,
      },
    },
  },
])

useBreadcrumbs(breadcrumbs)
</script>
