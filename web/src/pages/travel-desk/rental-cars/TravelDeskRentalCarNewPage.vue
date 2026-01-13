<template>
  <HeaderActionsFormCard
    ref="headerActionsFormCard"
    title="New Rental Car"
    header-tag="h2"
    lazy-validation
    @submit.prevent="createAndReturn"
  >
    <v-row>
      <v-col
        cols="12"
        md="4"
      >
        <LocationsAutocomplete
          v-model="attributes.pickUpCity"
          label="Pick-Up City *"
          :rules="[required]"
          item-value="city"
          outlined
          required
        />
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <TravelDeskRentalCarLocationTypeSelect
          v-model="attributes.pickUpLocation"
          label="Pick-Up Location *"
          :rules="[required]"
          outlined
          required
          @input="resetPickUpLocationOtherUnlessOther"
        />
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <TravelDeskRentalCarVehicleTypeSelect
          v-model="attributes.vehicleType"
          label="Vehicle Type *"
          :rules="[required]"
          outlined
          required
          @input="resetVehicleChangeRationaleIfCompact"
        />
      </v-col>
    </v-row>

    <v-row v-if="attributes.pickUpLocation === TravelDeskRentalCarLocationTypes.OTHER">
      <v-col cols="12">
        <v-text-field
          v-model="attributes.pickUpLocationOther"
          label="Other Pick-Up Location *"
          :rules="[required]"
          outlined
          required
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <YesNoRowRadioGroup
          v-model="attributes.sameDropOffLocation"
          label="Same Drop-off Location?"
          @change="resetDropOffLocationStates"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <YesNoRowRadioGroup
          v-model="attributes.matchFlightTimes"
          label="Match Flight Times?"
        />
      </v-col>
    </v-row>

    <v-row v-if="attributes.sameDropOffLocation === false">
      <v-col
        cols="12"
        md="6"
      >
        <LocationsAutocomplete
          v-model="attributes.dropOffCity"
          label="Drop-off City *"
          :rules="[required]"
          item-value="city"
          outlined
          required
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <TravelDeskRentalCarLocationTypeSelect
          :value="attributes.dropOffLocation"
          label="Drop-off Location *"
          :rules="[required]"
          outlined
          required
          @input="updateDropOffLocation"
        />
      </v-col>
    </v-row>

    <v-row
      v-if="
        attributes.sameDropOffLocation === false &&
        attributes.dropOffLocation === TravelDeskRentalCarLocationTypes.OTHER
      "
    >
      <v-col cols="12">
        <v-text-field
          v-model="attributes.dropOffLocationOther"
          label="Other Drop-off Location *"
          :rules="[required]"
          outlined
          required
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        md="3"
      >
        <v-text-field
          v-model="pickUpDate"
          label="Pick-Up Date *"
          type="date"
          :rules="[required]"
          outlined
          required
        />
      </v-col>
      <v-col
        cols="12"
        md="3"
      >
        <TimeTextField
          v-model="pickUpTime"
          label="Pick-Up Time *"
          :rules="[required]"
        />
      </v-col>
      <v-col
        cols="12"
        md="3"
      >
        <v-text-field
          v-model="dropOffDate"
          label="Drop-off Date *"
          type="date"
          :rules="[required]"
          outlined
          required
        />
      </v-col>
      <v-col
        cols="12"
        md="3"
      >
        <TimeTextField
          v-model="dropOffTime"
          label="Drop-off Time *"
          :rules="[required]"
        />
      </v-col>
    </v-row>

    <v-row v-if="attributes.vehicleType !== TravelDeskRentalCarVehicleTypes.COMPACT">
      <v-col cols="12">
        <v-textarea
          v-model="attributes.vehicleChangeRationale"
          label="Reason for Vehicle Change *"
          :rules="[required]"
          outlined
          rows="3"
          required
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-textarea
          v-model="attributes.additionalNotes"
          label="Additional Notes"
          outlined
          rows="3"
        />
      </v-col>
    </v-row>

    <template #actions>
      <v-btn
        color="primary"
        type="submit"
        :loading="isSaving"
        :disabled="isSaving"
      >
        Save Rental Car
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

const attributes = ref<Partial<TravelDeskRentalCar>>({
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
    attributes.value.pickUpLocationOther = undefined
  }
}

function updateDropOffLocation(value: string) {
  attributes.value.dropOffLocation = value
  if (value !== TravelDeskRentalCarLocationTypes.OTHER) {
    attributes.value.dropOffLocationOther = undefined
  }
}

function resetDropOffLocationStates(value: boolean) {
  if (value === true) {
    attributes.value.dropOffCity = undefined
    attributes.value.dropOffLocation = undefined
    attributes.value.dropOffLocationOther = undefined
  }
}

function resetVehicleChangeRationaleIfCompact(value: string) {
  if (value === TravelDeskRentalCarVehicleTypes.COMPACT) {
    attributes.value.vehicleChangeRationale = undefined
  }
}

const headerActionsFormCard = ref<InstanceType<typeof HeaderActionsFormCard> | null>(null)
const isSaving = ref(false)
const snack = useSnack()
const router = useRouter()

async function createAndReturn() {
  if (!headerActionsFormCard.value?.validate()) return

  attributes.value.pickUpDate = `${pickUpDate.value}T${pickUpTime.value}:00.000Z`
  attributes.value.dropOffDate = `${dropOffDate.value}T${dropOffTime.value}:00.000Z`

  isSaving.value = true
  try {
    await travelDeskRentalCarsApi.create(attributes.value)
    snack.success("Rental car created successfully")

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
