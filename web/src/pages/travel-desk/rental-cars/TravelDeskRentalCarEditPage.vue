<template>
  <v-skeleton-loader
    v-if="isNil(travelDeskRentalCar)"
    type="card@2"
  />
  <HeaderActionsFormCard
    v-else
    ref="headerActionsFormCard"
    title="Edit Rental Car Request"
    header-tag="h2"
    lazy-validation
    @submit.prevent="saveAndReturn"
  >
    <template #header-actions>
      <v-btn
        class="my-0"
        color="error"
        outlined
        :loading="isDeleting"
        :block="smAndDown"
        @click="deleteAndReturn"
      >
        Delete
      </v-btn>
    </template>

    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <SectionHeader
          title="1. Trip Schedule"
          icon="mdi-calendar-month"
        />
        <v-row>
          <v-col cols="6">
            <DatePicker
              v-model="pickUpDate"
              label="Pick-up date *"
              :disabled="travelDeskRentalCar.matchFlightTimes"
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
              :disabled="travelDeskRentalCar.matchFlightTimes"
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
                v-model="travelDeskRentalCar.matchFlightTimes"
                label="Pick-up/Drop-off match flights"
                class="mt-0"
              />
            </v-col>
          </v-row>
        </v-sheet>

        <SectionHeader
          title="2. Location Details"
          icon="mdi-map-marker"
          header-class="mt-10"
        />
        <v-row>
          <v-col cols="12">
            <LocationsAutocomplete
              v-model="travelDeskRentalCar.pickUpCity"
              label="Pick-up City *"
              :rules="[required]"
              item-value="city"
              outlined
              required
            />
          </v-col>
          <v-col cols="12">
            <TravelDeskRentalCarLocationTypeSelect
              v-model="travelDeskRentalCar.pickUpLocation"
              label="Pick-up Location *"
              :rules="[required]"
              outlined
              required
              @input="resetPickUpLocationOtherUnlessOther"
            />
            <v-text-field
              v-if="travelDeskRentalCar.pickUpLocation === TravelDeskRentalCarLocationTypes.OTHER"
              v-model="travelDeskRentalCar.pickUpLocationOther"
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
                v-model="travelDeskRentalCar.sameDropOffLocation"
                label="Same Drop-off location?"
                class="mt-1"
                @change="resetDropOffLocationStates"
              />
            </v-col>
          </v-row>
          <v-row v-if="travelDeskRentalCar.sameDropOffLocation === false">
            <v-col cols="12">
              <LocationsAutocomplete
                v-model="travelDeskRentalCar.dropOffCity"
                label="Drop-off City *"
                :rules="[required]"
                item-value="city"
                outlined
                required
              />
            </v-col>
            <v-col cols="12">
              <TravelDeskRentalCarLocationTypeSelect
                v-model="travelDeskRentalCar.dropOffLocation"
                label="Drop-off Location *"
                :rules="[required]"
                outlined
                required
                @input="resetDropOffLocationOtherUnlessOther"
              />
              <v-text-field
                v-if="
                  travelDeskRentalCar.sameDropOffLocation === false &&
                  travelDeskRentalCar.dropOffLocation === TravelDeskRentalCarLocationTypes.OTHER
                "
                v-model="travelDeskRentalCar.dropOffLocationOther"
                label="Other Drop-off Location *"
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
        <SectionHeader
          title="3. Vehicle & Extra Info"
          icon="mdi-car"
          header-class="mt-10 mt-md-0"
        />
        <v-row>
          <v-col cols="12">
            <TravelDeskRentalCarVehicleTypeSelect
              v-model="travelDeskRentalCar.vehicleType"
              label="Vehicle Type *"
              :rules="[required]"
              outlined
              required
              @input="resetVehicleChangeRationaleIfCompact"
            />
          </v-col>
          <v-col
            v-if="travelDeskRentalCar.vehicleType !== TravelDeskRentalCarVehicleTypes.COMPACT"
            cols="12"
          >
            <v-textarea
              v-model="travelDeskRentalCar.vehicleChangeRationale"
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
              v-model="travelDeskRentalCar.additionalNotes"
              label="Additional Information"
              outlined
              rows="10"
              clearable
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-divider class="mt-md-10" />

    <template #actions>
      <v-btn
        color="primary"
        type="submit"
        :loading="isSaving"
        :block="smAndDown"
      >
        Save Rental Car Request
      </v-btn>
      <v-btn
        class="ml-0 ml-md-4"
        color="grey"
        :to="returnTo"
        :block="smAndDown"
      >
        Cancel
      </v-btn>
    </template>
  </HeaderActionsFormCard>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useRouter } from "vue2-helpers/vue-router"
import { isNil } from "lodash"

import blockedToTrueConfirm from "@/utils/blocked-to-true-confirm"
import { required } from "@/utils/validators"
import useRouteQuery from "@/use/utils/use-route-query"

import travelDeskRentalCarsApi, {
  TravelDeskRentalCarLocationTypes,
  TravelDeskRentalCarVehicleTypes,
} from "@/api/travel-desk-rental-cars-api"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useSnack from "@/use/use-snack"
import useTravelDeskRentalCar from "@/use/use-travel-desk-rental-car"

import DatePicker from "@/components/common/DatePicker.vue"
import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"
import SectionHeader from "@/components/common/SectionHeader.vue"
import TimeTextField from "@/components/common/TimeTextField.vue"
import YesNoRowRadioGroup from "@/components/common/YesNoRowRadioGroup.vue"

import TravelDeskRentalCarLocationTypeSelect from "@/components/travel-desk-rental-cars/TravelDeskRentalCarLocationTypeSelect.vue"
import TravelDeskRentalCarVehicleTypeSelect from "@/components/travel-desk-rental-cars/TravelDeskRentalCarVehicleTypeSelect.vue"

import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"
import useDisplayVuetify2 from "@/use/utils/use-display-vuetify2"

const props = defineProps<{
  travelDeskTravelRequestId: string
  travelDeskRentalCarId: string
}>()

const travelDeskRentalCarIdAsNumber = computed(() => parseInt(props.travelDeskRentalCarId))

const { travelDeskRentalCar, refresh } = useTravelDeskRentalCar(travelDeskRentalCarIdAsNumber)

const router = useRouter()
const defaultReturnTo = computed(() => {
  const routeLocation = router.resolve({
    name: "travel-desk/TravelDeskRequestEditPage",
    params: {
      travelDeskTravelRequestId: props.travelDeskTravelRequestId,
    },
  })

  return routeLocation.href
})
const returnTo = useRouteQuery("returnTo", defaultReturnTo)

const DEFAULT_TIME = "12:00"

const pickUpDate = ref("")
const pickUpTime = ref(DEFAULT_TIME)
const dropOffDate = ref("")
const dropOffTime = ref(DEFAULT_TIME)

watch(
  () => travelDeskRentalCar.value?.pickUpDate,
  (isoDate) => {
    if (isNil(isoDate)) return

    const date = new Date(isoDate)
    pickUpDate.value = date.toISOString().split("T")[0]
    pickUpTime.value = date.toISOString().split("T")[1].substring(0, 5)
  },
  { immediate: true }
)

watch(
  () => travelDeskRentalCar.value?.dropOffDate,
  (isoDate) => {
    if (isNil(isoDate)) return

    const date = new Date(isoDate)
    dropOffDate.value = date.toISOString().split("T")[0]
    dropOffTime.value = date.toISOString().split("T")[1].substring(0, 5)
  },
  { immediate: true }
)

function resetPickUpLocationOtherUnlessOther(value: string) {
  if (isNil(travelDeskRentalCar.value)) return

  if (value !== TravelDeskRentalCarLocationTypes.OTHER) {
    travelDeskRentalCar.value.pickUpLocationOther = null
  }
}

function resetDropOffLocationOtherUnlessOther(value: string) {
  if (isNil(travelDeskRentalCar.value)) return

  if (value !== TravelDeskRentalCarLocationTypes.OTHER) {
    travelDeskRentalCar.value.dropOffLocationOther = null
  }
}

function resetDropOffLocationStates(value: boolean) {
  if (isNil(travelDeskRentalCar.value)) return

  if (value === true) {
    travelDeskRentalCar.value.dropOffCity = null
    travelDeskRentalCar.value.dropOffLocation = null
    travelDeskRentalCar.value.dropOffLocationOther = null
  }
}

function resetVehicleChangeRationaleIfCompact(value: string) {
  if (isNil(travelDeskRentalCar.value)) return

  if (value === TravelDeskRentalCarVehicleTypes.COMPACT) {
    travelDeskRentalCar.value.vehicleChangeRationale = null
  }
}

const headerActionsFormCard = ref<InstanceType<typeof HeaderActionsFormCard> | null>(null)
const isSaving = ref(false)
const snack = useSnack()

async function saveAndReturn() {
  if (isNil(travelDeskRentalCar.value)) return
  if (!headerActionsFormCard.value?.validate()) return

  travelDeskRentalCar.value.pickUpDate = `${pickUpDate.value}T${pickUpTime.value}:00.000Z`
  travelDeskRentalCar.value.dropOffDate = `${dropOffDate.value}T${dropOffTime.value}:00.000Z`

  isSaving.value = true
  try {
    await travelDeskRentalCarsApi.update(
      travelDeskRentalCarIdAsNumber.value,
      travelDeskRentalCar.value
    )
    snack.success("Rental car request updated successfully!")
    await refresh()

    return router.push(returnTo.value)
  } catch (error) {
    console.error(`Failed to update rental car request: ${error}`, { error })
    snack.error(`Failed to update rental car request: ${error}`)
  } finally {
    isSaving.value = false
  }
}

const isDeleting = ref(false)

async function deleteAndReturn() {
  if (!blockedToTrueConfirm("Are you sure you want to delete this rental car request?")) return

  isDeleting.value = true
  try {
    await travelDeskRentalCarsApi.delete(travelDeskRentalCarIdAsNumber.value)
    snack.success("Rental car request deleted successfully!")

    return router.push(returnTo.value)
  } catch (error) {
    console.error(`Failed to delete rental car request: ${error}`, { error })
    snack.error(`Failed to delete rental car request: ${error}`)
  } finally {
    isDeleting.value = false
  }
}

const { smAndDown } = useDisplayVuetify2()

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
      name: "travel-desk/TravelDeskRequestPage",
      params: {
        travelDeskTravelRequestId: props.travelDeskTravelRequestId,
      },
    },
  },
  {
    text: "Edit Rental Car Request",
    to: {
      name: "travel-desk/rental-cars/TravelDeskRentalCarEditPage",
      params: {
        travelDeskTravelRequestId: props.travelDeskTravelRequestId,
        travelDeskRentalCarId: props.travelDeskRentalCarId,
      },
    },
  },
])

useBreadcrumbs(breadcrumbs)
</script>
